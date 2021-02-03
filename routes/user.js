const express = require('express');
const user = require('../controllers/user');

const userRouter = express.Router();

userRouter.post('/editPhoto', function(request, response){
  user.editPhoto(request, response);
});

userRouter.get('/users', function(request, response){
  user.showUsers(request, response);
});

userRouter.use('/follow', user.addFollower, user.addFollowing);

userRouter.use('/unfollow', user.removeFollower, user.removeFollowing);

userRouter.use('/getFollowing', function(request, response){
  user.getFollowing(request, response);
});

userRouter.use('/getFollowers', function(request, response){
  user.getFollowers(request, response);
});

userRouter.get('/:userId', function(request, response){
  user.getUser(request, response);
});

module.exports = userRouter;