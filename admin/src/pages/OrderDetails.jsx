import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/api/admin/orders/${id}`);
      if (response.data.success) {
        const orderData = response.data.data.order;
        setOrder(orderData);
        setStatus(orderData.orderStatus);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/api/admin/orders/${id}/status`, { status });
      await fetchOrder();
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please check the console for details.');
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    
    // Ensure we have a string
    let imageString = image;
    if (Array.isArray(image) && image.length > 0) {
      imageString = image[0];
    }
    
    if (typeof imageString !== 'string' || imageString.trim() === '') {
      return null;
    }
    
    // Handle absolute URLs
    if (imageString.startsWith('http://') || imageString.startsWith('https://')) {
      return imageString;
    }
    
    // Use relative URL (will be proxied by Vite in dev)
    const baseURL = import.meta.env.VITE_API_URL || '';
    if (baseURL) {
      return `${baseURL}/uploads/${imageString}`;
    }
    return `/uploads/${imageString}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      confirmed: 'primary',
      shipped: 'info',
      out_for_delivery: 'secondary',
      delivered: 'success',
      cancelled: 'error',
      returned: 'default',
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Order not found
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/orders')} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}>
            Order Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order #{order.orderNumber}
          </Typography>
        </Box>
        <Chip
          label={order.orderStatus?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}
          color={getStatusColor(order.orderStatus)}
          sx={{ fontWeight: 600, fontSize: '0.875rem' }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Order Items - Main Content */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Items ({order.items?.length || 0})
              </Typography>
              
              {order.items && order.items.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, pl: 0 }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, pr: 0 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item, index) => {
                        // STRICT: Always use item.image (snapshot) if it exists
                        // Only fallback to product image if item.image is null/undefined/empty
                        let imageSource = null;
                        
                        // Check if item.image exists and is valid
                        if (item.image !== null && item.image !== undefined) {
                          const imgValue = typeof item.image === 'string' ? item.image.trim() : String(item.image).trim();
                          if (imgValue !== '') {
                            imageSource = item.image;
                          }
                        }
                        
                        // Only fallback if item.image was not valid
                        if (!imageSource && item.product?.images) {
                          let productImages = [];
                          if (Array.isArray(item.product.images)) {
                            productImages = item.product.images;
                          } else if (typeof item.product.images === 'string') {
                            try {
                              const parsed = JSON.parse(item.product.images);
                              productImages = Array.isArray(parsed) ? parsed : [parsed];
                            } catch {
                              productImages = [item.product.images];
                            }
                          }
                          if (productImages.length > 0 && productImages[0]) {
                            imageSource = productImages[0];
                          }
                        }
                        
                        const imageUrl = getImageUrl(imageSource);
                        
                        return (
                          <TableRow key={item.id || index} hover>
                            <TableCell sx={{ pl: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {imageUrl ? (
                                  <Avatar
                                    src={imageUrl}
                                    alt={item.name}
                                    variant="rounded"
                                    sx={{ 
                                      width: { xs: 50, sm: 64 }, 
                                      height: { xs: 50, sm: 64 },
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  >
                                    <ImageIcon />
                                  </Avatar>
                                ) : (
                                  <Avatar
                                    variant="rounded"
                                    sx={{ 
                                      width: { xs: 50, sm: 64 }, 
                                      height: { xs: 50, sm: 64 },
                                      bgcolor: 'grey.100',
                                      border: '1px solid',
                                      borderColor: 'divider'
                                    }}
                                  >
                                    <ImageIcon sx={{ color: 'grey.400' }} />
                                  </Avatar>
                                )}
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                    {item.name}
                                  </Typography>
                                  {item.product?.sku && (
                                    <Typography variant="caption" color="text.secondary">
                                      SKU: {item.product.sku}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={item.quantity} 
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                ₹{Number(item.price).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 0 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                ₹{Number(item.total).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No items in this order
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Information - Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Customer Info */}
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Customer Information
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {order.user?.fullName || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {order.user?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Order Summary
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{Number(order.subtotal).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Shipping
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{Number(order.shippingCost).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tax
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      ₹{Number(order.tax).toFixed(2)}
                    </Typography>
                  </Box>
                  {order.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Discount
                      </Typography>
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        -₹{Number(order.discount).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ₹{Number(order.total).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Status Update */}
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Update Status
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    select
                    label="Order Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="returned">Returned</option>
                  </TextField>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleStatusUpdate}
                    disabled={updating || status === order.orderStatus}
                    size={isMobile ? 'medium' : 'large'}
                    sx={{ py: 1.5 }}
                  >
                    {updating ? <CircularProgress size={24} /> : 'Update Status'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Order Dates */}
            <Card elevation={2}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Order Timeline
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Created
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Box>
                  {order.deliveredAt && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Delivered
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(order.deliveredAt)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

