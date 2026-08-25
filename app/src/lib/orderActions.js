import { doc, updateDoc } from 'firebase/firestore'
import { ref, get } from 'firebase/database'
import { httpsCallable } from 'firebase/functions'
import { db, rtdb, functions } from './firebase'

const ACCEPT_MESSAGES = [
  (r) => `Good news! Your order from ${r} has been accepted... and it's about to get delicious!`,
  (r) => `Your order from ${r} has been accepted! Time to celebrate with some tasty bites!`,
  (r) => `Your order from ${r} has been accepted! It's about to be a flavor explosion, so get ready!`,
  (r) => `The chef is fired up! Your order from ${r} has been accepted and is on the way to your stomach!`,
  (r) => `Woohoo! Your order from ${r} has been accepted! Prepare your taste buds for an adventure!`,
  (r) => `Your stomach just got a VIP pass! Your order from ${r} has been accepted. Let the feast begin!`,
  (r) => `Hold tight! Your order from ${r} has been accepted and is ready to be devoured!`,
  (r) => `Big news: your order from ${r} has been accepted! Get your fork ready, it's about to get delicious!`,
]

async function notifyCustomer(userId, title, body) {
  try {
    const tokenSnap = await get(ref(rtdb, `users/${userId}/firebaseMessagingToken`))
    const token = tokenSnap.val()
    if (!token) return false
    const sendNotification = httpsCallable(functions, 'sendNotification')
    await sendNotification({ token, title, body })
    return true
  } catch (e) {
    // Notification is best-effort — never block the status change on it
    console.warn('customer notification failed', e)
    return false
  }
}

export async function setOrderStatus(order, status, restName) {
  await updateDoc(doc(db, 'orders', order.id), { status })
  if (!order.user_id) return
  if (status === 'accepted') {
    const msg = ACCEPT_MESSAGES[Math.floor(Math.random() * ACCEPT_MESSAGES.length)](restName || 'the restaurant')
    notifyCustomer(order.user_id, 'Order Accepted', msg)
  } else if (status === 'rejected') {
    notifyCustomer(
      order.user_id,
      'Order Update',
      `Unfortunately ${restName || 'the restaurant'} could not take your order this time. You have not been charged.`
    )
  } else if (status === 'preparing') {
    notifyCustomer(
      order.user_id,
      'Cooking has started!',
      `${restName || 'The restaurant'} is now preparing your order. Hang tight!`
    )
  }
}
