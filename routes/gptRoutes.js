const { Configuration, OpenAIApi } = require('openai');
const router = require('express').Router();
const Chat = require('../db/chats');
const User = require('../db/users');
const auth = require('../middleware/auth');
const getDIDVideo = require('../d-id/api');

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(config);

//Make request to open AI API.
const reqOpenAI = async (prompt, model) => {
    try {
        const response = await openai.createCompletion({
            model,
            prompt,
            max_tokens: 1000,
            temperature: 0.5,
        });
        return response;
    } catch (error) {
        console.log(error);
    }
}

router.post('/video', auth, async (req, res, next) => {
    try {
        if (!req.body.input) {
            throw new Error('input is missing');
        }
        let model = (req.body.model == 3.5) ? 'text-davinci-003' : 'text-curie-001';

        const prompt = req.body.input;

        const response = await reqOpenAI(prompt, model);

        let gptRes = response.data.choices[0].text.trim();

        if (req.query.response === "text") {
            let chatMessage = new Chat({
                user_input: req.body.input,
                gptRes,
                user_id: req.user._id
            });
            await chatMessage.save();
            return res.status(200).send({ success: true, gptRes });
        }

        let talkId;

        if (req.query.type === "audio") {
            talkId = await getDIDVideo(req.user._id.toString(), gptRes, req.body.source_url, 'audio', req.body.rate, req.body.audio_url);
        } else {
            talkId = await getDIDVideo(req.user._id.toString(), gptRes, req.body.source_url, null, req.body.rate);
        }

        const chatMessage = new Chat({
            user_input: req.body.input,
            gptRes,
            talk_id: talkId,
            user_id: req.user._id
        });

        await chatMessage.save();

        return res.status(200).send({ success: true });

    } catch (error) {
        error.status = 400;
        next(error);
    }
});

router.post('/video/webhook', async (req, res, next) => {
    try {
        const chat = await Chat.findOne({ user_id: req.body.user_data, talk_id: req.body.id });
        chat.video_url = req.body.result_url;
        await chat.save();
        const user = await User.findById(req.body.user_data);
        user.credits = user.credits - 1;
        await user.save();
        res.status(200).end()
    } catch (error) {
        error.status = 400;
        next(error);
    }
});

// Returning user's previous chats history with paginaiton.
router.get('/chats', auth, async (req, res, next) => {
    try {
        const chats = await Chat.find({ user_id: req.user._id })
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .exec();
        return res.status(200).send(chats);
    } catch (error) {
        next(error)
    }
});


router.delete('/chats', auth, async (req, res, next) => {
    try {
        const chats = await Chat.deleteMany({ user_id: req.user._id })
        return res.status(200).send(chats);
    } catch (error) {
        next(error)
    }
});


module.exports = router;




