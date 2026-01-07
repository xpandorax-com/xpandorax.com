import React from 'react';
import { ObjectInputProps } from 'sanity';
import { Stack, Card, Box } from '@sanity/ui';
import { VideoBlockPreview } from './VideoBlockPreview';

interface VideoBlockValue {
  _type?: string;
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
  playerOptions?: {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    controlsStyle?: string;
    playsinline?: boolean;
  };
}

/**
 * VideoBlockInput Component
 * 
 * Custom input component for the video block that shows:
 * - Default Sanity form fields
 * - Live video preview below the form
 */
export function VideoBlockInput(props: ObjectInputProps) {
  const { renderDefault } = props;
  const value = props.value as VideoBlockValue | undefined;

  return (
    <Stack space={4}>
      {/* Render default Sanity form fields */}
      {renderDefault(props)}

      {/* Show live preview if we have video data */}
      {value && (value.videoUrl || value.embedCode) && (
        <Card padding={3} radius={2} shadow={1} tone="transparent">
          <Stack space={3}>
            <Box
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Live Preview
            </Box>
            <VideoBlockPreview
              sourceType={value.sourceType}
              videoUrl={value.videoUrl}
              embedCode={value.embedCode}
              title={value.title}
              caption={value.caption}
              posterUrl={value.posterUrl}
              posterImage={value.posterImage}
              aspectRatio={value.aspectRatio}
            />
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default VideoBlockInput;
