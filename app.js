//jshint esversion:6
const express  = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser: true});
const userSchema = {
  email: {type: String, required: true},
  password: {type: String, required: true}
};

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
        const newUser = new User({
          email: req.body.username,
          password: req.body.password
        });

        await newUser.save();
        console.log("User saved successfully");
        res.render("secrets");
      } else {
        res.send("User already exists.");
        console.log("User already exists");
      }
    } catch (err) {
      console.log("Internal server error:", err);
      res.status(500).send("Internal server error");
    }
  });

app.post("/login",function(req,res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}).then((foundUser)=>{
    if(foundUser){
      if(foundUser.password === password){
        res.render("secrets");
      };
    }else{
        res.send("No user found");
    }
  }).catch((err)=>{
    console.log(err);
  })
});

app.listen(3000,function(){
  console.log("Server started on port 3000");
});
