import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';

interface PropertyImageGalleryProps {
  images: Array<{ url: string; caption?: string }>;
  propertyTitle?: string;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  propertyTitle = 'Property',
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        <Box component="img" src="/default-property.jpg" alt="No image" sx={{ maxWidth: '100%', maxHeight: '100%' }} />
      </Box>
    );
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClose = () => {
    setLightboxOpen(false);
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_URL || ''}${url}`;
  };

  return (
    <>
      <ImageList
        sx={{ width: '100%', height: 'auto', borderRadius: 2, overflow: 'hidden' }}
        cols={isMobile ? 1 : images.length === 1 ? 1 : images.length === 2 ? 2 : 3}
        rowHeight={isMobile ? 300 : 250}
        gap={4}
      >
        {images.slice(0, isMobile ? 1 : images.length === 1 ? 1 : 5).map((image, index) => (
          <ImageListItem
            key={index}
            sx={{
              cursor: 'pointer',
              position: 'relative',
              '&:hover': {
                opacity: 0.9,
              },
            }}
            onClick={() => handleImageClick(index)}
          >
            <Box
              component="img"
              src={getImageUrl(image.url)}
              alt={image.caption || `${propertyTitle} - Image ${index + 1}`}
              loading="lazy"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {index === 4 && images.length > 5 && (
              <ImageListItemBar
                title={`+${images.length - 5} more`}
                sx={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
                actionIcon={
                  <FullscreenIcon sx={{ color: 'white', mr: 1 }} />
                }
              />
            )}
          </ImageListItem>
        ))}
      </ImageList>

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={handleClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            maxWidth: '95vw',
            maxHeight: '95vh',
            m: 0,
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', minWidth: '80vw', minHeight: '80vh' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <CloseIcon />
          </IconButton>

          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                  color: 'white',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              p: 2,
            }}
          >
            <Box
              component="img"
              src={getImageUrl(images[selectedImageIndex].url)}
              alt={images[selectedImageIndex].caption || `${propertyTitle} - Image ${selectedImageIndex + 1}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Box>

          {images[selectedImageIndex].caption && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                p: 2,
                textAlign: 'center',
              }}
            >
              {images[selectedImageIndex].caption}
            </Box>
          )}

          {images.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: images[selectedImageIndex].caption ? 60 : 8,
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                px: 2,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {selectedImageIndex + 1} / {images.length}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyImageGallery;

