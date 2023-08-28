//jshint esversion:6
require('dotenv').config();
const express  = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: {type: String, required: true},
  password: {type: String, required: true}
});

//collection name should be written with capital letter first and in singular which is converted to small letter first and plural by mongo
const User = new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",async function(req,res){
  try {
      const existingUser = await User.findOne({ email: req.body.username });

      if (!existingUser) {
        bcrypt.hash(req.body.password, saltRounds,async function(err, hash) {
          const newUser = new User({
            email: req.body.username,
            password: hash
          });
          await newUser.save();
          console.log("User saved successfully");
          res.render("secrets");
        });

      } else {
        res.send("User already exists.");
        console.log("User already exists");
      }
    } catch (err) {
      console.log("Internal server error:", err);
      res.status(500).send("Internal server error");
    }
  });

app.post("/login", async function(req, res) {
    try {
      const username = req.body.username;
      const password = req.body.password;

      const foundUser = await User.findOne({ email: username });

      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result==true){
            res.render("secrets");
          }else{
            res.send("Wrong password");
          }
        });
      } else {
        res.send("No user found");
      }
    } catch (err) {
      console.log("Login error:", err);
      res.status(500).send("Internal server error");
    }
  });

app.listen(3000,function(){
  console.log("Server started on port 3000");
});
