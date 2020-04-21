const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hashedPassword) {
        if (err) {
            console.log("bcrypt hashing failed");
        } else {
            const newUser = new User({
                email: req.body.username,
                password: hashedPassword
            });
            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("secrets");
                }
            });
        }
    });
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser == null) {
                res.send("Invalid email ID try again");
            } else {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    // result == true
                    if (err) {
                        console.log("hashing failed in login bcrypt");
                    } else {
                        if (result == true) {
                            res.render("secrets");
                        } else {
                            res.send("Invalid password try again");
                        }
                    }
                });
            }
        }
    });
});



app.listen(3000, function () {
    console.log("Server is listening on 3000");
})