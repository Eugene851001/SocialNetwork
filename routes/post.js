const express = require('express');
const post = require('../controllers/post');

const postRouter = express.Router();

postRouter.post('/create', function(request, response){
  post.createPost(request, response);
 // response.send('Create post');
})

postRouter.get('/posts', function(request, response){
  post.showPosts(request, response);
  //response.send();
})

postRouter.use('/like', function(request, response){
  post.like(request, response);
});

module.exports = postRouter;