import React, { useState, useCallback } from 'react';
import { set, unset } from 'sanity';
import { Stack, Card, Button, Text, Flex, Box, Spinner } from '@sanity/ui';
import { UploadIcon, TrashIcon, ImageIcon } from '@sanity/icons';

// Backblaze B2 + Cloudflare CDN configuration
const UPLOAD_API_URL = process.env.SANITY_STUDIO_UPLOAD_API_URL || 'https://xpandorax.com/api/upload-picture';
const CDN_URL = process.env.SANITY_STUDIO_CDN_URL || 'https://cdn.xpandorax.com';

interface B2ImageInputProps {
  value?: string;
  onChange: (patch: any) => void;
  schemaType: any;
  readOnly?: boolean;
}

/**
 * B2ImageInput Component
 * 
 * Single image input field for Backblaze B2 storage with Cloudflare CDN
 * - Uploads to B2 via API endpoint
 * - Returns CDN URL for fast delivery
 * - Supports drag & drop
 * - Real-time preview from CDN
 */
export function B2ImageInput(props: B2ImageInputProps) {
  const { value, onChange, readOnly } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF`);
      return;
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 20MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(data.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.url) {
        // Store CDN URL
        onChange(set(data.url));
      } else {
        throw new Error('No URL returned from upload. Check API endpoint.');
      }
    } catch (err) {
      console.error('B2 Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange(unset());
  }, [onChange]);

  if (readOnly) {
    return value ? (
      <Card padding={3} radius={2} shadow={1}>
        <img 
          src={value} 
          alt="Uploaded image" 
          style={{ maxWidth: '100%', borderRadius: '4px' }} 
          onError={() => console.warn('Image failed to load from CDN:', value)}
        />
      </Card>
    ) : (
      <Card padding={3} radius={2} tone="transparent">
        <Text muted>No image</Text>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      {value ? (
        <Card padding={3} radius={2} shadow={1}>
          <Stack space={3}>
            <Box style={{ position: 'relative' }}>
              <img 
                src={value} 
                alt="Uploaded image" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px',
                  borderRadius: '4px',
                  objectFit: 'contain'
                }} 
                onError={() => console.warn('Image failed to load from CDN:', value)}
              />
            </Box>
            <Stack space={2}>
              <Text size={1} muted style={{ wordBreak: 'break-all' }}>
                <strong>CDN URL:</strong> {value}
              </Text>
              {value.includes('cdn.xpandorax.com') && (
                <Text size={1} style={{ color: 'var(--card-tone-positive-fg-color)' }}>
                  ✓ Served via Cloudflare CDN with 1-year cache
                </Text>
              )}
            </Stack>
            <Flex gap={2}>
              <Button
                icon={TrashIcon}
                text="Remove"
                tone="critical"
                mode="ghost"
                onClick={handleRemove}
              />
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  as="span"
                  icon={UploadIcon}
                  text="Replace"
                  mode="ghost"
                  style={{ cursor: 'pointer' }}
                />
              </label>
            </Flex>
          </Stack>
        </Card>
      ) : (
        <Card
          padding={5}
          radius={2}
          shadow={1}
          tone={dragOver ? 'primary' : 'default'}
          style={{
            border: dragOver ? '2px dashed var(--card-focus-ring-color)' : '2px dashed var(--card-border-color)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Flex direction="column" align="center" justify="center" gap={3}>
            {isUploading ? (
              <>
                <Spinner muted />
                <Text muted>Uploading to Backblaze B2...</Text>
                <Text size={1} muted>Processing through Cloudflare CDN</Text>
              </>
            ) : (
              <>
                <ImageIcon style={{ fontSize: '2em', opacity: 0.5 }} />
                <Text align="center" muted>
                  Drag & drop image here or
                </Text>
                <label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <Button
                    as="span"
                    icon={UploadIcon}
                    text="Select Image"
                    tone="primary"
                    style={{ cursor: 'pointer' }}
                  />
                </label>
                <Stack space={2} style={{ textAlign: 'center', marginTop: '8px' }}>
                  <Text size={1} muted>
                    Stored in Backblaze B2, served via Cloudflare CDN
                  </Text>
                  <Text size={0} muted>
                    Max 20MB • JPEG, PNG, WebP, GIF, AVIF • 1-year cache
                  </Text>
                </Stack>
              </>
            )}
          </Flex>
        </Card>
      )}
      
      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Stack space={2}>
            <Text size={1} weight="semibold">Upload Error</Text>
            <Text size={1}>{error}</Text>
            <Text size={0} muted>
              Make sure the API endpoint ({UPLOAD_API_URL}) is accessible and B2 credentials are configured.
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default B2ImageInput;
