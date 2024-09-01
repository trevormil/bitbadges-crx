import { useEffect, useState } from 'react'

import {
  BatchBadgeDetailsArray,
  BigIntify,
  BitBadgesAPI,
  BitBadgesCollection,
  BitBadgesUserInfo,
  NumberType,
  UintRangeArray,
} from 'bitbadgesjs-sdk'
import { AssetConditionGroup } from 'blockin'
import { BadgeAvatar } from '../components/BadgeAvatar'
import { AddressDisplay } from '../components/address/AddressDisplay'
import { AddressSelect } from '../components/address/AddressSelect'
import { mainnet } from 'wagmi/chains'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../styles/globals.css'
import '../styles/index.css'
import '../styles/antd-override-styles.css'

export type DesiredNumberType = bigint
export const ConvertFunction = BigIntify
const BACKEND_URL = 'https://api.bitbadges.io'
export const BitBadgesApi = new BitBadgesAPI({
  apiUrl: BACKEND_URL,
  convertFunction: BigIntify,
})

const queryClient = new QueryClient()
import { http, createConfig } from 'wagmi'

export const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
    // [sepolia.id]: http(),
  },
})

export const Popup = () => {
  const [addresses, setAddresses] = useState<string[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [satisfiesReqs, setSatisfiesReqs] = useState<boolean[]>([])
  const [selectedAccount, setSelectedAccount] = useState<BitBadgesUserInfo<bigint> | null>(null)
  const [collections, setCollections] = useState<BitBadgesCollection<bigint>[]>([])
  const [settings, setSettings] = useState<{
    expectedBalances: {
      label: string
      assetOwnershipRequirements: AssetConditionGroup<NumberType>
    }[]
  } | null>(null)

  const expectedBalances = settings?.expectedBalances ?? []

  useEffect(() => {
    chrome.storage.sync.get(['settings'], (result) => {
      if (!result || !result.settings) {
        return
      }

      setSettings(result.settings)
    })
  }, [])

  useEffect(() => {
    if (!selectedAddress) {
      return
    }

    BitBadgesApi?.getAccounts({
      accountsToFetch: [
        {
          address: selectedAddress,
          viewsToFetch: [{ viewId: 'badgesCollected', viewType: 'badgesCollected', bookmark: '' }],
        },
      ],
    }).then((res) => {
      setSelectedAccount(res.accounts[0])

      const badgeIdsArr = BatchBadgeDetailsArray.From(
        res.accounts[0].collected.map((x) => {
          return {
            collectionId: x.collectionId,
            badgeIds: UintRangeArray.From(x.balances.map((y) => y.badgeIds).flat()).sortAndMerge(),
          }
        }),
      )

      const pageDetails = badgeIdsArr.getPage(1, 10)

      BitBadgesApi?.getCollections({
        collectionsToFetch: pageDetails.map((x) => {
          return { collectionId: x.collectionId, metadataToFetch: { badgeIds: x.badgeIds } }
        }),
      }).then((res) => {
        setCollections(res.collections)
      })
    })

    async function verifyOwnershipRequirements() {
      if (!selectedAddress) {
        return
      }

      if (!BitBadgesApi) {
        return
      }

      const satisfiesArr = []
      for (const expectedBalance of expectedBalances) {
        try {
          const result = await BitBadgesApi.verifyOwnershipRequirements({
            assetOwnershipRequirements: expectedBalance.assetOwnershipRequirements,
            address: selectedAddress,
          })
          satisfiesArr.push(result.success)
        } catch (e) {
          throw e
        }
      }
      setSatisfiesReqs(satisfiesArr)
    }

    verifyOwnershipRequirements()
  }, [selectedAddress])

  const badgeIdsArr = BatchBadgeDetailsArray.From(
    selectedAccount?.collected.map((x) => {
      return {
        collectionId: x.collectionId,
        badgeIds: UintRangeArray.From(x.balances.map((y) => y.badgeIds).flat()).sortAndMerge(),
      }
    }) ?? [],
  )
  const pageDetails = badgeIdsArr.getPage(1, 10)

  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <main className="layout gradient-bg p-2 " style={{ width: 357, height: 600 }}>
            <div className="" style={{ minHeight: 500 }}>
              <div>
                <AddressSelect
                  switchable
                  addressOrUsername={selectedAddress ?? ''}
                  onUserSelect={(acc) => {
                    setAddresses([...addresses, acc].filter((x, i, a) => a.indexOf(x) === i))
                    setSelectedAddress(acc)
                  }}
                  suggestedAddresses={addresses}
                />
              </div>
              {selectedAccount && (
                <>
                  <div className="text-center">
                    <a
                      href={`https://bitbadges.io/account/${selectedAddress}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Full Profile
                    </a>
                  </div>
                  {!!selectedAccount?.createdAt && selectedAccount?.createdAt > 0 && (
                    <div className="mx-4 flex flex-between mt-1">
                      <div className="font-bold"> {'Profile Age'} </div>
                      <div>
                        <div className="">
                          {new Date(Number(selectedAccount?.createdAt)).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {satisfiesReqs.map((satisfies, idx) => {
                    return (
                      <div key={idx} className="mx-4 flex flex-between mt-1">
                        <div className="font-bold"> {expectedBalances[idx].label} </div>
                        <div>
                          {satisfies && <div style={{ color: 'green' }}>✅</div>}
                          {satisfies === false && <div style={{ color: 'red' }}>❌</div>}
                        </div>
                      </div>
                    )
                  })}
                  <div className="mt-4 font-bold text-center">Portfolio Preview</div>
                  <div className="flex-center flex-wrap mx-4">
                    {badgeIdsArr.length === 0 && (
                      <div className="text-center">No badges found.</div>
                    )}
                    {pageDetails.flatMap((x) => {
                      for (const badgeIdRange of x.badgeIds) {
                        for (let i = badgeIdRange.start; i <= badgeIdRange.end; i++) {
                          const collection = collections.find(
                            (y) => y.collectionId === x.collectionId,
                          )
                          const metadata = collection?.getBadgeMetadata(BigInt(i))

                          if (!metadata || !collection) {
                            return null
                          }

                          return (
                            <div className="flex-center flex-wrap m-1">
                              <div className="">
                                <div className="flex-center">
                                  <BadgeAvatar
                                    collection={collection}
                                    collectionId={x.collectionId}
                                    badgeId={BigInt(i)}
                                    size={65}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        }
                      }
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="secondary-text text-xs mt-12 mb-2 text-center">
              Head over to{' '}
              <a href="https://bitbadges.io/chrome-extension" target="_blank" rel="noreferrer">
                the options page
              </a>{' '}
              to customize your settings and add more verification checks.
            </div>
          </main>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}

export const SuggestedAddressButton = ({
  addressOrUsername,
  onUserSelect,
  fontSize,
}: {
  addressOrUsername: string
  onUserSelect: (acc: string) => void
  fontSize?: number
}) => {
  return (
    <button
      className="m-1 mx-2 p-1 px-2 hover:border hover:border-vivid-blue rounded cursor-pointer hover:border-rounded hover:bg-vivid-blue hover:text-white"
      style={{ width: 'auto', padding: '0 4px', backgroundColor: 'inherit', color: 'inherit' }}
      onClick={() => {
        onUserSelect(addressOrUsername)
      }}
    >
      <AddressDisplay
        addressOrUsername={addressOrUsername}
        fontSize={fontSize}
        hidePortfolioLink
        fontColor="inherit"
      />
    </button>
  )
}

export default Popup
