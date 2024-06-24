import { ClockCircleOutlined } from '@ant-design/icons'
import { Avatar, Spin, Tooltip, notification } from 'antd'
import {
  BalanceArray,
  Metadata,
  getBalanceForIdAndTime,
  BitBadgesCollection,
  GO_MAX_UINT_64,
  iUintRange,
} from 'bitbadgesjs-sdk'

export function BadgeAvatar({
  collectionId,
  collection,
  size,
  badgeId,
  balances,
  showId,
  showSupplys,
  noHover,
  metadataOverride,
  onClick,
  showMultimedia,
  autoPlay,
}: {
  collectionId: bigint
  badgeId?: bigint
  collection: BitBadgesCollection<bigint>
  size?: number
  balances?: BalanceArray<bigint>
  showId?: boolean
  showSupplys?: boolean
  noHover?: boolean
  metadataOverride?: Metadata<bigint>
  onClick?: () => void
  showMultimedia?: boolean
  autoPlay?: boolean
}) {
  let metadata = metadataOverride
    ? metadataOverride
    : badgeId
      ? collection?.getBadgeMetadata(badgeId)
      : collection?.getCollectionMetadata()

  // If the badgeId is greater than the max badgeId for the collection, then it is a placeholder badge
  if (!metadata && badgeId && collection && badgeId > collection.getMaxBadgeId()) {
    metadata = Metadata.DefaultPlaceholderMetadata()
  }

  const currBalanceAmount =
    badgeId && balances
      ? getBalanceForIdAndTime(badgeId, BigInt(Date.now()), balances.filterZeroBalances())
      : 0n
  const showOwnershipTimesIcon =
    badgeId && balances && showSupplys && balances.some((x) => !x.ownershipTimes.isFull())
      ? true
      : false

  const metadataImageUrl = metadata?.image
    ? metadata.image.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')
    : undefined

  const metadataImage = metadataImageUrl ?? <Spin />

  let videoUri = metadata?.video
    ? metadata.video.replace('ipfs://', 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/')
    : ''

  const isYoutubeUri =
    videoUri && (videoUri.includes('youtube.com') || videoUri.includes('youtu.be'))
  if (isYoutubeUri) {
    const videoId = videoUri.split('/').pop()
    videoUri = `https://www.youtube.com/embed/${videoId}`
  }

  function getVideoType(videoUrl: string) {
    const fileExtension = videoUrl.split('.').pop()?.toLowerCase()
    switch (fileExtension) {
      case 'mp4':
        return 'video/mp4'
      case 'webm':
        return 'video/webm'
      case 'ogg':
        return 'video/ogg'
      case 'm4v':
        return 'video/mp4'
      case 'gltf':
        return 'model/gltf+json'
      case 'glb':
        return 'model/gltf-binary'
      default:
        // If the file extension is not recognized, you can return a default type
        return 'video/mp4'
    }
  }

  const avatar = (
    <div>
      {(!showMultimedia || !videoUri) && (
        <Avatar
          shape="square"
          style={{
            verticalAlign: 'middle',
            margin: 4,
            cursor: collection && badgeId ? 'pointer' : undefined,
          }}
          className={'rounded-lg ' + (badgeId && !noHover ? 'badge-avatar' : undefined)}
          src={
            typeof metadataImage === 'string' ? (
              <img
                alt={metadata?.name ? metadata.name : ''}
                src={metadataImage}
                width={size ? size : 65}
                height={size ? size : 65}
              />
            ) : (
              metadataImage
            )
          }
          size={size ? size : 65}
          onClick={() => {
            if (onClick) {
              onClick()
              return
            }
            if (!badgeId) return

            window.open(
              'https://bitbadges.io/collections/' + collectionId + '/' + badgeId,
              '_blank',
            )
          }}
          onError={() => {
            return false
          }}
        />
      )}

      {showMultimedia && videoUri && metadataImageUrl && !isYoutubeUri && (
        <video
          style={{
            verticalAlign: 'middle',
            margin: 4,
            cursor: collection && badgeId ? 'pointer' : undefined,
            borderRadius: '8%',
          }}
          autoPlay={autoPlay}
          className={collectionId + '-' + badgeId + '-multimedia'}
          height={size ? size : 65}
          width={size ? size : 65}
          controls
          controlsList="nodownload"
          playsInline
          loop
          poster={metadataImageUrl}
        >
          <source src={videoUri} type={getVideoType(videoUri)} />
        </video>
      )}

      {isYoutubeUri && showMultimedia && videoUri && metadataImageUrl && (
        <iframe
          className="rounded-2xl"
          width={300}
          height={300}
          src={videoUri}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  )

  return (
    <div>
      {noHover ? (
        avatar
      ) : (
        <Tooltip
          placement="bottom"
          title={`${metadata?.name ? metadata.name : ''} ${badgeId ? `(#${badgeId})` : ''}`}
        >
          <div style={{ textAlign: 'center' }}>{avatar}</div>
        </Tooltip>
      )}
      <div style={{ textAlign: 'center' }}>
        {showId && (
          <b>
            <span>{`${badgeId}`}</span>
            <br />
          </b>
        )}
        {!!balances && collection?.balancesType !== 'Non-Public' && (
          <>
            <b className="primary-text">
              {showSupplys && (
                <>
                  x
                  <span
                    style={{ color: currBalanceAmount < 0 ? 'red' : undefined }}
                  >{`${currBalanceAmount}`}</span>
                </>
              )}

              {showOwnershipTimesIcon && (
                <Tooltip
                  color="black"
                  title={
                    <div>
                      {balances.map((x, idx) => {
                        return (
                          <>
                            {idx > 0 && <br />}
                            {idx > 0 && <br />}x{x.amount.toString()} from{' '}
                            {getTimeRangesString(x.ownershipTimes, '', true)}
                          </>
                        )
                      })}
                    </div>
                  }
                >
                  <ClockCircleOutlined style={{ marginLeft: 4 }} />
                </Tooltip>
              )}
            </b>
          </>
        )}
      </div>
    </div>
  )
}

export function getTimeRangesString(
  validFrom?: Array<iUintRange<bigint>>,
  prefix = '',
  includeTime = false,
  futureOnly = false,
  numbersOnly?: boolean,
): string {
  if (!validFrom) return prefix + ' forever!'

  const strings = validFrom.map((timeRange, idx) => {
    let str = idx == 0 ? `${prefix}` : ''
    const endTimestamp = timeRange.end
    const validForever = timeRange.end >= GO_MAX_UINT_64

    if (numbersOnly) {
      str += timeRange.start.toString() + '-' + timeRange.end.toString()
      return str
    }

    if (validForever && timeRange.start === 1n) {
      return 'All'
    }

    const endDateString = validForever
      ? `Forever`
      : new Date(Number(endTimestamp.toString())).toLocaleDateString()
    const endTimeString = validForever
      ? ``
      : new Date(Number(endTimestamp.toString())).toLocaleTimeString()
    const startDateString = new Date(Number(timeRange.start.toString())).toLocaleDateString()
    const startTimeString = new Date(Number(timeRange.start.toString())).toLocaleTimeString()
    const currentRange =
      new Date().getTime() >= Number(timeRange.start.toString()) &&
      new Date().getTime() <= Number(timeRange.end.toString())

    if (currentRange && futureOnly) {
      if (includeTime) {
        str += `Current - ${endDateString} ${endTimeString}`
      } else {
        str += `Current - ${endDateString}`
      }
    } else {
      if (includeTime) {
        str += `${startDateString} ${startTimeString} - ${endDateString} ${endTimeString}`
      } else {
        str += `${startDateString} - ${endDateString}`
      }
    }

    return str
  })

  return strings.join(', ')
}
