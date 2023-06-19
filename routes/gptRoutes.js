const { Configuration, OpenAIApi } = require('openai');
const router = require('express').Router();
const Chat = require('../db/chats');
const auth = require('../middleware/auth');

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

//Receiving user question, saving chat history and sending back answer in response.
router.post('/', auth, async (req, res, next) => {
    try {
        if (!req.body.input) {
            throw new Error('input is missing');
        }
        let model = (req.body.model == 3.5) ? 'text-davinci-003' : 'text-curie-001';

        const prompt = req.body.input;

        const response = await reqOpenAI(prompt, model);

        let gptRes = response.data.choices[0].text.trim();

        const chatMessage = new Chat({
            user_input: req.body.input,
            gpt_answer: gptRes,
            user_id: req.user._id
        });

        await chatMessage.save();
        
        return res.status(200).send({input: req.body.input, gptRes});

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


module.exports = router;




