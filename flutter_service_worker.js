'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {".git/COMMIT_EDITMSG": "a8297d555dd34879e8e48e1cf12acefa",
".git/config": "afb3de77289931e36584fecc97586068",
".git/description": "a0a7c3fff21f2aea3cfa1d0316dd816c",
".git/FETCH_HEAD": "b556bda4f81b9d350a48a687d9559ea6",
".git/HEAD": "cf7dd3ce51958c5f13fece957cc417fb",
".git/hooks/applypatch-msg.sample": "ce562e08d8098926a3862fc6e7905199",
".git/hooks/commit-msg.sample": "579a3c1e12a1e74a98169175fb913012",
".git/hooks/fsmonitor-watchman.sample": "a0b2633a2c8e97501610bd3f73da66fc",
".git/hooks/post-update.sample": "2b7ea5cee3c49ff53d41e00785eb974c",
".git/hooks/pre-applypatch.sample": "054f9ffb8bfe04a599751cc757226dda",
".git/hooks/pre-commit.sample": "5029bfab85b1c39281aa9697379ea444",
".git/hooks/pre-merge-commit.sample": "39cb268e2a85d436b9eb6f47614c3cbc",
".git/hooks/pre-push.sample": "2c642152299a94e05ea26eae11993b13",
".git/hooks/pre-rebase.sample": "56e45f2bcbc8226d2b4200f7c46371bf",
".git/hooks/pre-receive.sample": "2ad18ec82c20af7b5926ed9cea6aeedd",
".git/hooks/prepare-commit-msg.sample": "2b5c047bdb474555e1787db32b2d2fc5",
".git/hooks/push-to-checkout.sample": "c7ab00c7784efeadad3ae9b228d4b4db",
".git/hooks/sendemail-validate.sample": "4d67df3a8d5c98cb8565c07e42be0b04",
".git/hooks/update.sample": "647ae13c682f7827c22f5fc08a03674e",
".git/index": "7704d487419ef0c9783e24e5a34ad82b",
".git/info/exclude": "036208b4a1ab4a235d75c181e685e5a3",
".git/logs/HEAD": "2625f726b1f698b6648c4b7dfbde8c4b",
".git/logs/refs/heads/main": "d00a645591a2f3429abe8202f396acf7",
".git/logs/refs/remotes/origin/main": "a6e01fcac84e4adc54b0874b1b1dc0ef",
".git/objects/05/a9058f513cce5faf1704e06e3c150688b0a01f": "e8d02f60cf87abd4c1de4b153dd696dc",
".git/objects/08/3df416a779659343a45eda9827e6dc24a4438b": "b2e341831a07afd4d95b7ea38fa41d9f",
".git/objects/0e/220bd2d6ec71063654dc29be714aa8269094ba": "cad71e585aeee8dc21032dfe6abb315c",
".git/objects/0f/70672226fda23560747063ed3ba2e239c0b413": "014e79e9d654494db2284035ec0fe990",
".git/objects/12/0cfeb5e74dce78369e188bb0ab05ce38d93763": "3d6fcfd58dad7ded16c6a5e6a501b6ee",
".git/objects/17/e4f09ec0a46b9056c9ddf5c8d4be439f4abd2e": "34a2250aaabf619ab09a4883be77c8c3",
".git/objects/18/6812485bf9f3f6a28dae07f6a4903de5d99b43": "f9f0e65a44570bb667f6005acc050a56",
".git/objects/1f/45b5bcaac804825befd9117111e700e8fcb782": "7a9d811fd6ce7c7455466153561fb479",
".git/objects/1f/cce61bf6081803619e56b75c827dcb76020e18": "1d504d34054d7f095e6e281e62e79ec2",
".git/objects/21/3824867a974ef257930128d43bd1b5e89c926e": "3142fec1c66ec1a6228e2f6d0071a07d",
".git/objects/22/62b7078b92e2a4ce57095e0744521a25841532": "c0932a9da34c80634b0741dcea92bebc",
".git/objects/27/a297abdda86a3cbc2d04f0036af1e62ae008c7": "51d74211c02d96c368704b99da4022d5",
".git/objects/27/c4e5d578017cad4786909a426133cbcbc489b5": "e53b942e7f2ef5cd002d1ffd98af1f70",
".git/objects/2c/34a8dd806804ef68f38af4c1be5ed0d4627d90": "d3da4ad9dd03970da446bf25b4e9e84f",
".git/objects/2d/4646b875a2fbc75a90baa87f1a7fe3f56eadb1": "af27b7548968cc8fb381beddbb83384b",
".git/objects/2d/d7d8410a303b5a41b95d78a2c6c1c067d877d8": "1b09c4220f06257183a0e0145cc264d0",
".git/objects/30/98951bad3676844fb0b47f71e1e9d682372ea0": "d7e10401603dc5e62399dcdd3e612259",
".git/objects/30/d4fd00b0e426a93dfd3887efbe4a2e045abd45": "a0bb9fb6ccd05fe811b876ac452c817d",
".git/objects/30/ea57edcbc44d4d146b47631e0f43d4a0589006": "b10a5c3dfef9518a3d5b441e64835906",
".git/objects/36/0417c11e25ed3ecc8eac09c9799e3f7982f917": "bf7964c8b1e1ae1449f6efd23b64dfa7",
".git/objects/43/55f8cddccfd76924dbfd2a9959dcd70b0a8e5a": "4b6ce85cd80f35bd8324fac852ed1bb6",
".git/objects/46/4ab5882a2234c39b1a4dbad5feba0954478155": "2e52a767dc04391de7b4d0beb32e7fc4",
".git/objects/4b/1a59fadde66566809ecf7ef9ff6aeb72ef9b82": "162eb5cee7cb46a93d9dc6f894ee83d1",
".git/objects/52/84c00c195750151b12887ac8c3634162bb0fa6": "58c31d4158a78c338cbf40fc9fbbc887",
".git/objects/5e/e200a9be542e6b0b686303a87a35fe5d659186": "00aa6f94d1f5a33045b0a7b756ad8d2c",
".git/objects/63/6931bcaa0ab4c3ff63c22d54be8c048340177b": "8cc9c6021cbd64a862e0e47758619fb7",
".git/objects/67/920e6a22293ff399a04fa297b7a2b3810cd7ee": "282c152575d0012dc68982bd77886b9a",
".git/objects/6a/54a47a8bb8c715c414f9ebf937a3bb5b730d65": "32a4ece40b78c8c8eea0f0f9348af287",
".git/objects/6a/de4ecc99c985ff2aff1f9aa8cfecd6ccfe75fe": "da8319fc0c84e5fad97f573cfd83b05e",
".git/objects/6d/5f0fdc7ccbdf7d01fc607eb818f81a0165627e": "2b2403c52cb620129b4bbc62f12abd57",
".git/objects/73/7f149c855c9ccd61a5e24ce64783eaf921c709": "1d813736c393435d016c1bfc46a6a3a6",
".git/objects/78/882ef82a2092d2e4d66226aeef13d61423f886": "5ce5bf14fa1755dad3c84a8cbe77be3d",
".git/objects/79/a67a3c3299a7eabe23dc084d85dee2a547a31e": "f43e1a945ce7f174e6480762537dbec4",
".git/objects/7a/a42a64b00c8d747629232c4943bbfebe8b32ad": "9d6e0082464079e72db445c170314afc",
".git/objects/7f/cb146f7a4d3eb613e23345353701d7f010b132": "1791f1835b43b32100c49d09db6dbb03",
".git/objects/80/6df47e750cec389b7dd4593c49cb3416e3ae41": "95585923010e7a1474df80d07d35c073",
".git/objects/80/99d07362d1e58428e319162cd68020eddc1bf6": "55dba7727d78680a0bbfbb122126b539",
".git/objects/85/6a39233232244ba2497a38bdd13b2f0db12c82": "eef4643a9711cce94f555ae60fecd388",
".git/objects/85/e4323ce2b5e8ae181560da68d9f3ef02bb1f95": "6636b71de2c38a898564e93b8dc58dea",
".git/objects/88/cfd48dff1169879ba46840804b412fe02fefd6": "e42aaae6a4cbfbc9f6326f1fa9e3380c",
".git/objects/8a/807b3c160898c879252b07d1591858ab5f1eba": "d0ce9632876d29ac47abb6d38109d0c5",
".git/objects/8c/59773bee8314a8ffb4431593d0fb49f52e34c6": "2eb993d30677573ffd0e58484cc6a514",
".git/objects/8f/1bc77a78437963bee37e82a0be92a754db485a": "4b458cf93638812b419133cec57f9153",
".git/objects/93/9c0839b893b82022f7523213951b70f99d2d0f": "1b2ffbd6274847220d733b3113bbc706",
".git/objects/96/0958baf8a1b2752b43e086fb5a7d31cd879054": "a273cb8fbfed89ff1c0792e648320a19",
".git/objects/97/8a4d89de1d1e20408919ec3f54f9bba275d66f": "dbaa9c6711faa6123b43ef2573bc1457",
".git/objects/99/1830e27acf0d204e722412d4904ab9f032b493": "96fdfc55a9d388c757516bd02176541d",
".git/objects/99/5230c1bc80c31159654deb4d75c79736cc6b46": "ccf641375a6a5da36ad6b867d6f0d7de",
".git/objects/9f/58ab44e03a6db87ec8cbe0e586e24ea556c441": "c4f783c03e56aeaf0864b699f3ca6463",
".git/objects/a7/264c06ada505f56295b1ac5d3411d7fc8c1d84": "f4ab7260275377dff029aa784b42460a",
".git/objects/a8/b8d3ac63a762d6f18de85583a790177e86b2c5": "fd2dc8daab227c76f3051dad9d43bb7f",
".git/objects/a8/b913b2d09a2b71a1b0d91547c4873592e54250": "23c79e2cdd0c74f9f0d9bb57718faa51",
".git/objects/ac/ea2dd9fa3e51a3e30a678f642866bae5888af1": "038d73a46f28231c00b81d5eb6555802",
".git/objects/ad/e1b284ad3c5d87743cab0e1bd3e79d7bb008db": "0586f43db5949d81d06704d99308945a",
".git/objects/ae/806b35d85991d9959f0f279385cad73fd85b5a": "50cc026be10456279e4fdba80ddc973b",
".git/objects/ae/a07770f2344b5dbf718527b22c80a971d3f5cb": "24b8e3c7892817db2bab288a74ad213e",
".git/objects/ae/a8d358546b711daf4660b7283173cb06163cc1": "a873188c847c9f0b0b247e350367cae1",
".git/objects/af/31ef4d98c006d9ada76f407195ad20570cc8e1": "a9d4d1360c77d67b4bb052383a3bdfd9",
".git/objects/af/b7b15398ed66ec1dee388472244aaf364c9b8e": "58280e39d4e1771c602acd49f1f5353c",
".git/objects/b1/5ad935a6a00c2433c7fadad53602c1d0324365": "8f96f41fe1f2721c9e97d75caa004410",
".git/objects/b1/afd5429fbe3cc7a88b89f454006eb7b018849a": "e4c2e016668208ba57348269fcb46d7b",
".git/objects/b4/6f671bb28b970635361472417b26634aa78f7e": "2e27b003be0ac5e74408028785490708",
".git/objects/b7/49bfef07473333cf1dd31e9eed89862a5d52aa": "36b4020dca303986cad10924774fb5dc",
".git/objects/b7/975bf0ef76f2b263913b5a63909334f7526829": "7b4cdac8f70375fb0d5c1d82ed1a1846",
".git/objects/b9/2a0d854da9a8f73216c4a0ef07a0f0a44e4373": "f62d1eb7f51165e2a6d2ef1921f976f3",
".git/objects/ba/5317db6066f0f7cfe94eec93dc654820ce848c": "9b7629bf1180798cf66df4142eb19a4e",
".git/objects/c2/7dc53b0201c91a17bbef92e3ee899cf32294d6": "2ecd1c16489a1eb02b910da98d9d2c48",
".git/objects/c3/e81f822689e3b8c05262eec63e4769e0dea74c": "8c6432dca0ea3fdc0d215dcc05d00a66",
".git/objects/c6/06caa16378473a4bb9e8807b6f43e69acf30ad": "ed187e1b169337b5fbbce611844136c6",
".git/objects/c7/b2dd2e5d5e7b33652f2a8b5a86bbd82be3a603": "a46c4dcb1667566ddaf64c21b9ce8106",
".git/objects/cf/8ece5890e6c68abd27fda5338a9d48d4e0af11": "4ba5a16825c984914c0821daf86f59d0",
".git/objects/d0/7a67aa8358dddcaf725c2fdc4bb2fca54bd620": "da53a6ef00523687e0dae9f245170418",
".git/objects/d2/8d10108e5152c6221687e443567225cfd057b3": "cd954062e2e1db63a10cc9cd5788dba4",
".git/objects/d4/3532a2348cc9c26053ddb5802f0e5d4b8abc05": "3dad9b209346b1723bb2cc68e7e42a44",
".git/objects/d6/9c56691fbdb0b7efa65097c7cc1edac12a6d3e": "868ce37a3a78b0606713733248a2f579",
".git/objects/d8/c96cb1785698d9040371c8535a92276896738c": "34c99fb498726ef59dde0dfc4f664594",
".git/objects/da/99ed1271ffb13062a592bb541d1f2494b22f22": "6fb9e7a452c37d3a8e46edd0e96805ae",
".git/objects/df/81b2c07b1a6179b3ab827964e5d7d340e51260": "cf92b9d0d520b1cd067eb0b50ff86a25",
".git/objects/e3/e4126837f561f6b7e645748e9c5b144eeeb435": "6ebd8ff14c17eb965553861f827d3cc9",
".git/objects/ea/bf89ebd026e43f5e906fa0837107bc3064da99": "9ecb7146d0e59ab8033722847531fdd8",
".git/objects/eb/9b4d76e525556d5d89141648c724331630325d": "37c0954235cbe27c4d93e74fe9a578ef",
".git/objects/ec/361605e9e785c47c62dd46a67f9c352731226b": "d1eafaea77b21719d7c450bcf18236d6",
".git/objects/f0/c57f0d2fe9823b1cec6751c665c1c32050b781": "bb7e04614ec1f9829f083527cd461f30",
".git/objects/f2/04823a42f2d890f945f70d88b8e2d921c6ae26": "6b47f314ffc35cf6a1ced3208ecc857d",
".git/objects/f2/da26cc60527f9dab30d3c74a538e86c1b1f28d": "4a3a0192e30b3565bb222d2feb972a3a",
".git/objects/f5/b3dca86ce7acec353002e414ab94c9b5571722": "43d5723a48196a7b1c99e928652edda6",
".git/refs/heads/main": "731193175c347a380fd3c5231babbe45",
".git/refs/remotes/origin/main": "731193175c347a380fd3c5231babbe45",
"assets/AssetManifest.bin": "c5e2b6ffeef37eb6cc68a4f1ec4bfb03",
"assets/AssetManifest.bin.json": "e072d963ced783de47eee87e3be5d3d8",
"assets/AssetManifest.json": "c6eb06f4cf90363452342bdb3e4709ea",
"assets/assets/images/accepted.png": "98e3fefd437c6d23497639aae1e32117",
"assets/assets/images/cancelled.png": "86661be2de89da399a02bd8a7198d75c",
"assets/assets/images/completed.png": "0568ba87e185b2f80cb707655171120c",
"assets/assets/images/cooking.png": "a96782088b10bd8486536c0dff4a2441",
"assets/assets/images/facebook.png": "3b149a0e5a55d5a92f114f091364de40",
"assets/assets/images/github.png": "73f6facb5690334ce00e33382c60bda6",
"assets/assets/images/google.png": "66047864288a9df7b69c6bc3c94d16f5",
"assets/assets/images/illustration-1.png": "5ad69c7624875b76c84eebb06806ff46",
"assets/assets/images/illustration-2.png": "9f8a806312ecfe03313dabe5cf70a63f",
"assets/assets/images/image.png": "bd3e70b9b7ef71e52e90bc138acd8b2a",
"assets/assets/images/ontheway.png": "590c9ceb370dd3942fe18402d8590c66",
"assets/assets/images/order-food.png": "327acd71e8e346341a66b01f6fec60f8",
"assets/assets/images/pending.png": "23e9ae1a684e32806475887853a93783",
"assets/assets/images/rejected.png": "b3f6dfbc1f651ece2462006066ec4177",
"assets/assets/images/seller.png": "4acb03667b5647a657ee576baef45914",
"assets/assets/images/total.png": "7ae659c15c8e066bbdbe2bced9f2a528",
"assets/assets/sounds/notification.mp3": "a295a826294523fd9fa54fade628df07",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "c00c278b26c3bf185ea73a0a1f89045a",
"assets/NOTICES": "1319c2e7ec6ef4eab2d27d0d65084096",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "e986ebe42ef785b27164c36a9abc7818",
"assets/packages/flutter_sound_web/howler/howler.js": "2bba823e6b4d71ea019d81d384672823",
"assets/packages/flutter_sound_web/src/flutter_sound.js": "aecd83c80bf4faace0bcea4cd47ab307",
"assets/packages/flutter_sound_web/src/flutter_sound_player.js": "6bf84579813fd481ec5e24e73927500d",
"assets/packages/flutter_sound_web/src/flutter_sound_recorder.js": "f7ac74c4e0fd5cd472d86c3fe93883fc",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "26eef3024dbc64886b7f48e1b6fb05cf",
"canvaskit/canvaskit.js.symbols": "efc2cd87d1ff6c586b7d4c7083063a40",
"canvaskit/canvaskit.wasm": "e7602c687313cfac5f495c5eac2fb324",
"canvaskit/chromium/canvaskit.js": "b7ba6d908089f706772b2007c37e6da4",
"canvaskit/chromium/canvaskit.js.symbols": "e115ddcfad5f5b98a90e389433606502",
"canvaskit/chromium/canvaskit.wasm": "ea5ab288728f7200f398f60089048b48",
"canvaskit/skwasm.js": "ac0f73826b925320a1e9b0d3fd7da61c",
"canvaskit/skwasm.js.symbols": "96263e00e3c9bd9cd878ead867c04f3c",
"canvaskit/skwasm.wasm": "828c26a0b1cc8eb1adacbdd0c5e8bcfa",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c",
"favicon.png": "41f3deb69a0538b121bceebf05a7bcf1",
"flutter.js": "4b2350e14c6650ba82871f60906437ea",
"flutter_bootstrap.js": "e2ce5d64de6fcd3e1ec1df0577ce917e",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "2951af61f265540dedd3b6e304212fef",
"/": "2951af61f265540dedd3b6e304212fef",
"main.dart.js": "eaec6299c2fa956b535b631f178f93c2",
"manifest.json": "48644fe2f828ba66ec195b122d721ef2",
"version.json": "b9aa8731cb781db62eae25938cbb4f0c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
