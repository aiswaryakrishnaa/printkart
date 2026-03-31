import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Paper,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    MoreVert as MoreIcon,
    DesignServices as DesignIcon,
    CheckCircle as SuccessIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    Visibility as ViewIcon,
    PictureAsPdf as PdfIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import api from '../services/api';

const CustomizationCard = ({ order }) => {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'processing': return 'info';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'completed': return <SuccessIcon fontSize="small" />;
            case 'pending': return <PendingIcon fontSize="small" />;
            case 'cancelled': return <CancelIcon fontSize="small" />;
            default: return null;
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                    borderColor: 'primary.light'
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                            Order #{order.id}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Outfit' }}>
                            {order.customerName}
                        </Typography>
                    </Box>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        icon={getStatusIcon(order.status)}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                </Box>

                <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                <Box sx={{ py: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <DesignIcon fontSize="small" color="primary" /> {order.productType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 40
                    }}>
                        {order.requirements}
                    </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Quote Amount</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ₹{Number(order.amount || 0).toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {order.fileUrl && (
                            <Tooltip title="Download PDF">
                                <IconButton
                                    size="small"
                                    component="a"
                                    href={order.fileUrl}
                                    target="_blank"
                                    sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                                >
                                    <PdfIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title="View Details">
                            <IconButton size="small" sx={{ bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'primary.main' }}>
                                <ViewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default function Customizations() {
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomizations();
    }, []);

    const fetchCustomizations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/customizations');
            if (response.data.success) {
                // Map backend data to match UI expectations
                const mappedData = response.data.data.customizations.map(item => ({
                    id: `CUST-${item.id}`,
                    customerName: item.user?.fullName || 'Anonymous',
                    productType: item.productType,
                    requirements: item.requirements,
                    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                    amount: item.amount,
                    date: item.createdAt,
                    fileUrl: item.fileUrl ? (item.fileUrl.startsWith('http') ? item.fileUrl : `http://localhost:5000${item.fileUrl}`) : null,
                    fileName: item.fileName
                }));
                setOrders(mappedData);
            }
        } catch (error) {
            console.error('Error fetching customizations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
                        Customization Orders
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage bespoke requests and specialized printing orders
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: 'white' }
                        }}
                    />
                    <IconButton sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <FilterIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                        <Grid item xs={12} sm={6} md={4} key={order.id}>
                            <CustomizationCard order={order} />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.01)', border: '2px dashed rgba(0,0,0,0.05)' }} elevation={0}>
                            <Box sx={{ opacity: 0.5, mb: 2 }}>
                                <DesignIcon sx={{ fontSize: 64 }} />
                            </Box>
                            <Typography variant="h6" color="text.secondary">No customization orders found</Typography>
                            <Typography variant="body2" color="text.disabled">Try adjusting your search or filters</Typography>
                        </Paper>
                    </Grid>
                )} 
            </Grid>
        </Box>
    );
}
