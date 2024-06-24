import { Avatar } from 'antd'
import { convertToEthAddress } from 'bitbadgesjs-sdk'
import Blockies from 'react-blockies'
import { useEnsAvatar, useEnsName } from 'wagmi'

export function BlockiesAvatar({
  address,
  avatar,
  fontSize,
  shape = 'square',
}: {
  address: string
  avatar?: string
  fontSize?: number
  shape?: 'circle' | 'square'
}) {
  const ethAddress = convertToEthAddress(address)
  const { data: ensName } = useEnsName({
    address: (ethAddress ?? '') as `0x${string}`,
  })

  const ensAvatar = useEnsAvatar({
    name: ensName ?? '',
  })

  avatar = avatar ?? (ensAvatar.data as string)

  if (avatar) {
    return (
      <Avatar
        className="rounded"
        shape={shape ? shape : 'square'}
        src={avatar}
        size={fontSize ? fontSize : 20}
      />
    )
  } else {
    return (
      <Avatar
        className="rounded"
        shape={shape ? shape : 'square'}
        src={
          <Blockies
            color={address == 'All' ? 'white' : undefined}
            spotColor={address == 'All' ? '#FF5733' : undefined}
            bgColor={address == 'All' ? 'green' : undefined}
            scale={4}
            size={fontSize ? fontSize / 4 : 10}
            seed={address ? address.toLowerCase() : ''}
          />
        }
        size={fontSize ? fontSize : 20}
      />
    )
  }
}
