import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip,
  Button,
  ListItemIcon
} from '@mui/material';
import {
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
  GridView as GridViewIcon,
  AddShoppingCart as AddProductIcon,
  Assignment as OrdersIcon,
  Category as CategoryIcon,
  NotificationsActive as AlertIcon,
  FiberManualRecord as DotIcon,
  TaskAlt as TaskIcon,
  LinearScale as ScaleIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { pageAnimations } from '../utils/animations';
import { useEffect as useAnimationEffect } from 'react';
import { uploadsUrl } from '../services/url';

const StatCard = ({ title, value, icon, color, trend }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'divider',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '4px',
        height: '100%',
        bgcolor: color,
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: trend.startsWith('-') ? 'error.main' : 'success.main', fontWeight: 700 }}>
              {trend}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>since last month</Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Box>
    </Box>
  </Paper>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
    recentOrders: [],
    salesChartData: [],
    topProducts: [],
    newUsers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Animate elements after data loads
  useAnimationEffect(() => {
    if (!loading && data) {
      // Animate stat cards
      pageAnimations.staggerCards('.stat-card', { stagger: 0.1, delay: 0.2 });

      // Animate action buttons
      pageAnimations.fadeIn('.action-card', { stagger: 0.08, delay: 0.6 });

      // Animate list items
      setTimeout(() => {
        pageAnimations.listStagger('.list-item', { stagger: 0.05, delay: 0 });
      }, 800);
    }
  }, [loading, data]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/dashboard');
      if (response.data.success) {
        setData(response.data.data);
      } else {
        console.error('API responded with success:false', response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Check if it's a connection error
      if (!error.response && error.request) {
        console.error('Network connection refused or server unreachable');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography sx={{ fontFamily: 'Outfit', fontWeight: 600, color: 'text.secondary' }}>
          Loading your dashboard insights...
        </Typography>
      </Box>
    );
  }

  const stats = data?.stats || { totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 };
  const recentOrders = data?.recentOrders || [];
  const salesChartData = data?.salesChartData || [];
  const topProducts = data?.topProducts || [];
  const newUsers = data?.newUsers || [];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, fontFamily: 'Outfit' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Here's what's happening across your store today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            variant="text"
            sx={{ fontWeight: 600 }}
          >
            Refresh
          </Button>
          <Chip
            icon={<TrendingUpIcon />}
            label="Live Analytics"
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3} className="stat-card">
          <StatCard
            title="Total Users"
            value={(stats.totalUsers || 0).toLocaleString()}
            icon={<PeopleIcon />}
            color="#6366f1"
            trend="+12.5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} className="stat-card">
          <StatCard
            title="Total Products"
            value={(stats.totalProducts || 0).toLocaleString()}
            icon={<InventoryIcon />}
            color="#a855f7"
            trend="+3.2%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} className="stat-card">
          <StatCard
            title="Total Orders"
            value={(stats.totalOrders || 0).toLocaleString()}
            icon={<ShoppingCartIcon />}
            color="#f59e0b"
            trend="+18.4%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} className="stat-card">
          <StatCard
            title="Total Revenue"
            value={`₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            icon={<MoneyIcon />}
            color="#10b981"
            trend="+22.1%"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Quick Management & Actions */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Action Center */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(99, 102, 241, 0.02)' }} elevation={0}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Outfit', mb: 3 }}>Quick Management</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Add Product', icon: <AddProductIcon />, path: '/products/new', color: '#6366f1' },
                    { label: 'View Orders', icon: <OrdersIcon />, path: '/orders', color: '#f59e0b' },
                    { label: 'Manage Users', icon: <PeopleIcon />, path: '/users', color: '#10b981' },
                    { label: 'Categories', icon: <GridViewIcon />, path: '/categories', color: '#a855f7' }
                  ].map((action, idx) => (
                    <Grid item xs={6} sm={3} key={idx}>
                      <Paper
                        onClick={() => navigate(action.path)}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          borderRadius: 3,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: '1px solid transparent',
                          '&:hover': {
                            bgcolor: '#ffffff',
                            transform: 'translateY(-4px)',
                            borderColor: action.color,
                            boxShadow: `0 10px 20px -10px ${action.color}40`
                          }
                        }}
                        elevation={0}
                      >
                        <Box sx={{ color: action.color, mb: 1 }}>{React.cloneElement(action.icon, { sx: { fontSize: 32 } })}</Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{action.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            {/* Top Products (Real Backend Data) */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: 520,
                  display: 'flex',
                  flexDirection: 'column'
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InventoryIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Outfit' }}>Top Products</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
                  <List sx={{ p: 0 }}>
                    {topProducts.length > 0 ? topProducts.map((product) => (
                      <ListItem key={product.id} sx={{ px: 0, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={uploadsUrl(product.image)}
                            variant="rounded"
                            sx={{ width: 48, height: 48, bgcolor: 'rgba(0,0,0,0.05)' }}
                          >
                            <InventoryIcon sx={{ fontSize: 24, color: 'text.secondary' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.title}
                          secondary={`Stock: ${product.stock} | ₹${product.price.toLocaleString()}`}
                          primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700, noWrap: true }}
                          secondaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                        />
                      </ListItem>
                    )) : (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No product data available.
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Box>
              </Paper>
            </Grid>

            {/* Newest Users (Real Backend Data) */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: 520,
                  display: 'flex',
                  flexDirection: 'column'
                }}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PeopleIcon color="secondary" />
                  <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Outfit' }}>Newest Users</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
                  <List sx={{ p: 0 }}>
                    {newUsers.length > 0 ? newUsers.map((user) => (
                      <ListItem key={user.id} sx={{ px: 0, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(168, 85, 247, 0.1)', color: 'secondary.main', fontWeight: 700 }}>
                            {user.fullName?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.fullName}
                          secondary={user.email}
                          primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700, noWrap: true }}
                          secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                        />
                      </ListItem>
                    )) : (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No new users found.
                        </Typography>
                      </Box>
                    )}
                  </List>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              maxHeight: 520, // Set a fixed height to match left side visual height
              display: 'flex',
              flexDirection: 'column'
            }}
            elevation={0}
          >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Outfit' }}>Recent Orders</Typography>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
              <List sx={{ width: '100%', py: 0 }}>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main', fontWeight: 700 }}>
                            {order.user?.fullName?.charAt(0) || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{order.user?.fullName}</Typography>
                              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>₹{order.total.toLocaleString()}</Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </Typography>
                              <Chip
                                label={order.orderStatus}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  bgcolor: order.orderStatus === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                  color: order.orderStatus === 'completed' ? '#10b981' : '#f59e0b'
                                }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentOrders.length - 1 && <Divider variant="inset" component="li" sx={{ ml: 7, opacity: 0.5 }} />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No recent activity found.</Typography>
                  </Box>
                )}
              </List>
            </Box>

            {recentOrders.length > 0 && (
              <Box sx={{ pt: 2, mt: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button fullWidth variant="text" sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.8rem' }}>
                  View All Transactions
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
