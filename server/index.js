const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

//importing routes
const authRoute = require('./routes/auth')

//Mongo db connections
// mongoose.connect('mongodb://localhost:27017/api',()=>{console.log("connect with db")})

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@nodeapi.pdphs.mongodb.net/?retryWrites=true&w=majority`,
()=>{console.log("connected to atlas db")})

//middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser())

//routes middleware
app.use('/member',authRoute);

app.enable('trust proxy')

app.get('/image/*', function (req, res) {
    const dir = path.join(__dirname,'public');

    var mime = {
        html: 'text/html',
        txt: 'text/plain',
        css: 'text/css',
        gif: 'image/gif',
        jpg: 'image/jpeg',
        png: 'image/png',
        svg: 'image/svg+xml',
        js: 'application/javascript'
    };

    var file = path.join(dir, req.path.split('/')[req.path.split('/').length-1]);
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end("forbidden");
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function (e) {
        res.set('Content-Type', 'text/plain');
        res.status(404).end("Not Found");
    });
});


app.listen(8080,()=>{console.log("http://localhost:8080")})