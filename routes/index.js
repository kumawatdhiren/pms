var express = require('express');
var router = express.Router();
var  bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var path = require ('path');


const { check, validationResult } = require('express-validator');
router.use(express.static(__dirname+"./public/"));
/*--------------------DataBase Modules----------------------------*/
var userModule=require('../modules/user');
var passModel = require('../modules/add_password');
var passCatModel = require('../modules/password_category');
var getPassCat= passCatModel.find({});
var getAllPass= passModel.find({});
/*--------------------middleware----------------------------*/
/* Check Login Funcation. */
function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    if(req.session.userName){
      var decoded = jwt.verify(userToken, 'loginToken');
    }else{
      res.redirect('/');
    }
    
  } catch(err) {
    res.redirect('/');
  }
  next();
}
/* Check Email Funcation. */
function checkEmail(req,res,next){
  var email=req.body.email;
  var checkexitemail=userModule.findOne({email:email});
  checkexitemail.exec((err,data)=>{
 if(err) throw err;
 if(data){
  return res.render('signup', { title: 'Password Management System', msg:'this email address already exists please choose a different email;' });
}
 next();
  });
}
/* Check UserName Funcation. */
function checkUsername(req,res,next){
  var uname=req.body.uname;
  var checkexitemail=userModule.findOne({username:uname});
  checkexitemail.exec((err,data)=>{
 if(err) throw err;
 if(data){
  return res.render('signup', { title: 'Password Management System', msg:'Username Already Exit' });
}
 next();
  });
}
/* Check Local Storage. */
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//File Upload in Multer
var Storage=multer.diskStorage({
  destination:"./public/upload",
  filename:(req,file,cd)=>{
    cd(null,file.fieldname+"_"+ Date.now()+path.extname(file.originalname));

  }
})

var upload =multer({
  storage:Storage
}).single('avatar');
/*--------------------Routing----------------------------*/
/* GET home page. */
router.get('/', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(loginUser){
    res.redirect('./dashboard');
  }else{
  res.render('index', { title: 'Password Management System',msg:'' });
  }
});
/* POST signup page. */
router.post('/', function(req, res, next) {
  var username=req.body.uname;
  var password=req.body.password;
  var checkUser=userModule.findOne({username:username});
  checkUser.exec((err, data)=>{
    if(data==null){
      res.render('index', { title: 'Password Management System', msg:"Invalid Username and Password." });
  
     }else{
    if(err) throw err;
    var getUserID=data._id;
    var getPassword=data.password;
    if(bcrypt.compareSync(password,getPassword)){
      var token = jwt.sign({ userID: getUserID }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUser', username);
      req.session.userName=username;
      res.redirect('/dashboard');
    }else{
      res.render('index', { title: 'Password Management System', msg:"Invalid Username and Password." });

    } 
  }
});
});
/* GET signup page. */
router.get('/signup', function(req, res, next) {
  var loginUser=localStorage.getItem('loginUser');
  if(req.session.userName){
    res.redirect('./dashboard');
  }else{
  res.render('signup', { title: 'Password Management System',msg:'' });
  }
});
/* POST signup page. */
router.post('/signup',checkUsername,checkEmail,function(req, res, next) {
  var fname=req.body.fname;
  var username=req.body.uname;
  var email=req.body.email;
  var password=req.body.password;
  var confpassword=req.body.confpassword;
 
if(password !=confpassword){
    res.render('signup', { title: 'Password Management System', msg:'Password not matched!' });
    }else{
password =bcrypt.hashSync(req.body.password,10);
var userDetails=new userModule({
    fname:fname,
    username:username,
    email:email,
    password:password
  });
userDetails.save((err,doc)=>{
  if(err) throw err;
  res.render('signup', { title: 'Password Management System', msg:'User Registerd Successfully' });
})  ;
}
});

/* Get logout page. */
router.get('/logout', function(req, res, next) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUser');
  res.redirect('/');
});
module.exports = router;
