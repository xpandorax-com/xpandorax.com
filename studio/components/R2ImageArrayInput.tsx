import React, { useState, useCallback } from 'react';
import { set, unset, insert, setIfMissing } from 'sanity';
import { Stack, Card, Button, Text, Flex, Box, Spinner, Grid } from '@sanity/ui';
import { UploadIcon, TrashIcon, ImageIcon, AddIcon } from '@sanity/icons';
import { nanoid } from 'nanoid';

// R2 upload endpoint - update this to your production URL
const UPLOAD_API_URL = process.env.SANITY_STUDIO_UPLOAD_API_URL || 'https://xpandorax.com/api/upload-picture';

interface ImageItem {
  _key: string;
  url: string;
  caption?: string;
  alt?: string;
}

interface R2ImageArrayInputProps {
  value?: ImageItem[];
  onChange: (patch: any) => void;
  schemaType: any;
  readOnly?: boolean;
}

export function R2ImageArrayInput(props: R2ImageArrayInputProps) {
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
    const maxSize = 10 * 1024 * 1024;

    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Allowed: JPEG, PNG, WebP, GIF, AVIF`);
        return;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
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
          const data = await response.json();
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        const data = await response.json();
        
        if (data.url) {
          newImages.push({
            _key: nanoid(),
            url: data.url,
            caption: '',
            alt: file.name.replace(/\.[^/.]+$/, ''),
          });
        }
      }

      // Add all new images at once
      if (newImages.length > 0) {
        onChange(insert(newImages, 'after', [-1]));
      }
      
      setUploadProgress(100);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
    // Reset input so same file can be selected again
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
      <Grid columns={[2, 3, 4]} gap={3}>
        {value.map((item) => (
          <Card key={item._key} padding={2} radius={2} shadow={1}>
            <img 
              src={item.url} 
              alt={item.alt || 'Image'} 
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '4px' }} 
            />
          </Card>
        ))}
      </Grid>
    );
  }

  return (
    <Stack space={4}>
      {/* Image Grid */}
      {value.length > 0 && (
        <Grid columns={[2, 3, 4]} gap={3}>
          {value.map((item, index) => (
            <Card key={item._key} padding={2} radius={2} shadow={1}>
              <Stack space={2}>
                <Box style={{ position: 'relative' }}>
                  <img 
                    src={item.url} 
                    alt={item.alt || 'Image'} 
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1', 
                      objectFit: 'cover', 
                      borderRadius: '4px' 
                    }} 
                  />
                  {index === 0 && (
                    <Box
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: 'var(--card-badge-default-bg-color)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
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
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '4px',
                    }}
                    onClick={() => handleRemove(item._key)}
                  />
                </Box>
              </Stack>
            </Card>
          ))}
        </Grid>
      )}

      {/* Upload Area */}
      <Card
        padding={4}
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
              <Text muted>Uploading to Backblaze B2... {uploadProgress}%</Text>
            </>
          ) : (
            <>
              <Flex gap={2} align="center">
                <ImageIcon style={{ fontSize: '1.5em', opacity: 0.5 }} />
                <AddIcon style={{ fontSize: '1em', opacity: 0.5 }} />
              </Flex>
              <Text align="center" muted size={1}>
                Drag & drop images here or click to select
              </Text>
              <label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  as="span"
                  icon={UploadIcon}
                  text={value.length > 0 ? 'Add More Images' : 'Upload Images'}
                  tone="primary"
                  mode={value.length > 0 ? 'ghost' : 'default'}
                  style={{ cursor: 'pointer' }}
                />
              </label>
              <Text size={0} muted>
                Full images stored in Backblaze B2 + CDN • First image = thumbnail
              </Text>
            </>
          )}
        </Flex>
      </Card>
      
      {error && (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{error}</Text>
        </Card>
      )}

      {value.length > 0 && (
        <Text size={0} muted>
          {value.length} image{value.length !== 1 ? 's' : ''} uploaded
        </Text>
      )}
    </Stack>
  );
}

export default R2ImageArrayInput;
