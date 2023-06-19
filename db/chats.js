const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    user_input: {
        type: String,
        required: true,
        trim: true,
    },
    gpt_answer: {
        type: String,
        required: true,
        trim: true,
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