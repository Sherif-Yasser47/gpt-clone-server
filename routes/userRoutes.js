const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../db/users');
const sendOTPmail = require('../sendGrid/sendGrid');
// const { uploadAudio, uploadImage } = require('../d-id/uploadResources');

router.post('/register', async (req, res, next) => {
    try {
        // await User.checkEmail(req.body.email);
        const user = new User({ ...req.body });
        let otp = await user.generateOTP();
        await sendOTPmail(req.body.email, otp);
        await user.save();
        res.status(201).send({ user });
    }
    catch (err) {
        err.status = 400;
        next(err);
    }
});


router.post('/login', async (req, res, next) => {
    try {
        if (!req.body.email || !req.body.password) {
            throw new Error('credentials are required');
        };
        const user = await User.findByCredentials(req.body.email, req.body.password);
        let otp = await user.generateOTP();
        await sendOTPmail(req.body.email, otp);
        return res.send({ user });
    } catch (error) {
        error.status = 400;
        next(error);
    }
});

router.post('/verify/:id', async (req, res, next) => {
    try {
        if (!req.body.otp) {
            throw new Error('OTP is required');
        };
        const user = await User.findById(req.params.id);
        await user.verifyOTP(req.body.otp);
        const token = await user.generateAuthToken();
        res.send({ status: 'verfied', user, token });
    } catch (error) {
        error.status = 403;
        next(error);
    }
});

router.get('/avatars', auth, async (req, res, next) => {
    try {
        let staticAvatars = [
            "https://create-images-results.d-id.com/DefaultPresenters/Toman_f_ai/image.jpeg",
            "https://create-images-results.d-id.com/DefaultPresenters/Toma_f_ai/image.jpg",
            "https://create-images-results.d-id.com/DefaultPresenters/Kanon_m_ai/image.jpeg",
            "https://create-images-results.d-id.com/DefaultPresenters/Andrew_m_ai/image.jpg"
        ]
        res.send({ success: true, staticAvatars })
    } catch (error) {
        error.status = 400;
        next(error);
    }

});

//User upload profile pic End-Point.
// const upload = multer({
//     limits: {
//         fileSize: 20000000
//     },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(png)$/i)) {
//             cb(new Error('Invalid file type'))
//         }
//         cb(undefined, true)
//     }
// })
// router.post('/avatar', auth, upload.single('image'), async (req, res, next) => {
//     try {
//         if (!req.file) {
//             throw new Error('image file is required');
//         }
//         const imgbuffer = req.file.buffer;
//         let imageURL = await uploadImage(imgbuffer);
//         req.user.avatar = imageURL.url;
//         await req.user.save();
//         res.send({ success: true })
//     } catch (error) {
//         error.status = 400;
//         next(error);
//     }

// });

module.exports = router;