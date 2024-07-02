const express = require('express');
const router = express();
const userChat = require('../controllers/ChatBoxController')


router.route("/Chatfriends").get(userChat.listingFriends);


module.exports = router;