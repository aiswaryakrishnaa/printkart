import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import api from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/admin/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error fetching product details. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    // Handle both string and array inputs
    let imageString = image;
    if (Array.isArray(image) && image.length > 0) {
      imageString = image[0];
    }
    if (typeof imageString !== 'string') return null;
    if (imageString.startsWith('http://') || imageString.startsWith('https://')) {
      return imageString;
    }
    // Use relative URL (will be proxied by Vite in dev, or use full URL in production)
    const baseURL = import.meta.env.VITE_API_URL || '';
    if (baseURL) {
      return `${baseURL}/uploads/${imageString}`;
    }
    return `/uploads/${imageString}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box>
        <Typography variant="h4" color="error">Product not found</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  // Handle images - could be JSON string, array, or single value
  let images = [];
  if (product.images) {
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images);
      } catch (e) {
        images = [product.images];
      }
    } else if (Array.isArray(product.images)) {
      images = product.images;
    } else {
      images = [product.images];
    }
  }
  // Ensure all images are strings
  images = images.filter(img => img && typeof img === 'string');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/products')}
          >
            Back
          </Button>
          <Typography variant="h4">{product.name}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/products/${id}/edit`)}
        >
          Edit Product
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            {images.length > 0 ? (
              <Box>
                {/* Main Image */}
                <Box
                  sx={{
                    width: '100%',
                    paddingTop: '75%',
                    position: 'relative',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    overflow: 'hidden',
                    mb: 2,
                  }}
                >
                  <img
                    src={getImageUrl(images[selectedImage])}
                    alt={product.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {images.map((image, index) => (
                      <Box
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: selectedImage === index ? 3 : 1,
                          borderColor: selectedImage === index ? 'primary.main' : 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  paddingTop: '75%',
                  position: 'relative',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <ImageIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No images available
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Product Information
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {product.name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {product.category?.name || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Chip
                  label={product.type === 'book' ? 'Book' : 'Printed Item'}
                  color={product.type === 'book' ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={product.status}
                  color={
                    product.status === 'active'
                      ? 'success'
                      : product.status === 'inactive'
                      ? 'default'
                      : 'warning'
                  }
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Price
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  ₹{Number(product.price).toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Stock Quantity
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {product.stockQuantity || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Availability
                </Typography>
                <Chip
                  label={product.availability?.replace('_', ' ').toUpperCase() || 'N/A'}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              {product.shortDescription && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Short Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {product.shortDescription}
                  </Typography>
                </Grid>
              )}

              {product.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {product.description}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {new Date(product.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body2">
                  {new Date(product.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
