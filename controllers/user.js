const User = require('../models/user');
const fs = require('fs');
const mongoose = require('mongoose');

const NEED_LOG_IN = 'You need to log in';

exports.editPhoto = function(request, response) {
  if (request.cookies === undefined || request.cookies.userId === undefined) {
    response.send(NEED_LOG_IN);
	return;
  }
  
  if (!request.file.filename) {
    response.send('Please, check the file');
	return;
  }
  
  User.updateOne({_id: request.cookies.userId}, {photo: request.file.filename}, function(err, result){
    if (err) {
	  console.log(err);
	  response.status(500).send('Error');
	} else {
	  console.log(result);
	  User.find({_id: request.cookies.userId}, function(err, user){
		if (err) {
		  console.log('Error');
		  response.status(500).send('Error');
		  return;
		}
		
		if (!user) {
		  console.log('User not found');
		  response.status(404).send('User not found');
		  return;
		}
		
		console.log(user);
//		let nav = fs.readFileSync('../views/nav.html');
		response.redirect('/user/' + request.cookies.userId);
	  //  response.render('profile.ejs', {user: user, userId: request.cookies.userId, myProfile: true}); 
	  });
	}
  });
}

exports.getUser = function(request, response) {
  console.log('Getting user');
  let userId = request.params['userId'];
  User.findById(userId)
	.exec(function(err, user){
      if (err) {
	    console.log(err);
	    response.status(500).send('Error');
	    return;
	  }
	
	  if (!user) {
	    response.send('Can not find user');
	    return;
	  }
	
	  if (request.cookies === undefined && request.cookies.userId === undefined) {
	    response.status(401).send(NEED_LOG_IN);
	    return;
	  }
	
      let signed = user.followers.indexOf(mongoose.Types.ObjectId(request.cookies.userId)) != -1;
	  console.log(signed);
	  let myProfile = request.cookies.userId === userId;
//	let nav = fs.readFileSync('../views/nav.html');
	  response.render('profile.ejs', {
		user: user, 
		userId: request.cookies.userId, 
		myProfile: myProfile,
		signed: signed
	  });
  });
}

exports.showUsers = function(request, response) {
  User.find({}, function(err, users){
	if (err) {
	  console.log(err);
	  response.send('Error');
	  return;
	}
	
	if (request.cookies === undefined || request.cookies.userId === undefined) {
	  response.status(401).send(NEED_LOG_IN);
	  return;
	}
	
	response.render('users.ejs', {users: users, userId: request.cookies.userId});
  });
}

exports.getFollowing = function(request, response) {
  console.log('Getting following');
  if (request.query.userId === undefined) {
    response.status(400).send();
	return;
  }
  
  User.findOne({_id: request.query.userId}, function(err, user){
	if (err) {
	  console.log(err);
	  response.status(500).send();
	  return;
	}
	
    User.find({_id: { $in: user.following}}, function(err, users){
	  response.render('users.ejs', {users: users, userId: request.cookies.userId});   
	});
  });
}

exports.getFollowers = function(request, response) {
  if (request.query.userId === undefined) {
    response.status(400).send();
	return;
  }
  
  User.findById(request.query.userId, function(err, user){
    User.find({_id: { $in: user.followers}}, function(err, users){
	  response.render('users.ejs', {users: users, userId: request.cookies.userId});
	});
  });
}

exports.addFollowing = function(request, response) {
  if (request.query.userId === undefined) {
    response.status(400).send();
	return;
  }
  
  if (request.cookies === undefined || request.cookies.userId === undefined) {
    response.status(401).send(NEED_LOG_IN);
	return;
  }
  
  User.findOne({_id: request.cookies.userId}, function(err, user){
    if (err) {
	  console.log(err);
	  response.status(500).send();
	  return;
	}
	
	if (!user) {
	  response.send(404).send('Not found');
	  return;
	}
	
	if (user.following.indexOf(mongoose.Types.ObjectId(request.query.userId)) != -1) {
	  response.redirect('/user/' + request.query.userId);
	  return;
	}
	
	let following = user.following;
	console.log(request.query.userId);
	following.push(request.query.userId);
	User.updateOne({_id: request.cookies.userId}, {following: following}, function(err, result){
	  if (err) {
	    console.log(err);
		response.status(500).send();
		return;
	  }
	  
	  console.log(result);
	  response.render('profile.ejs', {user: user, userId: request.cookies.userId, myProfile: true}); 
	});
  });
}

exports.removeFollowing = function(request, response) {
  if (!request?.cookies.userId) {
    response.status(401).send();
	return;
  }

  User.findByIdAndUpdate(request.cookies.userId, {$pull: {following: request.query.userId}}, {new: true})
    .exec(function(err, user){
	  response.render('profile.ejs', {
		  user: user, 
		  userId: request.cookies.userId, 
		  myProfile: false, 
		  signed: false
		}); 
	});  
}

exports.addFollower = function(request, response, next) {
  if (!request?.cookies.userId) {
    response.status(401).send();
	return;
  }
  
  User.findByIdAndUpdate(request.query.userId, {$push: {followers: request.cookies.userId}})
    .exec(function(err, user){
	  if (err) {
	    console.log(err);
	    response.status(500).send();
	  }
	  
	  next();
	});
}

exports.removeFollower = function(request, response, next) {
  if (!request?.cookies.userId) {
    response.status(401).send();
	return;
  }
  
  User.findByIdAndUpdate(request.query.userId, {$pull: {followers: request.cookies.userId}})
    .exec(function(err, user){
	  if (err) {
	    console.log(err);
		response.status(500).send();
	  }
	  
	  next();
	});
}
