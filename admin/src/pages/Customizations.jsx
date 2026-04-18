import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    DesignServices as DesignIcon,
    CheckCircle as SuccessIcon,
    Pending as PendingIcon,
    Cancel as CancelIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { toAbsoluteUrl } from '../services/url';
import {
    FULFILMENT_PRODUCT_TYPES,
    titleForPath,
} from '../constants/fulfilmentNav';

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'];

/** Dummy partner print shops — assign orders for fulfilment */
const PRINT_PARTNER_SHOPS = [
    'Hopuz Printers and Packages',
    'Enprime Graphics',
    'Falcon Pack',
];

const formatMoneyInput = (v) => {
    if (v === undefined || v === null || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) ? String(n) : '';
};

const CustomizationCard = ({ order, onRefresh }) => {
    const [statusDraft, setStatusDraft] = useState(
        (order.status || 'pending').toLowerCase()
    );
    const [quoteDraft, setQuoteDraft] = useState(() =>
        formatMoneyInput(order.amount)
    );
    const [paperDraft, setPaperDraft] = useState(() =>
        formatMoneyInput(order.paperPrice)
    );
    const [printingDraft, setPrintingDraft] = useState(() =>
        formatMoneyInput(order.printingCharge)
    );
    const [dieDraft, setDieDraft] = useState(() =>
        formatMoneyInput(order.dieCutting)
    );
    const [noteDraft, setNoteDraft] = useState(order.notes || '');
    const [shopDraft, setShopDraft] = useState(order.assignedShop || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setStatusDraft((order.status || 'pending').toLowerCase());
        setQuoteDraft(formatMoneyInput(order.amount));
        setPaperDraft(formatMoneyInput(order.paperPrice));
        setPrintingDraft(formatMoneyInput(order.printingCharge));
        setDieDraft(formatMoneyInput(order.dieCutting));
        setNoteDraft(order.notes || '');
        setShopDraft(order.assignedShop || '');
    }, [
        order.status,
        order.rawId,
        order.amount,
        order.paperPrice,
        order.printingCharge,
        order.dieCutting,
        order.notes,
        order.assignedShop,
    ]);

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

    const numOrUndef = (s) => {
        const t = String(s ?? '').trim();
        if (t === '') return undefined;
        const n = parseFloat(t);
        return Number.isFinite(n) ? n : undefined;
    };

    const closeEnough = (a, b) => Math.abs(Number(a) - Number(b)) < 0.005;

    const serverAmount = Number(order.amount ?? 0);
    const serverNotes = order.notes || '';

    const draftTotal = quoteDraft.trim() === '' ? 0 : Number(quoteDraft);
    const amountDirty =
        Number.isFinite(draftTotal) && !closeEnough(draftTotal, serverAmount);

    const breakdownPartDirty = (draft, serverVal) => {
        const t = String(draft ?? '').trim();
        const s =
            serverVal == null || serverVal === ''
                ? null
                : Number(serverVal);
        if (!t) return s != null;
        const n = parseFloat(t);
        if (!Number.isFinite(n)) return false;
        if (s == null) return true;
        return !closeEnough(n, s);
    };
    const breakdownDirty =
        breakdownPartDirty(paperDraft, order.paperPrice) ||
        breakdownPartDirty(printingDraft, order.printingCharge) ||
        breakdownPartDirty(dieDraft, order.dieCutting);
    const notesDirty = noteDraft.trim() !== serverNotes.trim();
    const statusDirty =
        statusDraft !== (order.status || 'pending').toLowerCase();
    const shopDirty =
        (shopDraft || '').trim() !== (order.assignedShop || '').trim();
    const hasChanges =
        statusDirty ||
        amountDirty ||
        breakdownDirty ||
        notesDirty ||
        shopDirty;

    const handleSave = async () => {
        const payload = { status: statusDraft };
        if (amountDirty) {
            const q = numOrUndef(quoteDraft);
            payload.amount = q !== undefined ? q : 0;
        }
        if (breakdownDirty) {
            payload.paperPrice =
                paperDraft.trim() === '' ? null : numOrUndef(paperDraft) ?? null;
            payload.printingCharge =
                printingDraft.trim() === ''
                    ? null
                    : numOrUndef(printingDraft) ?? null;
            payload.dieCutting =
                dieDraft.trim() === '' ? null : numOrUndef(dieDraft) ?? null;
        }
        if (notesDirty) {
            payload.note = noteDraft.trim() === '' ? null : noteDraft.trim();
        }
        if (shopDirty) {
            payload.assignedShop =
                shopDraft.trim() === '' ? null : shopDraft.trim();
        }
        try {
            setSaving(true);
            await api.put(`/api/admin/customizations/${order.rawId}/status`, payload);
            await onRefresh();
        } catch (error) {
            console.error('Failed to save customization:', error);
            alert(
                error.response?.data?.error?.message ||
                    error.response?.data?.message ||
                    'Failed to save'
            );
        } finally {
            setSaving(false);
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start', gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                            Order #{order.id}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Outfit' }}>
                            {order.customerName}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                            <Chip size="small" variant="outlined" label={`Line: ${order.productLine || '—'}`} />
                            <Chip
                                size="small"
                                label={`Payment: ${(order.paymentStatus || 'pending').toLowerCase()}`}
                                color={
                                    (order.paymentStatus || '').toLowerCase() === 'paid'
                                        ? 'success'
                                        : (order.paymentStatus || '').toLowerCase() === 'failed'
                                            ? 'error'
                                            : 'warning'
                                }
                            />
                        </Stack>
                    </Box>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        icon={getStatusIcon(order.status)}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: 1.5, flexShrink: 0 }}
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
                        <Typography variant="caption" color="text.secondary" display="block">Current quote (saved)</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ₹{Number(order.amount || 0).toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {order.fileUrl && (
                            <Tooltip title="Open attachment">
                                <IconButton
                                    size="small"
                                    component="a"
                                    href={order.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                                >
                                    <PdfIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                    Admin quote & pricing (₹)
                </Typography>
                <TextField
                    size="small"
                    fullWidth
                    label="Total quote"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={quoteDraft}
                    onChange={(e) => setQuoteDraft(e.target.value)}
                    sx={{ mb: 1.5 }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                    <TextField
                        size="small"
                        label="Paper"
                        type="number"
                        inputProps={{ min: 0, step: '0.01' }}
                        value={paperDraft}
                        onChange={(e) => setPaperDraft(e.target.value)}
                        sx={{ flex: '1 1 120px', minWidth: 100 }}
                    />
                    <TextField
                        size="small"
                        label="Printing"
                        type="number"
                        inputProps={{ min: 0, step: '0.01' }}
                        value={printingDraft}
                        onChange={(e) => setPrintingDraft(e.target.value)}
                        sx={{ flex: '1 1 120px', minWidth: 100 }}
                    />
                    <TextField
                        size="small"
                        label="Die cut"
                        type="number"
                        inputProps={{ min: 0, step: '0.01' }}
                        value={dieDraft}
                        onChange={(e) => setDieDraft(e.target.value)}
                        sx={{ flex: '1 1 120px', minWidth: 100 }}
                    />
                </Box>
                <TextField
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    label="Internal note (optional, visible to customer in app)"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                    Partner print shop
                </Typography>
                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel id={`shop-${order.rawId}`}>Assign shop</InputLabel>
                    <Select
                        labelId={`shop-${order.rawId}`}
                        label="Assign shop"
                        value={shopDraft}
                        onChange={(e) => setShopDraft(e.target.value)}
                    >
                        <MenuItem value="">
                            <em>Unassigned</em>
                        </MenuItem>
                        {PRINT_PARTNER_SHOPS.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                    Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id={`status-${order.rawId}`}>Status</InputLabel>
                        <Select
                            labelId={`status-${order.rawId}`}
                            label="Status"
                            value={statusDraft}
                            onChange={(e) => setStatusDraft(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        size="small"
                        disabled={saving || !hasChanges}
                        onClick={handleSave}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default function Customizations() {
    const { productType } = useParams();
    const isGenericRoute = !productType;
    const isKnownProductType =
        productType &&
        FULFILMENT_PRODUCT_TYPES.some((x) => x.id === productType);

    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomizations();
    }, []);

    if (productType && !isKnownProductType) {
        return <Navigate to="/" replace />;
    }

    const fetchCustomizations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/customizations');
            if (response.data.success) {
                // Map backend data to match UI expectations
                const mappedData = response.data.data.customizations.map(item => ({
                    rawId: item.id,
                    id: `CUST-${item.id}`,
                    customerName: item.user?.fullName || 'Anonymous',
                    productType: item.productType,
                    productLine: item.productLine || null,
                    requirements: item.requirements,
                    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                    amount: item.amount,
                    paperPrice: item.paperPrice,
                    printingCharge: item.printingCharge,
                    dieCutting: item.dieCutting,
                    notes: item.notes,
                    paymentStatus: item.paymentStatus || 'pending',
                    paymentReference: item.paymentReference || null,
                    assignedShop: item.assignedShop || null,
                    date: item.createdAt,
                    fileUrl: item.fileUrl ? toAbsoluteUrl(item.fileUrl) : null,
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

    const filteredOrders = orders.filter((order) => {
        if (isGenericRoute) {
            const pl = String(order.productLine || '').trim().toLowerCase();
            if (pl === 'printing' || pl === 'packaging') return false;
        } else {
            if (
                (order.productType || '').toLowerCase() !==
                String(productType).toLowerCase()
            ) {
                return false;
            }
        }
        const q = searchTerm.toLowerCase();
        const matchSearch =
            order.customerName.toLowerCase().includes(q) ||
            order.id.toLowerCase().includes(q) ||
            order.productType.toLowerCase().includes(q) ||
            (order.assignedShop && order.assignedShop.toLowerCase().includes(q));
        return matchSearch;
    });

    const pageTitle = titleForPath(
        isGenericRoute ? '/customizations' : `/fulfilment/${productType}`
    );
    const pageSubtitle = isGenericRoute
        ? 'Generic customization requests (not tied to print / pack configure flow)'
        : `Orders where the customer chose this product type. Payment, shop assignment, and status below.`;

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
                        {pageTitle}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {pageSubtitle}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
                            <CustomizationCard order={order} onRefresh={fetchCustomizations} />
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(0,0,0,0.01)', border: '2px dashed rgba(0,0,0,0.05)' }} elevation={0}>
                            <Box sx={{ opacity: 0.5, mb: 2 }}>
                                <DesignIcon sx={{ fontSize: 64 }} />
                            </Box>
                            <Typography variant="h6" color="text.secondary">No orders in this view</Typography>
                            <Typography variant="body2" color="text.disabled">Try another search term or open a different menu item</Typography>
                        </Paper>
                    </Grid>
                )} 
            </Grid>
        </Box>
    );
}
