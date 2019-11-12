var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser')
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'yhkim01'
});

/* GET users listing. */
router.get('/', function(req, res, next) {

	pool.query('SELECT * FROM ChatsContents', function(error, results, fields){
		if (error) res.send(error);
		res.send(results);
	});

});

router.get('/:id', function(req, res, next){
	
	var id = req.params.id;
	pool.query({
		sql: 'SELECT * FROM ChatsContents WHERE id=?',
		timeout: 4000,
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send(results);
		}
	});
});

router.post('/', function(req, res, next){
	
	var chats_id = req.body.chats_id;
	var user_id = req.body.user_id;
	var comment = req.body.comment;
	
	pool.query({
		sql: 'INSERT INTO ChatsContents (chats_id, created_at, user_id, comment)\
		                  VALUES (?, NOW(), ?, ?)',
		timeout: 4000,
		values: [parseInt(chats_id), parseInt(user_id), comment]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('ChatsContent ' + comment + ' is added');
		}
	});
});

router.put('/:id', function(req, res, next){
	
	var id = req.params.id;
	var chats_id = req.body.chats_id;
	var user_id = req.body.user_id;
	var comment = req.body.comment;
	
	pool.query({
		sql: 'UPDATE ChatsContents SET chats_id=?, user_id=?, comment=? WHERE id=?',
		timeout: 4000,
		values: [parseInt(chats_id), parseInt(user_id), comment, parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('ChatsContent ' + id + ' is modified');
		}
	});
});


router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	pool.query({
		sql: 'DELETE FROM ChatsContents WHERE id=?',
		timeout: 4000,
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('ChatsContent ' + id + ' is deleted');
		}
	});
});

router.delete('/', function(req, res, next){
	var chats_id = req.body.chats_id;

	if (chats_id == null || chats_id == undefined) {
		pool.query({
			sql: 'DELETE FROM ChatsContents',
			timeout: 4000
		}, function(error, results, fields){
			if (error) {
				res.send(error);
			} else {
				res.send('All ChatsContents are deleted');
			}
		});	
	} else {
		pool.query({
			sql: 'DELETE FROM ChatsContents WHERE chats_id=?',
			timeout: 4000,
			values: [parseInt(chats_id)]
		}, function(error, results, fields){
			if (error) {
				res.send(error);
			} else {
				res.send('All ChatsContents in chats_id:' + chats_id + ' are deleted');
			}
		});	
	}
	
});

module.exports = router;
