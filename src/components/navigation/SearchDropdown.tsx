import { Menu, Spin, Typography } from 'antd'
import {
  BitBadgesUserInfo,
  GetSearchSuccessResponse,
  convertToCosmosAddress
} from 'bitbadgesjs-sdk'
import { useEffect, useState } from 'react'

import { useEnsAddress } from 'wagmi'
import { BitBadgesApi } from '../../popup/Popup'
import { AddressDisplay } from '../address/AddressDisplay'

export function SearchDropdown({
  searchValue,
  onSearch,
  onlyAddresses,
  onlyCollections,
  onlyLists,
  allowMintSearch,
  specificCollectionId,
}: {
  searchValue: string
  onSearch: (
    value: string,
    isAccount?: boolean,
    isCollection?: boolean,
    isBadge?: boolean,
  ) => Promise<void>
  onlyAddresses?: boolean
  onlyCollections?: boolean
  onlyLists?: boolean
  allowMintSearch?: boolean
  specificCollectionId?: bigint
}) {
  const [searchResponse, setSearchResponse] = useState<GetSearchSuccessResponse<bigint>>()
  const [loading, setLoading] = useState<boolean>(false)

  const accountsResults = searchResponse?.accounts || []
  const { data: ethAddress } = useEnsAddress({ name: searchValue + '.eth' })

  const DELAY_MS = 500
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchValue) return

      setLoading(true)
      setSearchResponse(undefined)

      const result = await BitBadgesApi.getSearchResults(searchValue, {
        noCollections: onlyAddresses || onlyLists,
        noAccounts: onlyCollections || onlyLists,
        noAddressLists: onlyAddresses || onlyCollections,
        noBadges: onlyAddresses || onlyLists,
        specificCollectionId,
      })

      if (specificCollectionId) {
        //It returns the requested collection but we just want to display the badges
        result.collections = []
      }

      if (onlyLists) {
        for (const account of result.accounts) {
          account.addressLists = [...account.addressLists, ...result.addressLists]
        }
      }
      setSearchResponse(result)
      setLoading(false)
    }, DELAY_MS)

    return () => {
      clearTimeout(delayDebounceFn)
    }
  }, [
    searchValue,
    allowMintSearch,

    onlyLists,
    onlyAddresses,
    onlyCollections,
    specificCollectionId,
  ])

  //We have three sections of the dropdown:
  //1. Attempt to map the current text to an address or name (hide if duplicate in accounts results)
  //2. Search results for accounts
  //3. Search results for collections

  return (
    <Menu
      className="dropdown card-bg rounded-lg"
      onKeyDown={async (e) => {
        // if (e.key === '') {
        //   await onSearch(searchValue)
        // }
      }}
      theme="dark"
      style={{ border: '1px solid gray', marginTop: 8, overflow: 'hidden' }}
    >
      {
        <>
          {!onlyCollections && !onlyLists && (
            <>
              <Typography.Text className="primary-text" strong style={{ fontSize: 20 }}>
                Accounts
              </Typography.Text>
              <div
                className="primary-text inherit-bg"
                style={{ overflowY: 'auto', maxHeight: 250 }}
              >
                {ethAddress && (
                  <Menu.Item
                    className="dropdown-item"
                    onClick={async () => {
                      await onSearch(convertToCosmosAddress(ethAddress), true, false)
                    }}
                  >
                    <div className="flex-between">
                      <div className="flex-center" style={{ alignItems: 'center' }}>
                        <AddressDisplay
                          addressOrUsername={ethAddress}
                          hidePortfolioLink
                          hideTooltip
                        />
                      </div>
                    </div>
                  </Menu.Item>
                )}
                {/* {Account Results} */}
                {accountsResults.map((result: BitBadgesUserInfo<bigint>, idx) => {
                  return (
                    <Menu.Item
                      key={idx}
                      className="dropdown-item"
                      onClick={async () => {
                        await onSearch(result.address, true, false)
                      }}
                    >
                      <div className="flex-between">
                        <div className="flex-center" style={{ alignItems: 'center' }}>
                          <AddressDisplay
                            addressOrUsername={result.address}
                            hidePortfolioLink
                            hideTooltip
                          />
                        </div>
                      </div>
                    </Menu.Item>
                  )
                })}
              </div>
            </>
          )}
          {loading && (
            <Menu.Item className="dropdown-item" disabled style={{ cursor: 'disabled' }}>
              <Spin size={'large'} />
            </Menu.Item>
          )}
        </>
      }
    </Menu>
  )
}
