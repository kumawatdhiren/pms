var express = require('express');
var router = express.Router();
var  bcrypt = require("bcrypt")
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
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
/*--------------------Routing----------------------------*/

/* GET add-new-password page. */
router.get('/',checkLoginUser, function(req, res, next) {
    var loginUser=req.session.userName;
    getPassCat.exec(function(err,data){
      if(err) throw err;
    res.render('add-new-password', { title: 'Password Management System',loginUser:loginUser,records: data,success:''  });
  });
  });
  /* Post add-new-password page. */
  router.post('/',checkLoginUser, function(req, res, next) {
    var loginUser=req.session.userName;
    var pass_cat= req.body.pass_cat;
    var project_name= req.body.project_name;
    var pass_details= req.body.pass_details
    var password_details= new passModel({
      password_category:pass_cat,
      project_name:project_name,
      password_detail:pass_details
    });
    password_details.save(function(err,doc){
    getPassCat.exec(function(err,data){
      if(err) throw err;
      res.render('add-new-password', { title: 'Password Management System',loginUser: loginUser,records:data,success:"Password Details Inserted Successfully"});
    });
  });
  });
  module.exports = router;