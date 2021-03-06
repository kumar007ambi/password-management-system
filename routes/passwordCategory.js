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

/* GET password Category page. */
router.get('/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    getPassCat.exec(function (err, data) {
        if (err) throw err;
        res.render('password_category', { title: 'Password Management System', loginUser: loginUser, records: data });
    });
});

/* GET password Category Delete page. */
router.get('/delete/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passcat_id = req.params.id;
    var passdelete = passCatModel.findByIdAndDelete(passcat_id);
    passdelete.exec(function (err) {
        if (err) throw err;
        res.redirect('/passwordCategory');
    });
});

/* GET password Category EDIT page. */
router.get('/edit/:id', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passcat_id = req.params.id;
    var getpassCategory = passCatModel.findById(passcat_id);
    getpassCategory.exec(function (err, data) {
        if (err) throw err;
        res.render('edit_pass_category', { title: 'Password Management System', loginUser: loginUser, errors: '', success: '', records: data, id: passcat_id });
    });
});

/* POST password Category EDIT page. */
router.post('/edit/', checkLoginUser, function (req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var passcat_id = req.body.id;
    var passwordCategory = req.body.passwordCategory;
    //for update the request
    var update_passCat = passCatModel.findByIdAndUpdate(passcat_id, { password_category: passwordCategory })
    update_passCat.exec(function (err, doc) {
        if (err) throw err;
        res.redirect('/passwordCategory');
    });
});


module.exports = router;