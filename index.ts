import NDK, { NDKEvent, NDKPrivateKeySigner, NostrEvent} from '@nostr-dev-kit/ndk'

process.env.DEBUG = 'ndk:*'

const ndk = new NDK({
  explicitRelayUrls: [ 'wss://relay.nostr.band' ]
})

const signer = NDKPrivateKeySigner.generate()

async function subscribeTest() {
  // init NDK
  await ndk.connect()

  // subscribe to incoming events
  const sub = ndk.subscribe({ kinds: [1]}, { closeOnEose: false })

  sub.on('event', (event) => {
    console.log(event)
  })

  sub.on('eose', (data) => {
    console.log('eose', data)
  })

  // keep node process running
  setInterval(() => {
    console.log('tick')
  }, 1000);

}

subscribeTest() // No events received

async function publishTest() {
  const ndkEvent = new NDKEvent(ndk)
  ndkEvent.kind = 1
  const ca = Math.floor(Date.now() / 1000)
  ndkEvent.content = 'Test message: ' + ca
  ndkEvent.created_at = ca 
  const user = await signer.user()
  ndkEvent.pubkey = user.pubkey
  const sig = await signer.sign(ndkEvent as NostrEvent)
  ndkEvent.sig = sig
  ndkEvent.publish()
  // console.log('published', ndkEvent)
}

publishTest() // Error: No relay was able to receive the event