import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import api from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/admin/products');
      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/admin/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please check the console for details.');
      }
    }
  };

  const getImageUrl = (images) => {
    if (!images) return null;
    // Handle already normalized array from backend
    let imageArray = images;
    if (!Array.isArray(imageArray)) {
      if (typeof imageArray === 'string') {
        try {
          imageArray = JSON.parse(imageArray);
        } catch (e) {
          imageArray = [imageArray];
        }
      } else {
        imageArray = [imageArray];
      }
    }
    if (imageArray.length === 0) return null;
    const firstImage = imageArray[0];
    if (!firstImage || typeof firstImage !== 'string') return null;
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      return firstImage;
    }
    // Use relative URL (will be proxied by Vite in dev, or use full URL in production)
    const baseURL = import.meta.env.VITE_API_URL || '';
    if (baseURL) {
      return `${baseURL}/uploads/${firstImage}`;
    }
    return `/uploads/${firstImage}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
        >
          Add Product
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No products found. Click "Add Product" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const imageUrl = getImageUrl(product.images);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {imageUrl ? (
                        <Avatar
                          src={imageUrl}
                          alt={product.name}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        >
                          <ImageIcon />
                        </Avatar>
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'grey.300' }}>
                          <ImageIcon />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category?.name || 'N/A'}</TableCell>
                    <TableCell>₹{Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>{product.stockQuantity || 0}</TableCell>
                    <TableCell>
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
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/products/${product.id}`)}
                        title="View Product"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        title="Edit Product"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product.id)}
                        color="error"
                        title="Delete Product"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

