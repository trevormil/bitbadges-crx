import { Spin, Tooltip, Typography } from 'antd'
import { BitBadgesUserInfo, getAbbreviatedAddress, isAddressValid } from 'bitbadgesjs-sdk'
import { useEnsName } from 'wagmi'
const MINT_ACCOUNT = BitBadgesUserInfo.MintAccount()
const { Text } = Typography

export function Address({
  userInfo,
  fontSize = 16,
  fontColor,
  hideTooltip,
  hidePortfolioLink,
  doNotShowName,
}: {
  userInfo: BitBadgesUserInfo<bigint> | null
  fontSize?: number | string
  fontColor?: string
  hideTooltip?: boolean
  hidePortfolioLink?: boolean
  doNotShowName?: boolean
}) {
  const { data: ensName } = useEnsName({
    address: (userInfo?.ethAddress ?? '') as `0x${string}`,
  })

  const resolvedName = !doNotShowName ? ensName || userInfo?.resolvedName : ''
  const addressName = !doNotShowName ? userInfo?.username : ''
  let address = userInfo?.address || ''
  let chain = userInfo?.chain

  const isValidAddress = isAddressValid(address) || address == 'All'
  const displayAddress = addressName
    ? addressName
    : resolvedName
      ? resolvedName
      : getAbbreviatedAddress(address)

  const innerContent =
    !hideTooltip && userInfo ? (
      <Tooltip
        placement="bottom"
        color="black"
        title={
          <>
            <div className="dark">
              {address === MINT_ACCOUNT.address ? (
                <div
                  className="primary-text"
                  style={{
                    textAlign: 'center',
                  }}
                >
                  This is a special escrow address used when badges are first created. Badges can
                  only be transferred from this address, not to it.
                </div>
              ) : address == 'All' ? (
                <div
                  className="primary-text"
                  style={{
                    textAlign: 'center',
                  }}
                >
                  This represents all possible user addresses.
                </div>
              ) : (
                <div
                  className="primary-text"
                  style={{
                    textAlign: 'center',
                  }}
                >
                  {`${chain} Address`}
                  {resolvedName ? (
                    <>
                      <br />
                      {`${resolvedName}`}
                    </>
                  ) : (
                    ''
                  )}

                  <br />
                  <br />
                  {`${address}`}
                </div>
              )}
            </div>
          </>
        }
        overlayStyle={{
          minWidth: 320,
        }}
      >
        {displayAddress}
      </Tooltip>
    ) : (
      displayAddress
    )

  const showLink =
    !hidePortfolioLink && address && address !== MINT_ACCOUNT.address && address != 'All'
  const invalidAddress = !isValidAddress

  return (
    <div>
      <div
        style={{
          verticalAlign: 'middle',
          paddingLeft: 5,
          fontSize: fontSize,
        }}
        className="whitespace-nowrap"
      >
        <Text
          className={'primary-text ' + (!showLink ? '' : ' link-button-nav')}
          onClick={
            !showLink
              ? undefined
              : () => {
                  window.open(`https://bitbadges.io/account/${address}`, '_blank')
                }
          }
          copyable={{
            text: address,
            tooltips: ['Copy Address', 'Copied!'],
          }}
          style={{
            color: invalidAddress ? 'red' : fontColor,
            display: 'inline-flex',
          }}
        >
          <b>
            {userInfo ? (
              <>{innerContent}</>
            ) : !invalidAddress ? (
              <Spin className="ml-2" />
            ) : (
              <>{displayAddress}</>
            )}
          </b>
        </Text>
      </div>
    </div>
  )
}
