const NOT_READY = 'Not ready';
const User = require('../models/user');
const fs = require('fs');

exports.getSignup = (request, response) => {
  response.render('registration.ejs');
}

exports.signout = (request, response) => {
  response.clearCookie('userId');
  response.redirect('/main');
}

exports.showMain = (request, response) => {
  response.render('main.ejs');
}

exports.postSignup = (request, response) => {
  console.log(request.body);
  User.findOne({login: request.body.login}, function(err, user) {
      if (err) {
	    console.log(err);
		response.status(500).send('Error');
		return;
	  }
	  
	  if (user) {
	    response.send('Please, choose another login');
		return;
	  }
	  
	  user = new User(request.body);
      user.save(function(err){
      if (err) {
	    console.log(err);
	    response.status(500).send('Can not registrate');
	  } else {
        response.cookie('userId', user._id);
		response.redirect('user/' + user._id);
	  }
    }); 
  });
}

exports.getSignin = (request, response) => {
  response.render('logination.ejs');
//  response.send(NOT_READY);
}

exports.postSignin = (request, response) => {
  let {name, login, password} = request.body;
 // User.find({}, function(err, users){
 //   response.send(users);
 // });
  User.findOne({login, password}, function(err, user){
    if (err || !user) {
	  console.log('User not found');
	  if (err) {
	    console.log(err);
	  }
	  response.status(500).send('Error');
	} else {
	  response.cookie('userId', user._id);
//	  let nav = fs.readFileSync('../views/nav.html');
	  response.redirect('user/' + user._id);
	}
  });
};