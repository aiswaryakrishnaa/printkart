import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    TextField,
    IconButton,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import api from '../services/api';

export default function Chat() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom.id);
            const interval = setInterval(() => fetchMessages(selectedRoom.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedRoom]);

    const fetchRooms = async () => {
        try {
            const res = await api.get('/api/chat/admin/rooms');
            if (res.data.success) setRooms(res.data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const res = await api.get(`/api/chat/messages/${roomId}`);
            if (res.data.success) setMessages(res.data.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom) return;
        try {
            await api.post('/api/chat/send', { roomId: selectedRoom.id, message: newMessage });
            setNewMessage('');
            fetchMessages(selectedRoom.id);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>;

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 150px)', gap: 2 }}>
            <Paper sx={{ width: 300, overflowY: 'auto', borderRadius: 4 }}>
                <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>Active Chats</Typography>
                <Divider />
                <List>
                    {rooms.map(room => (
                        <ListItem
                            key={room.id}
                            button
                            selected={selectedRoom?.id === room.id}
                            onClick={() => setSelectedRoom(room)}
                        >
                            <ListItemAvatar>
                                <Avatar>{room.user?.fullName?.[0] || 'U'}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={room.user?.fullName || 'User'}
                                secondary={room.lastMessage}
                                primaryTypographyProps={{ variant: 'subtitle2', noWrap: true }}
                                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden' }}>
                {selectedRoom ? (
                    <>
                        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                            <Typography variant="subtitle1" fontWeight={700}>{selectedRoom.user?.fullName}</Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {messages.map((msg, i) => {
                                const isMe = msg.senderId !== selectedRoom.userId;
                                return (
                                    <Box
                                        key={i}
                                        sx={{
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: isMe ? 'primary.light' : 'grey.100',
                                            color: isMe ? 'white' : 'text.primary'
                                        }}
                                    >
                                        <Typography variant="body2">{msg.message}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                        <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <IconButton color="primary" type="submit"><SendIcon /></IconButton>
                        </Box>
                    </>
                ) : (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
                        <ChatIcon sx={{ fontSize: 60, mb: 2, opacity: 0.2 }} />
                        <Typography>Select a chat to start messaging</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
