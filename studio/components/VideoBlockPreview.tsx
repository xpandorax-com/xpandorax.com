import React, { useState, useRef, useEffect } from 'react';
import { Stack, Card, Text, Flex, Box, Badge, Button } from '@sanity/ui';
import { PlayIcon, PauseIcon, LaunchIcon } from '@sanity/icons';

// Simple SVG icons for volume controls (not available in @sanity/icons)
const VolumeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VolumeMuteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

interface VideoBlockPreviewProps {
  sourceType?: 'selfHosted' | 'external';
  videoUrl?: string;
  embedCode?: string;
  title?: string;
  caption?: string;
  posterUrl?: string;
  posterImage?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };
  aspectRatio?: string;
}

/**
 * VideoBlockPreview Component
 * 
 * Renders a preview of the video block in Sanity Studio
 * - For self-hosted: Shows playable video with custom controls
 * - For external: Shows iframe preview or placeholder
 */
export function VideoBlockPreview(props: VideoBlockPreviewProps) {
  const {
    sourceType = 'selfHosted',
    videoUrl,
    embedCode,
    title,
    caption,
    posterUrl,
    posterImage,
    aspectRatio = '16:9',
  } = props;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calculate aspect ratio padding
  const getAspectRatioPadding = () => {
    switch (aspectRatio) {
      case '4:3': return '75%';
      case '1:1': return '100%';
      case '9:16': return '177.78%';
      case '21:9': return '42.86%';
      default: return '56.25%'; // 16:9
    }
  };

  // Get poster image URL
  const getPosterUrl = () => {
    if (posterUrl) return posterUrl;
    if (posterImage?.asset?._ref) {
      // Convert Sanity image reference to URL
      const ref = posterImage.asset._ref;
      const [, id, dimensions, format] = ref.split('-');
      return `https://cdn.sanity.io/images/p9gceue4/production/${id}-${dimensions}.${format}`;
    }
    return undefined;
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Extract video source from embed code
  const getEmbedSrc = () => {
    if (!embedCode) return null;
    const match = embedCode.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  };

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    video.addEventListener('ended', handleEnded);
    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
    };
  }, []);

  // Render self-hosted video preview
  if (sourceType === 'selfHosted') {
    if (!videoUrl) {
      return (
        <Card padding={4} tone="caution">
          <Stack space={3}>
            <Flex align="center" gap={2}>
              <PlayIcon />
              <Text size={2} weight="semibold">Video Block</Text>
            </Flex>
            <Text size={1} muted>No video URL provided. Enter a Backblaze B2 URL above.</Text>
          </Stack>
        </Card>
      );
    }

    return (
      <Card radius={2} overflow="hidden" shadow={1}>
        <Stack space={0}>
          {/* Video container */}
          <Box
            style={{
              position: 'relative',
              paddingBottom: getAspectRatioPadding(),
              backgroundColor: '#000',
            }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              poster={getPosterUrl()}
              muted={isMuted}
              playsInline
              preload="metadata"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />

            {/* Custom controls overlay */}
            <Flex
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                padding: '12px',
              }}
              justify="space-between"
              align="center"
            >
              <Flex gap={2}>
                <Button
                  mode="bleed"
                  tone="default"
                  padding={2}
                  onClick={togglePlay}
                  style={{ color: 'white' }}
                >
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <Button
                  mode="bleed"
                  tone="default"
                  padding={2}
                  onClick={toggleMute}
                  style={{ color: 'white' }}
                >
                  {isMuted ? <VolumeMuteIcon /> : <VolumeIcon />}
                </Button>
              </Flex>

              <Button
                mode="bleed"
                tone="default"
                padding={2}
                as="a"
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white' }}
              >
                <LaunchIcon />
              </Button>
            </Flex>

            {/* Play button overlay when not playing */}
            {!isPlaying && (
              <Flex
                align="center"
                justify="center"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  cursor: 'pointer',
                }}
                onClick={togglePlay}
              >
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 178, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <PlayIcon style={{ fontSize: '28px', color: 'white', marginLeft: '4px' }} />
                </Box>
              </Flex>
            )}
          </Box>

          {/* Video info */}
          <Box padding={3}>
            <Flex align="center" gap={2}>
              <Badge tone="primary">Self-hosted</Badge>
              {title && (
                <Text size={1} weight="semibold" textOverflow="ellipsis">
                  {title}
                </Text>
              )}
            </Flex>
            {caption && (
              <Text size={1} muted style={{ marginTop: '4px' }}>
                {caption}
              </Text>
            )}
            <Text size={0} muted style={{ marginTop: '8px', wordBreak: 'break-all' }}>
              {videoUrl}
            </Text>
          </Box>
        </Stack>
      </Card>
    );
  }

  // Render external embed preview
  if (sourceType === 'external') {
    if (!embedCode) {
      return (
        <Card padding={4} tone="caution">
          <Stack space={3}>
            <Flex align="center" gap={2}>
              <PlayIcon />
              <Text size={2} weight="semibold">Video Block (External)</Text>
            </Flex>
            <Text size={1} muted>No embed code provided. Paste an iframe embed code above.</Text>
          </Stack>
        </Card>
      );
    }

    const embedSrc = getEmbedSrc();

    return (
      <Card radius={2} overflow="hidden" shadow={1}>
        <Stack space={0}>
          {/* Embed container */}
          <Box
            style={{
              position: 'relative',
              paddingBottom: getAspectRatioPadding(),
              backgroundColor: '#000',
            }}
          >
            {showEmbed && embedSrc ? (
              <iframe
                src={embedSrc}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                }}
              >
                <Stack space={3} style={{ textAlign: 'center' }}>
                  <Box
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                    }}
                  >
                    <PlayIcon style={{ fontSize: '28px', color: 'white' }} />
                  </Box>
                  <Text size={1} style={{ color: 'rgba(255,255,255,0.7)' }}>
                    External Embed
                  </Text>
                  <Button
                    mode="ghost"
                    tone="primary"
                    onClick={() => setShowEmbed(true)}
                    style={{ margin: '0 auto' }}
                  >
                    Load Preview
                  </Button>
                </Stack>
              </Flex>
            )}
          </Box>

          {/* Embed info */}
          <Box padding={3}>
            <Flex align="center" gap={2}>
              <Badge tone="caution">External</Badge>
              {title && (
                <Text size={1} weight="semibold" textOverflow="ellipsis">
                  {title}
                </Text>
              )}
            </Flex>
            {caption && (
              <Text size={1} muted style={{ marginTop: '4px' }}>
                {caption}
              </Text>
            )}
            <Text size={0} muted style={{ marginTop: '8px', wordBreak: 'break-all' }}>
              {embedSrc || 'Unable to parse embed URL'}
            </Text>
          </Box>
        </Stack>
      </Card>
    );
  }

  return null;
}

export default VideoBlockPreview;
