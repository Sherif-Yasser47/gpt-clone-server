const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    user_input: {
        type: String,
        required: true,
        trim: true,
    },
    video_url: {
        type: String,
        trim: true,
    },
    talk_id: {
        type: String,
        trim: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    }
}, {
    timestamps: true
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;