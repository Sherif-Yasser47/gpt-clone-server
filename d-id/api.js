const axios = require('axios');

const baseURL = 'https://api.d-id.com';
const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Authorization': `Basic ${process.env.D_ID_API_KEY}`,
        'Content-Type': 'application/json'
      }
});


const getDIDVideo = async (input, user_id) => {
    const config = {
            script: {
                type: "text",
                input
            },
            source_url: "https://create-images-results.d-id.com/DefaultPresenters/Toman_f_ai/image.jpeg",
            webhook: "https://gpt-clone-server.onrender.com/api/gpt/video/webhook",
            user_data: user_id
    };
    let response = await axiosInstance.post('/talks', config);
    return response.data.id;
}   

module.exports = getDIDVideo;
