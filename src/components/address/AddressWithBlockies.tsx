import { Avatar, Spin, Tooltip } from 'antd'
import {
  BitBadgesUserInfo,
  SupportedChain,
  getChainForAddress,
  BitBadgesAPI,
} from 'bitbadgesjs-sdk'
import { useEffect, useState } from 'react'
import { Address } from './Address'
import { BlockiesAvatar } from './Blockies'
import { BitBadgesApi, DesiredNumberType } from '../../popup/Popup'

export const ETH_LOGO = '/img/ethereum-logo.png'
export const COSMOS_LOGO = '/img/cosmos-logo.png'
export const BITCOIN_LOGO = '/img/bitcoin-logo.png'
export const SOLANA_LOGO = '/img/solana-logo.png'

export function getChainLogo(chain: string) {
  let chainLogo = ''

  switch (chain) {
    case SupportedChain.ETH:
      chainLogo = ETH_LOGO
      break
    case SupportedChain.UNKNOWN:
      chainLogo =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1024px-Blue_question_mark_icon.svg.png'
      break
    case SupportedChain.COSMOS:
      chainLogo = COSMOS_LOGO
      break
    case SupportedChain.SOLANA:
      chainLogo = SOLANA_LOGO
      break
    case SupportedChain.BTC:
      chainLogo = BITCOIN_LOGO
      break
    default:
      chainLogo = ETH_LOGO
      break
  }

  return chainLogo
}

export function AddressWithBlockies({
  addressOrUsername,
  fontSize = 16,
  fontColor,
  hideTooltip,
  hidePortfolioLink,
  doNotShowName,
}: {
  addressOrUsername: string
  fontSize?: number
  fontColor?: string
  hidePortfolioLink?: boolean
  hideTooltip?: boolean
  doNotShowName?: boolean
}) {
  const [fetchedAccount, setFetchedAccount] = useState<BitBadgesUserInfo<bigint> | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    BitBadgesApi.getAccounts({
      accountsToFetch: [{ address: addressOrUsername }],
    }).then((res) => {
      setFetchedAccount(res.accounts[0])
      setLoading(false)
    })
  }, [addressOrUsername])

  const userInfo = fetchedAccount
  const address = userInfo?.address || addressOrUsername || ''

  const chainLogo = getChainLogo(getChainForAddress(address))

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {address !== 'Mint' && address !== 'All' && (
        <Tooltip
          title={
            getChainForAddress(address) !== SupportedChain.UNKNOWN
              ? `This address is for a ${getChainForAddress(address)} user`
              : `Unknown`
          }
          placement="bottom"
        >
          <Avatar src={chainLogo} style={{ marginRight: 8 }} size={fontSize} />
        </Tooltip>
      )}
      <BlockiesAvatar
        shape="square"
        address={userInfo?.address ?? ''}
        avatar={userInfo?.profilePicUrl ?? userInfo?.avatar}
        fontSize={fontSize}
      />
      {loading && <Spin className="ml-2" />}
      {!loading && (
        <Address
          fontSize={fontSize}
          userInfo={userInfo}
          fontColor={fontColor}
          hidePortfolioLink={hidePortfolioLink}
          hideTooltip={hideTooltip}
          doNotShowName={doNotShowName}
        />
      )}
    </div>
  )
}
