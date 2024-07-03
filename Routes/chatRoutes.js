const express = require('express');
const router = express();
const userChat = require('../controllers/ChatBoxController')


router.route("/Chatfriends").get(userChat.listingFriends);
router.route("/ChatRoom").post(userChat.creatingChatRoom);
router.route("/sendMessage").post(userChat.sendMessage);
router.route("/showAllMessages").get(userChat.getMessagesForChat);


module.exports = router;