import React, { useState, useCallback } from 'react';
import { unset, insert, setIfMissing } from 'sanity';
import { Stack, Card, Button, Text, Flex, Box, Spinner, Grid } from '@sanity/ui';
import { UploadIcon, TrashIcon, ImageIcon, AddIcon } from '@sanity/icons';
import { nanoid } from 'nanoid';

// Backblaze B2 + Cloudflare CDN configuration
const UPLOAD_API_URL = process.env.SANITY_STUDIO_UPLOAD_API_URL || 'https://xpandorax.com/api/upload-picture';

interface ImageItem {
  _key: string;
  url: string;
  caption?: string;
  alt?: string;
}

interface B2ImageArrayInputProps {
  value?: ImageItem[];
  onChange: (patch: any) => void;
  schemaType: any;
  readOnly?: boolean;
}

/**
 * B2ImageArrayInput Component
 * 
 * Multi-image array input for Backblaze B2 storage with Cloudflare CDN
 * - Uploads multiple images at once
 * - Shows progress percentage
 * - Displays gallery of uploaded images
 * - First image serves as thumbnail
 * - Supports drag & drop
 * - Real-time preview from CDN
 */
export function B2ImageArrayInput(props: B2ImageArrayInputProps) {
  const { value = [], onChange, readOnly } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Validate files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const maxSize = 20 * 1024 * 1024; // 20MB max

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Allowed: JPEG, PNG, WebP, GIF, AVIF`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Maximum size is 20MB.`);
        return;
      }
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Initialize array if empty
      onChange(setIfMissing([]));

      const newImages: ImageItem[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(Math.round(((i) / fileArray.length) * 100));

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(UPLOAD_API_URL, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string };
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        const data = await response.json() as { url?: string };
        
        if (data.url) {
          newImages.push({
            _key: nanoid(),
            url: data.url,
            caption: '',
            alt: file.name.replace(/\.[^/.]+$/, ''),
          });
        } else {
          throw new Error(`No URL returned for ${file.name}`);
        }
      }

      // Add all new images at once
      if (newImages.length > 0) {
        onChange(insert(newImages, 'after', [-1]));
      }
      
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    } catch (err) {
      console.error('B2 Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
    // Reset input so same files can be selected again
    event.target.value = '';
  }, [handleUpload]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
  }, [handleUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleRemove = useCallback((key: string) => {
    const index = value.findIndex(item => item._key === key);
    if (index !== -1) {
      onChange(unset([index]));
    }
  }, [value, onChange]);

  if (readOnly) {
    return (
      <Stack space={3}>
        <Text size={1} weight="semibold">Images ({value.length})</Text>
        <Grid columns={[2, 3, 4]} gap={3}>
          {value.map((item) => (
            <Card key={item._key} padding={0} radius={2} overflow="hidden">
              <img 
                src={item.url} 
                alt={item.alt || 'Image'} 
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} 
                onError={() => console.warn('Image failed to load:', item.url)}
              />
            </Card>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack space={4}>
      {/* Image Gallery */}
      {value.length > 0 && (
        <Stack space={2}>
          <Flex justify="space-between" align="center">
            <Text size={1} weight="semibold">
              Images ({value.length}) - First image is thumbnail
            </Text>
          </Flex>
          <Grid columns={[2, 3, 4]} gap={3}>
            {value.map((item, index) => (
              <Card key={item._key} padding={0} radius={2} shadow={1} overflow="hidden">
                <Box style={{ position: 'relative' }}>
                  <img 
                    src={item.url} 
                    alt={item.alt || 'Image'} 
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1', 
                      objectFit: 'cover',
                    }} 
                    onError={() => console.warn('Image failed to load:', item.url)}
                  />
                  {index === 0 && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'var(--card-badge-default-bg-color)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'var(--card-badge-default-fg-color)',
                      }}
                    >
                      THUMBNAIL
                    </Box>
                  )}
                  <Button
                    icon={TrashIcon}
                    mode="bleed"
                    tone="critical"
                    padding={2}
                    style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '4px',
                    }}
                    onClick={() => handleRemove(item._key)}
                    title="Remove image"
                  />
                </Box>
              </Card>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Upload Area */}
      <Card
        padding={4}
        radius={2}
        shadow={1}
        tone={dragOver ? 'primary' : 'default'}
        style={{
          border: dragOver ? '2px dashed var(--card-focus-ring-color)' : '2px dashed var(--card-border-color)',
          cursor: isUploading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: isUploading ? 0.7 : 1,
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
              <Text size={1} weight="semibold">{uploadProgress}%</Text>
              <Text size={0} muted>Serving via Cloudflare CDN</Text>
            </>
          ) : (
            <>
              <Flex gap={2} align="center" justify="center">
                <ImageIcon style={{ fontSize: '2em', opacity: 0.6 }} />
                <AddIcon style={{ fontSize: '1.2em', opacity: 0.6 }} />
              </Flex>
              <Stack space={1} align="center" style={{ textAlign: 'center' }}>
                <Text align="center" weight="semibold">
                  Drag & drop images here
                </Text>
                <Text align="center" muted size={1}>
                  or click to select multiple images
                </Text>
              </Stack>
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                <Button
                  as="span"
                  icon={UploadIcon}
                  text={value.length > 0 ? 'Add More Images' : 'Upload Images'}
                  tone="primary"
                  mode={value.length > 0 ? 'ghost' : 'default'}
                  style={{ cursor: isUploading ? 'wait' : 'pointer' }}
                  disabled={isUploading}
                />
              </label>
              <Stack space={1} style={{ marginTop: '8px', textAlign: 'center' }}>
                <Text size={0} muted>
                  Backblaze B2 + Cloudflare CDN
                </Text>
                <Text size={0} muted>
                  Max 20MB each • JPEG, PNG, WebP, GIF, AVIF • 1-year cache
                </Text>
              </Stack>
            </>
          )}
        </Flex>
      </Card>
      
      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Stack space={2}>
            <Text size={1} weight="semibold">Upload Error</Text>
            <Text size={1}>{error}</Text>
            <Text size={0} muted>
              Check API endpoint and B2 configuration in {UPLOAD_API_URL}
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

export default B2ImageArrayInput;
