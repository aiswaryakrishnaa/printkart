const prisma = require('../config/prisma');

// User: Get or Create Chat Room
exports.getOrCreateRoom = async (req, res, next) => {
    try {
        const userId = req.user.id;

        let room = await prisma.chatRoom.findUnique({
            where: { userId }
        });

        if (!room) {
            room = await prisma.chatRoom.create({
                data: { userId }
            });
        }

        res.json({ success: true, data: room });
    } catch (error) {
        next(error);
    }
};

// User & Admin: Get messages for a room
exports.getMessages = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Security check: Customer can only see their own room
        if (userRole === 'customer') {
            const room = await prisma.chatRoom.findUnique({
                where: { id: parseInt(roomId) }
            });
            if (room.userId !== userId) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        const messages = await prisma.chatMessage.findMany({
            where: { roomId: parseInt(roomId) },
            orderBy: { createdAt: 'asc' }
        });

        // Mark messages as read if receiver is accessing
        await prisma.chatMessage.updateMany({
            where: {
                roomId: parseInt(roomId),
                senderId: { not: userId },
                isRead: false
            },
            data: { isRead: true }
        });

        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// User & Admin: Send message
exports.sendMessage = async (req, res, next) => {
    try {
        const { roomId, message } = req.body;
        const userId = req.user.id;

        const chatMessage = await prisma.chatMessage.create({
            data: {
                roomId: parseInt(roomId),
                senderId: userId,
                message
            }
        });

        // Update room last message
        await prisma.chatRoom.update({
            where: { id: parseInt(roomId) },
            data: {
                lastMessage: message,
                lastMessageAt: new Date()
            }
        });

        res.status(201).json({ success: true, data: chatMessage });
    } catch (error) {
        next(error);
    }
};

// Admin: Get all chat rooms
exports.getAllRooms = async (req, res, next) => {
    try {
        const rooms = await prisma.chatRoom.findMany({
            include: {
                user: {
                    select: {
                        fullName: true,
                        profilePicture: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        messages: {
                            where: { isRead: false, senderId: { not: req.user.id } }
                        }
                    }
                }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        res.json({ success: true, data: rooms });
    } catch (error) {
        next(error);
    }
};
