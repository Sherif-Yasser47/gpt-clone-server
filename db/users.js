const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator')
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email format')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        trim: true,
    },
    otp: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
        trim: true
    },
    credits: {
        type: Number,
        default: 200
    }
}, {
    timestamps: true
});


userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password
    return user;
}


userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({_id: this._id.toString(), exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)}, process.env.JWT_SECRET_KEY);
    await this.save();
    return token;
};

userSchema.methods.generateOTP = async function () {
    let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    this.otp = otp;
    await this.save();
    return otp;
};

userSchema.methods.verifyOTP = async function (otp) {
    if (otp !== this.otp) {
        throw new Error('invalid OTP');
    }
    return true;
};



userSchema.statics.checkEmail = async function (email) {
    const existingUser = await this.findOne({ email });
    if (existingUser) {
        throw new Error('Email is already registered');
    };
    return;
};


userSchema.statics.findByCredentials = async function (email, pass) {
    const user = await this.findOne({ email });
    let err = new Error('wrong credentials');
    if (!user) {
        throw err;
    };
    let isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) { throw err; }
    return user;
};

userSchema.pre('save', async function () {
    if (this.$isNew || this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    };
    return;
});

const User = mongoose.model('User', userSchema);
module.exports = User;