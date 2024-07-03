const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    GroupName: {
      type: String,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userData',
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model('Chat', chatSchema);
