const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatRoom: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true }
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
