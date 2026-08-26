import { useEffect, useRef, useState } from 'react'
import { useOrders } from './useOrders'

// Sound + browser notification when a genuinely new pending order arrives.
// Browsers block autoplay until the page has been interacted with, so we
// expose soundEnabled/enableSound and prime the audio element on the user's click.
export function useNewOrderAlerts() {
  const { onNewOrders } = useOrders()
  const audioRef = useRef(null)
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('rp-sound') !== 'off')
  const soundRef = useRef(soundEnabled)
  soundRef.current = soundEnabled

  useEffect(() => {
    audioRef.current = new Audio('notification.mp3')
    audioRef.current.preload = 'auto'
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  useEffect(() => {
    return onNewOrders((fresh) => {
      if (soundRef.current && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(fresh.length === 1 ? 'New order!' : `${fresh.length} new orders!`, {
            body: fresh.map((o) => `#${o.order_id || o.id} — $${o.total}`).join('\n'),
            icon: 'favicon.png',
            tag: 'swiftgo-new-order',
          })
        } catch (e) { /* Notification constructor unsupported on some mobile browsers */ }
      }
    })
  }, [onNewOrders])

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem('rp-sound', next ? 'on' : 'off')
      if (next && audioRef.current) {
        // User gesture: prime autoplay permission with a silent play
        audioRef.current.muted = true
        audioRef.current.play().then(() => {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          audioRef.current.muted = false
        }).catch(() => { audioRef.current.muted = false })
      }
      return next
    })
  }

  return { soundEnabled, toggleSound }
}
