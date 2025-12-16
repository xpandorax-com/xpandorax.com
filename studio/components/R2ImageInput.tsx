import React, { useState, useCallback } from 'react';
import { set, unset } from 'sanity';
import { Stack, Card, Button, Text, Flex, Box, Spinner } from '@sanity/ui';
import { UploadIcon, TrashIcon, ImageIcon } from '@sanity/icons';

// R2 upload endpoint - update this to your production URL
const UPLOAD_API_URL = process.env.SANITY_STUDIO_UPLOAD_API_URL || 'https://xpandorax.com/api/upload-picture';

interface UploadResponse {
  url?: string;
  error?: string;
}

interface R2ImageInputProps {
  value?: string;
  onChange: (patch: any) => void;
  schemaType: any;
  readOnly?: boolean;
}

export function R2ImageInput(props: R2ImageInputProps) {
  const { value, onChange, readOnly } = props;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
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
        const data = await response.json() as UploadResponse;
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json() as UploadResponse;
      
      if (data.url) {
        onChange(set(data.url));
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (err) {
      console.error('Upload error:', err);
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
        <img src={value} alt="Uploaded image" style={{ maxWidth: '100%', borderRadius: '4px' }} />
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
              />
            </Box>
            <Text size={1} muted style={{ wordBreak: 'break-all' }}>
              {value}
            </Text>
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
                <Text size={1} muted>
                  Images stored in Backblaze B2 + Cloudflare CDN
                </Text>
              </>
            )}
          </Flex>
        </Card>
      )}
      
      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      )}
    </Stack>
  );
}

export default R2ImageInput;
