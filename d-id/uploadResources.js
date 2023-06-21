const axios = require('axios');

const baseURL = 'https://api.d-id.com';
const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Authorization': `Basic ${process.env.D_ID_API_KEY}`,
        "Content-Type": "multipart/form-data"
    }
});

const uploadAudio = async (audioFile) => {
    const payload = {
        audio: audioFile
    };
    let response = await axiosInstance.post('/audios', payload);
    return response.data;
}

const uploadImage = async (image) => {
    let response = await axiosInstance.post('/images', image);
    return response.data;
}

module.exports = { uploadAudio, uploadImage };
