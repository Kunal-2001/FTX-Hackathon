const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/user')
const Startup = require('../models/startup')
const Review = require('../models/review')
const Investment = require('../models/investment')
const Razorpay = require('razorpay')
const nodemailer = require('nodemailer');
require('dotenv').config()
const maxAge = 3 * 24 * 60 * 60;

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const instance = new Razorpay({
    key_id: "rzp_test_mvc34vwanVg7nS",
    key_secret: "rHflEdIe7jKNGZE5wmMuohY6"
})

const create_token = (id) => {
    return jwt.sign({ id }, 'Hack NIT', {
        expiresIn: maxAge
    })
}

const handleError = (err) => {
    // console.log(err.code)
    let errors = { email: '', password: '' };
    if (err.message === 'Invalid password') {
        errors.password = 'Invalid password'
    }
    if (err.message === 'Invalid email') {
        errors.email = 'Invalid email'
    }
    if (err.code === 11000) {
        errors.email = 'Email already exists'
        return errors
    }
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            console.log(properties);
            errors[properties.path] = properties.message;
        });
    }
    return errors
}


module.exports.signup_post = async (req,res) => {
    try {
        const user = await User.create(req.body)
        const token = create_token(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ 
            id : user._id,
            name: user.name,
            useremail: user.email,
            token
        })
    } catch (err) {
        const errors = handleError(err)
        res.status(400).json({ errors });
    }
}
module.exports.login_post = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password)
        const token = create_token(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
        res.status(201).json({ 
            id: user._id,
            name: user.name,
            useremail: user.email,
            token 
        })
    } catch (err) {
        // console.log(err.message)
        const errors = handleError(err)
        res.status(400).json({ errors });
    }
}
module.exports.logout_get = async (req,res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}
module.exports.user_dashboard = async (req,res) => {
    try {
        const user = await User.findById(req.params.id)
        const startup = await Startup.find({userid : req.params.id})
        const investment = await Investment.find({userID : req.params.id})
        res.status(201).json({userid : user._id, username : user.name , useremail : user.email , startup,investment})
    } catch (err) {
        // console.log(err.message)
        const errors = handleError(err)
        res.status(400).json({ err });
    }
}
module.exports.add_startup_post = async (req,res) => {
    try {
        const startupIdea = await Startup.create(req.body)
        res.status(201).json(startupIdea)
    } catch (err) {
        res.status(400).json({ err });
    }
}
module.exports.startup_get_by_id = async (req,res) => {
    try {
        const startupdetail = await Startup.findById(req.params.id)
        res.status(201).json(startupdetail)
    } catch (err) {
        res.status(400).json({ err });
    }
}