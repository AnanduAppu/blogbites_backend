const userModel = require('../Schema/users')
const ChatModel = require('../Schema/ChatRoom')
const { tryCatch } = require("../middleWares/trycatch");
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');




const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
      origin: "http://localhost:5173", // Adjust to your React app's URL
      methods: ["GET", "POST"]
  }
});


const listingFriends = tryCatch(async(req,res)=>{

    const userid = req.query.id;

    const checkUser = await userModel.findOne({_id:userid}).populate('followed')
    
 if (!checkUser) {
    return res.status(400).send("User does not exist");
  }
  res.status(200).json({
    Data: checkUser.followed ,
    success: true
  });

})

const creatingChatRoom = tryCatch(async (req, res) => {
  const { userid, anotherUserId } = req.body;

  // Check if a chat room already exists between these users
  let chatRoom = await ChatModel.findOne({
    isGroup: false,
    users: { $all: [userid, anotherUserId] }
  }).populate('latestMessage');

  if (chatRoom) {
    // Chat room exists, return the latest message
    res.status(200).json({
      message: 'Chat room already exists',
      latestMessage: chatRoom.latestMessage,
    });
  } else {
    // Chat room does not exist, create a new one
    const newChatRoom = await ChatModel.create({
      users: [userid, anotherUserId],
      isGroup: false,
    });


    res.status(201).json({
      message: 'New chat room created',
      chatRoom: newChatRoom,
  
    });
  }
});


const sendMessage = tryCatch(async (req, res) => {
  const { chatId, senderId, messageText } = req.body;

  const newMessage = await MessageModel.create({
    sender: senderId,
    message: messageText,
    chatId: chatId,
  });

  // Update the chat room's latest message
  await ChatModel.findByIdAndUpdate(chatId, {
    latestMessage: newMessage._id
  });

  // Emit the message to the users in the chat room
  const chatRoom = await ChatModel.findById(chatId).populate('users');
  chatRoom.users.forEach(user => {
    io.to(user._id.toString()).emit('newMessage', newMessage);
  });

  res.status(201).json({
    message: 'Message sent successfully',
    newMessage
  });
});

const getMessagesForChat = tryCatch(async (req, res) => {
  const { chatId } = req.params;

  const messages = await MessageModel.find({ chatId }).populate('sender');

  res.status(200).json({
    messages,
  });
});

module.exports={

    listingFriends,
    creatingChatRoom ,
    sendMessage,
    getMessagesForChat
    
}


io.on('connection', (socket) => {
  console.log('A user connected');

  // Join room for a specific user
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});