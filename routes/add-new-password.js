var express = require('express');
var router = express.Router();
var userModule = require('../modules/user');//users model
var passCatModel = require('../modules/password_category');//password_category model
var passModel = require('../modules/add_password');//Add Password model
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { reset } = require('nodemon');
const { body, validationResult } = require('express-validator');
var getPassCat = passCatModel.find({});//Get password Category Date From The database
var getAllPass = passModel.find({});//Get All password Category Date From The database



//Node Local Storage
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}


//Check Login User Middleware
function checkLoginUser(req, res, next) {
    var userToken = localStorage.getItem('userToken');
    try {
        var decoded = jwt.verify(userToken, 'loginToken');
    } catch (err) {
        res.redirect('/');
    }
    next();
}

//Username Check Middleware
function checkUsername(req, res, next) {
    var uname = req.body.uname;
    var checkexistUsername = userModule.findOne({ username: uname });
    checkexistUsername.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Password Management System', msg: 'Username Already Exists' });
        }
        next();
    })
}
//Email Check Middleware
function checkEmail(req, res, next) {
    var email = req.body.email;
    var checkexistemail = userModule.findOne({ email: email });
    checkexistemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('signup', { title: 'Password Management System', msg: 'Email Already Exists' });
        }
        next();
    })
}

/* GET Add New Password page. */
router.get('/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    getPassCat.exec(function (err, data) {
        if (err) throw err;
        res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success: '' });
    });
});

/* POST Add New Password page. */
router.post('/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var pass_cat = req.body.pass_cat;
    var project_name = req.body.project_name;
    var pass_details = req.body.pass_details;
    //get the date from database
    var password_details = new passModel({
        password_category: pass_cat,
        project_name: project_name,
        password_details: pass_details
    });
    password_details.save(function (err, doc) {
        getPassCat.exec(function (err, data) {
            if (err) throw err;
            res.render('add-new-password', { title: 'Password Management System', loginUser: loginUser, records: data, success: 'Password Details Inserted Succeessfully' });
        });
    });
});


module.exports = router;