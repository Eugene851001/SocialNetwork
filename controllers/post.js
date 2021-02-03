const NOT_READY = 'Not ready';
const NEED_LOG_IN = 'You need to log in';

const fs = require('fs');

const Post = require('../models/post');
const User = require('../models/user');

exports.createPost = function(request, response) {
  let date = new Date();
  if (request.cookies === undefined) {
	console.log('No cookies');
    response.send(NEED_LOG_IN);
	return;
  }
  let userId = request.cookies.userId;
  if (userId === undefined) {
    console.log('No userId cookie');  
    response.send(NEED_LOG_IN);
	return;
  }
 
  if (request.file == undefined || request.file.filename === undefined) {
    response.send('Please, check the file');
	return;
  }
  
  let post = new Post({
    date: date,
	description: request.body.description, 
    author: userId, 
    image: request.file.filename
  });
  
  post.save(function(err) {
    if (err) {
	  console.log(err);
	  response.status(400).send('Error');
	} else {
	  showPosts(request, response);
	}
  });
}

exports.like = function(request, response) {
  console.log('Try to set like');
  if (request.cookies === undefined || request.cookies.userId === undefined) {
    response.send(NEED_LOG_IN);
	return;
  }
  
  Post.findOne({_id: request.query.id}, function(err, post){
    if (err || !post) {
	  response.send('Error');
	  return;
	}
	
	for (let i = 0; i < post.likes.length; i++) {
	  if (post.likes[i] == request.cookies.userId) {
	    showPosts(request, response);
        return;
	  }		  
	}
	post.likes.push(request.cookies.userId);
	console.log(post.likes.length);
	Post.updateOne({_id: request.query.id}, {likes: post.likes}, function(err, result){
	  if (err) {
	    console.log(err);
	  } else {
	    console.log(result);
	  }
	  showPosts(request, response);
	});
  });
}

function showPosts(request, response) {
  if (!request.cookies?.userId) {
    response.status(401).send(NEED_LOG_IN);
	return;
  }
  
  User.findById(request.cookies.userId, function(err, user){
    if (err) {
	  console.log(err);
	  respons.status(500).send();
	  return;
	}
	
	user.following.push(request.cookies.userId);
	Post.find({author: { $in: user.following}}).
	  populate('author').
	  sort({date: -1}).
	  exec(function(err, posts){
	    if (err) {
	      console.log(err);
	      response.status(500).send('Error');
        } else {
	      response.render('posts.ejs', {posts: posts, userId: request.cookies.userId});  
	    }
	  });
  });  
}

exports.showPosts = function(request, response) {
  showPosts(request, response);
}