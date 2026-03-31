import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Tooltip,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import api from '../services/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        userId: '',
        sendToAll: false,
        type: 'system',
        title: '',
        message: '',
        link: '',
    });

    const notificationTypes = [
        { value: 'order', label: 'Order Update' },
        { value: 'payment', label: 'Payment' },
        { value: 'shipping', label: 'Shipping' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'price_drop', label: 'Price Drop' },
        { value: 'system', label: 'System Notification' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notifRes, userRes] = await Promise.all([
                api.get('/api/admin/notifications'),
                api.get('/api/admin/users?limit=1000'),
            ]);

            if (notifRes.data.success) {
                setNotifications(notifRes.data.data.notifications);
            }
            if (userRes.data.success) {
                setUsers(userRes.data.data.users || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setFormData({
            userId: '',
            sendToAll: false,
            type: 'system',
            title: '',
            message: '',
            link: '',
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData };
            if (payload.sendToAll) {
                delete payload.userId;
            } else {
                payload.userId = parseInt(payload.userId);
            }

            await api.post('/api/admin/notifications', payload);
            fetchData();
            handleCloseDialog();
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('Failed to send notification: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.delete(`/api/admin/notifications/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting notification:', error);
            }
        }
    };

    const getTypeStyle = (type) => {
        switch (type) {
            case 'order': return { color: 'primary', icon: <NotificationsIcon /> };
            case 'promotion': return { color: 'secondary', icon: <NotificationsIcon /> };
            case 'system': return { color: 'info', icon: <NotificationsIcon /> };
            default: return { color: 'default', icon: <NotificationsIcon /> };
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
                        Notifications
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Broadcasting and user-specific notifications
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleOpenDialog}
                    sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}
                >
                    Send Notification
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Recipient</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Title & Message</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {notifications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No notifications sent yet</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            notifications.map((notification) => (
                                <TableRow key={notification.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light', color: 'primary.dark' }}>
                                                {notification.user?.fullName?.[0] || 'U'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {notification.user?.fullName || 'Unknown User'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {notification.user?.email || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={notification.type}
                                            size="small"
                                            color={getTypeStyle(notification.type).color}
                                            variant="outlined"
                                            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {notification.message}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={notification.isRead ? 'Read' : 'Unread'}
                                            size="small"
                                            color={notification.isRead ? 'success' : 'warning'}
                                            sx={{ fontWeight: 600, fontSize: '0.65rem' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Delete">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(notification.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Send Notification Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 700, fontFamily: 'Outfit' }}>
                        Send New Notification
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.sendToAll}
                                            onChange={(e) => setFormData({ ...formData, sendToAll: e.target.checked })}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="subtitle2">Send to all customers</Typography>
                                            <Typography variant="caption" color="text.secondary">This will broadcast the notification to every registered customer.</Typography>
                                        </Box>
                                    }
                                />
                            </Box>

                            {!formData.sendToAll && (
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Recipient"
                                    value={formData.userId}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    required={!formData.sendToAll}
                                >
                                    {users.filter(u => u.role === 'customer').map(user => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.fullName} ({user.email})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Notification Type"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        required
                                    >
                                        {notificationTypes.map(type => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Resource Link (Optional)"
                                        placeholder="/orders/123"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                label="Notification Title"
                                placeholder="Enter a catchy title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Message Body"
                                placeholder="Enter the notification message..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {submitting ? 'Sending...' : 'Send Now'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
