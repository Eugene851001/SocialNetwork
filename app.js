const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const multer = require('multer');
require('dotenv').config();

const authRouter = require('./routes/auth.js');
const postRouter = require('./routes/post.js');
const userRouter = require('./routes/user.js');

const app = express();

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true }, function(err) {
  if (err)
    console.log(err);
  else
    console.log('connected');
});

const filter = function(request, file, cb) {
  if (file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
	file.mimetype === "image/jpeg") {
	  cb(null, true);
	} else {
	  cb(null, false);
	}
}

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(multer({dest:"public/uploads", fileFilter: filter}).single("filedata"));
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', authRouter);
app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/', function(request, response){
  response.status(404).send('Not found');
});

app.listen(process.env.PORT);
