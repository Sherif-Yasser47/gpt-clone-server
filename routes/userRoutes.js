const router = require('express').Router();

const User = require('../db/users');
const sendOTPmail = require('../sendGrid/sendGrid');

router.post('/register', async (req, res, next) => {
    try {
        await User.checkEmail(req.body.email);
        const user = new User({ ...req.body});
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
        res.send({ status:'verfied', user, token });
    } catch (error) {
        error.status = 403;
        next(error);
    }
});

module.exports = router;