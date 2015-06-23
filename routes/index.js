var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET all posts */
router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if (err) {
			return next(err);
		}
		res.json(posts);
	})
});

/* Insert a new post */
router.post('/posts', function(req, res, next) {
	var post = new Post(req.body);

	post.save(function(err, post) {
		if (err) {
			return next(err);
		}

		res.json(post);
	});
});

/* Create a route for preloading */
router.param('post', function(req, res, next, id) {

	var query = Post.findById(id);

	query.exec(function(err, post){
		if (err) {
			return next(err);
		}
		if (!post) {
			return next(new Error('Cant find post'));
		}
		req.post = post;
		return next();
	});

});
 
 /* 
  Route to get a single post
  Using the populate() method, we can automatically load all the comments associated with that particular post. 
 */
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(req, post) {
		res.json(post);
	});
});

/* Route to update the upvotes of a post */
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.post.upvote(function(err, post){
    if (err) { return next(err); }

    res.json(post);
  });
});

/* Route for post a new comment */
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

/*
Don't forget to create a new method to pre-load comments and attach them to the req object as we did with posts. This will make expanding your API simpler and cleaner.
*/

module.exports = router;
