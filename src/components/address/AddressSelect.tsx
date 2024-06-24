import { Dropdown, Input, Tooltip } from 'antd'
import { useState } from 'react'

import { EditOutlined, MinusOutlined } from '@ant-design/icons'
import Avatar from 'antd/lib/avatar/avatar'
import { SearchDropdown } from '../navigation/SearchDropdown'
import { AddressDisplay } from './AddressDisplay'
import { Divider } from 'antd'
import { BitBadgesUserInfo, convertToCosmosAddress, BitBadgesAPI } from 'bitbadgesjs-sdk'
import { SuggestedAddressButton } from '../../popup/Popup'

export enum EnterMethod {
  Single = 'Single',
  Batch = 'Batch',
}

export function AddressSelect({
  addressOrUsername,
  onUserSelect,
  disabled,
  allowMintSearch,
  switchable = true,
  fontSize,

  suggestedAddresses,
}: {
  addressOrUsername?: string
  onUserSelect: (currUserInfo: string) => void
  disabled?: boolean
  allowMintSearch?: boolean
  switchable?: boolean
  fontSize?: number
  suggestedAddresses: string[]
}) {
  const [changed, setChanged] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')
  const defaultOpenIfBlank = true
  const [showSelect, setShowSelect] = useState<boolean>(
    switchable && !defaultOpenIfBlank ? false : true,
  )
  const [latestAddress, setLatestAddress] = useState<string | undefined>('')

  const onSelect = async (acc: BitBadgesUserInfo<bigint> | string) => {
    if (!acc) {
      return
    }
    const address = typeof acc === 'string' ? acc : acc?.address

    onUserSelect(address)
    setInput('')
    setLatestAddress(address)
    setShowSelect(switchable ? false : true)
  }

  const AddressInput = (
    <Dropdown
      open={changed && input != ''}
      placement="bottom"
      overlay={
        <SearchDropdown
          onlyAddresses
          allowMintSearch={allowMintSearch}
          searchValue={input}
          onSearch={onSelect}
        />
      }
      trigger={['hover', 'click']}
    >
      <Input
        value={input}
        placeholder="Enter an address or username"
        className="primary-text inherit-bg"
        style={{ textAlign: 'center' }}
        onChange={async (e) => {
          e.preventDefault()
          setInput(e.target.value)
          setChanged(true)
        }}
        disabled={disabled}
      />
    </Dropdown>
  )

  return (
    <>
      <div className="full-width primary-text">
        {switchable && (
          <div className="flex-center flex-wrap primary-text">
            <AddressDisplay addressOrUsername={latestAddress ?? ''} fontSize={fontSize} />{' '}
            <Tooltip placement="top" title="Switch Address">
              <Avatar
                className={`cursor-pointer text-vivid-blue ${showSelect ? '' : ''} ${disabled ? 'cursor-not-allowed' : ''}`}
                src={showSelect ? <MinusOutlined /> : <EditOutlined />}
                onClick={() => {
                  setShowSelect(!showSelect)
                }}
              />
            </Tooltip>
          </div>
        )}
        {showSelect && (
          <>
            <div className="flex-center flex-col w-full">
              <div className="mt-2 w-full" style={{ maxWidth: 800 }}>
                {AddressInput}
              </div>
              <div className="secondary-text" style={{ textAlign: 'left', marginTop: 4 }}>
                <div className="flex-center flex-wrap" style={{ alignItems: 'center' }}>
                  {suggestedAddresses
                    .filter((x) => x && x !== 'Total' && x !== 'Mint' && x !== 'All' && x)
                    .filter((x) => {
                      return convertToCosmosAddress(x).length <= 45
                    })
                    .slice(0, 6)
                    .filter((x, i, a) => a.indexOf(x) === i)
                    .map((address) => (
                      <SuggestedAddressButton
                        key={address}
                        addressOrUsername={address}
                        onUserSelect={onSelect}
                        fontSize={12}
                      />
                    ))}
                </div>
              </div>
            </div>
            <Divider />
          </>
        )}
      </div>
    </>
  )
}
