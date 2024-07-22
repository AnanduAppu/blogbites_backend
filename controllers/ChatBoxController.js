const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');
const userModel = require('../Schema/users');
const ChatModel = require('../Schema/ChatRoom');
const MessageModel = require('../Schema/messageSchema');
const { tryCatch } = require('../middlewares/trycatch');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173', // Adjust to your React app's URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // Allow credentials
  },
});

const listingFriends = tryCatch(async (req, res) => {
  const userid = req.query.id;
  const checkUser = await userModel.findOne({ _id: userid }).populate('followed');
  if (!checkUser) {
    return res.status(400).send('User does not exist');
  }
  res.status(200).json({
    Data: checkUser.followed,
    success: true,
  });
});

const creatingChatRoom = tryCatch(async (req, res) => {
  const { userid, anotherUserId } = req.body;
  let chatRoom = await ChatModel.findOne({
    isGroup: false,
    users: { $all: [userid, anotherUserId] },
  });

  if (chatRoom) {
    const token = jwt.sign({ chatRoomId: chatRoom._id, recieverid: anotherUserId }, process.env.secreteKey, { expiresIn: '1h' });
    res.cookie('chatRoomId', token, {
      httpOnly: true,
      secure: 'production',
      sameSite:  'None' ,
      maxAge: 24 * 60 * 60 * 1000 
  
    });
    res.status(200).json({
      message: 'Chat room already exists',
      success: true,
      chatRoom: chatRoom,
    });
  } else {
    const newChatRoom = await ChatModel.create({
      users: [userid, anotherUserId],
      isGroup: false,
    });
    const token = jwt.sign({ chatRoomId: newChatRoom._id }, process.env.secreteKey, { expiresIn: '1h' });
    res.cookie('chatRoomId', token, { httpOnly: true });
    res.status(201).json({
      message: 'New chat room created',
      success: true,
      chatRoom: newChatRoom,
    });
  }
});

const sendMessage = tryCatch(async (req, res) => {
  const { senderId, messageText } = req.body;
  console.log('Sender ID:', senderId);
  console.log('Message Text:', messageText);

  const token = req.cookies.chatRoomId;
  if (!token) {
    return res.status(401).json({ message: 'No chat room ID found in cookies' });
  }

  try {
    const decoded = jwt.verify(token, process.env.secreteKey);
    const chatId = decoded.chatRoomId;

    const newMessage = await MessageModel.create({
      sender: senderId,
      message: messageText,
      chatId: chatId,
    });

    await ChatModel.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
    });

    const populatedMessage = await newMessage.populate('sender');

    io.to(chatId).emit('newMessage', populatedMessage);

    res.status(201).json({
      message: 'Message sent successfully',
      newMessage: populatedMessage,
    });
  } catch (error) {
    console.error('Error verifying token or sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

const getMessagesForChat = tryCatch(async (req, res) => {
  const token = req.cookies.chatRoomId;
  if (!token) {
    return res.status(401).json({ message: 'No chat room ID found in cookies' });
  }

  try {
    const decoded = jwt.verify(token, process.env.secreteKey);
    const chatId = decoded.chatRoomId;
    const recievId = decoded.recieverid;

    const checkUser = await userModel.findOne({ _id: recievId });

    const messages = await MessageModel.find({ chatId }).populate('sender');
    res.status(200).json({
      messages,
      chatId,
      checkUser,
    });
  } catch (error) {
    console.error('Error verifying token or fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

module.exports = {
  listingFriends,
  creatingChatRoom,
  sendMessage,
  getMessagesForChat,
};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinRoom', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`User joined room ${chatRoomId}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3500;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});
