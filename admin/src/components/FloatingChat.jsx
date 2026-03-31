import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Badge,
    Divider,
    Fade,
    Zoom
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    Minimize as MinimizeIcon
} from '@mui/icons-material';
import { gsap } from 'gsap';
import api from '../services/api';

export default function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    const chatButtonRef = useRef(null);
    const chatWindowRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch rooms periodically
        fetchRooms();
        const interval = setInterval(fetchRooms, 10000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            fetchMessages(selectedRoom.id);
            const interval = setInterval(() => fetchMessages(selectedRoom.id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchRooms = async () => {
        try {
            const res = await api.get('/api/chat/admin/rooms');
            if (res.data.success) {
                setRooms(res.data.data);
                const unread = res.data.data.reduce((acc, room) => acc + (room._count?.messages || 0), 0);
                setUnreadCount(unread);
            }
        } catch (e) {
            console.error('Error fetching rooms:', e);
        }
    };

    const fetchMessages = async (roomId) => {
        try {
            const res = await api.get(`/api/chat/messages/${roomId}`);
            if (res.data.success) {
                setMessages(res.data.data);
            }
        } catch (e) {
            console.error('Error fetching messages:', e);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom) return;

        try {
            await api.post('/api/chat/send', {
                roomId: selectedRoom.id,
                message: newMessage
            });
            setNewMessage('');
            fetchMessages(selectedRoom.id);
        } catch (e) {
            console.error('Error sending message:', e);
        }
    };

    const toggleChat = () => {
        if (!isOpen) {
            setIsOpen(true);
            // Animate chat window opening
            gsap.fromTo(
                chatWindowRef.current,
                { scale: 0, opacity: 0, y: 50 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
            );
        } else {
            // Animate chat window closing
            gsap.to(chatWindowRef.current, {
                scale: 0,
                opacity: 0,
                y: 50,
                duration: 0.3,
                ease: 'back.in(1.7)',
                onComplete: () => setIsOpen(false)
            });
        }
    };

    const handleRoomSelect = (room) => {
        setSelectedRoom(room);
        // Animate room selection
        gsap.fromTo(
            '.chat-messages-container',
            { x: 20, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3 }
        );
    };

    return (
        <>
            {/* Floating Chat Button */}
            <Box
                ref={chatButtonRef}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    zIndex: 9999,
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' }
                }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.2)' },
                                '100%': { transform: 'scale(1)' }
                            }
                        }
                    }}
                >
                    <Box
                        onClick={toggleChat}
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 12px 32px rgba(99, 102, 241, 0.6)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        <ChatIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                </Badge>
            </Box>

            {/* Chat Window */}
            {isOpen && (
                <Paper
                    ref={chatWindowRef}
                    elevation={24}
                    sx={{
                        position: 'fixed',
                        bottom: 120,
                        right: 32,
                        width: 400,
                        height: 600,
                        borderRadius: 4,
                        overflow: 'hidden',
                        zIndex: 9998,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: 'white',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ChatIcon />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {selectedRoom ? selectedRoom.user?.fullName : 'Customer Chats'}
                            </Typography>
                        </Box>
                        <Box>
                            {selectedRoom && (
                                <IconButton
                                    size="small"
                                    sx={{ color: 'white', mr: 1 }}
                                    onClick={() => setSelectedRoom(null)}
                                >
                                    <MinimizeIcon />
                                </IconButton>
                            )}
                            <IconButton
                                size="small"
                                sx={{ color: 'white' }}
                                onClick={toggleChat}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Content */}
                    {!selectedRoom ? (
                        // Room List
                        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                            {rooms.length > 0 ? (
                                rooms.map((room) => (
                                    <React.Fragment key={room.id}>
                                        <ListItem
                                            button
                                            onClick={() => handleRoomSelect(room)}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: 'rgba(99, 102, 241, 0.08)'
                                                }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {room.user?.fullName?.charAt(0) || 'U'}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={room.user?.fullName || 'Unknown User'}
                                                secondary={room.lastMessage || 'No messages yet'}
                                                primaryTypographyProps={{ fontWeight: 600 }}
                                                secondaryTypographyProps={{ noWrap: true }}
                                            />
                                            {room._count?.messages > 0 && (
                                                <Badge badgeContent={room._count.messages} color="error" />
                                            )}
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))
                            ) : (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No active chats
                                    </Typography>
                                </Box>
                            )}
                        </List>
                    ) : (
                        // Messages View
                        <>
                            <Box
                                className="chat-messages-container"
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    p: 2,
                                    bgcolor: '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1
                                }}
                            >
                                {messages.map((msg, idx) => {
                                    const isSentByAdmin = msg.senderId !== selectedRoom.userId;
                                    return (
                                        <Zoom in key={idx} style={{ transitionDelay: `${idx * 50}ms` }}>
                                            <Box
                                                sx={{
                                                    alignSelf: isSentByAdmin ? 'flex-end' : 'flex-start',
                                                    maxWidth: '75%'
                                                }}
                                            >
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        bgcolor: isSentByAdmin ? '#6366f1' : 'white',
                                                        color: isSentByAdmin ? 'white' : 'text.primary',
                                                        borderBottomRightRadius: isSentByAdmin ? 4 : 16,
                                                        borderBottomLeftRadius: isSentByAdmin ? 16 : 4
                                                    }}
                                                >
                                                    <Typography variant="body2">{msg.message}</Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            mt: 0.5,
                                                            opacity: 0.7,
                                                            fontSize: '0.65rem'
                                                        }}
                                                    >
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        </Zoom>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </Box>

                            {/* Message Input */}
                            <Box
                                component="form"
                                onSubmit={handleSendMessage}
                                sx={{
                                    p: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    gap: 1,
                                    bgcolor: 'white'
                                }}
                            >
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3
                                        }
                                    }}
                                />
                                <IconButton
                                    type="submit"
                                    color="primary"
                                    disabled={!newMessage.trim()}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.dark'
                                        },
                                        '&:disabled': {
                                            bgcolor: 'action.disabledBackground'
                                        }
                                    }}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Paper>
            )}
        </>
    );
}
