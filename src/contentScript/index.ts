// content.js

import { convertToCosmosAddress } from 'bitbadgesjs-sdk'
import { PublicKey } from '@solana/web3.js'

function checkForString() {
  //scan through all unique elements in the DOM and check if valid addresses
  const words = document.body.innerHTML.split(' ')

  const uniqueWords = [...new Set(words)].filter((x) => x.length > 20)
  const allWords = []
  for (let i = 0; i < uniqueWords.length; i++) {
    const word = uniqueWords[i]
    const matches = word.match(/[a-zA-Z0-9]+/g)
    if (matches) {
      allWords.push(...matches)
    }
  }

  const addrs = allWords
    .map((word) => {
      try {
        const bech32Match = word.match(
          /(cosmos1[a-z0-9]{38})|(0x[a-fA-F0-9]{40})|(bc1[a-zA-HJ-NP-Z0-9]{30,50})/g,
        )
        let solanaMatch = word.match(/[1-9A-HJ-NP-Za-km-z]{44}/g)
        let isOnCurve = solanaMatch ? PublicKey.isOnCurve(new PublicKey(solanaMatch[0])) : false

        const validAddr =
          bech32Match && bech32Match.length
            ? bech32Match[0]
            : solanaMatch && solanaMatch.length && isOnCurve && word.length === 44
              ? solanaMatch[0]
              : null

        return validAddr ? validAddr : null
      } catch (error) {
        return null
      }
    })
    .filter((x) => x && convertToCosmosAddress(x))
    .slice(0, 10)

  chrome.runtime.sendMessage({ type: 'SET_INFO', data: addrs })
}

// Optionally, observe changes in the DOM to detect dynamic content
const observer = new MutationObserver(checkForString)
observer.observe(document.body, { childList: true, subtree: true })
