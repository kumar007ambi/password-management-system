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

//Node Local Storage
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

/* GET home page. */
router.get('/', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    res.redirect('./dashboard');
  } else {
    res.render('index', { title: 'Password Management System', msg: '' });
  }
});

/* Post home page. */
router.post('/', function (req, res, next) {
  var username = req.body.uname;
  var password = req.body.password;
  //For user checking
  var checkUser = userModule.findOne({ username: username });
  checkUser.exec((err, data) => {
    if (err) throw err;
    //For jsonwebtoken Matching token We have to store the value in a particular id
    var getUserID = data._id;
    //For Recieving Password Data from DateBase We get and store the data in getPassword var
    var getPassword = data.password;
    if (bcrypt.compareSync(password, getPassword)) {
      var token = jwt.sign({ userID: getUserID }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', username);
      res.redirect('/dashboard');
    } else {
      res.render('index', { title: 'Password Management System', msg: 'Invalid Username and Password' });
    };
  });
});



/* GET Signup page. */
router.get('/signup', function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser');
  if (loginUser) {
    res.redirect('./dashboard');
  } else {
    res.render('signup', { title: 'Password Management System', msg: '' });
  }
});
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
/* Post Signup page. */
router.post('/signup', checkUsername, checkEmail, function (req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var confpassword = req.body.confpassword;
  if (password !== confpassword) {
    res.render('signup', { title: 'Password Management System', msg: 'Password and Confirm Password not Matched !' });
  } else {
    password = bcrypt.hashSync(req.body.password, 10);
    var userDetails = new userModule({
      username: username,
      email: email,
      password: password
    });

    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render('signup', { title: 'Password Management System', msg: 'User Registered Successfully' });
    });
  }
});


/* GET LOGOUT Route. */
router.get('/logout', function (req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});

module.exports = router;
