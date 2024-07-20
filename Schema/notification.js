const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    user: {  // The user who receives the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "userData",
        required: true
    },
    fromUser: {  // The user who performed the action
        type: mongoose.Schema.Types.ObjectId,
        ref: "userData",
        required: true
    },
    type: {
        type: String,
        enum: ["like", "comment", "follow", "message"], // Example types
        required: true
    },
    message: {
        type: String,
        required: true
    },
    blog: {  // Reference to the blog that is liked or commented on (if applicable)
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Notification", notificationSchema);
