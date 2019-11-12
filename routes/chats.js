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

	pool.query('SELECT * FROM Chats', function(error, results, fields){
		if (error) res.send(error);
		res.send(results);
	});

});

router.get('/:id', function(req, res, next){
	
	var id = req.params.id;
	pool.query({
		sql: 'SELECT * FROM Chats WHERE id=?',
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
	
	var name = req.body.name;
	var user_id = req.body.user_id;
	
	pool.query({
		sql: 'INSERT INTO Chats (name, user_id, created_at)\
		                  VALUES (?, ?, NOW())',
		timeout: 4000,
		values: [name, parseInt(user_id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('Chats ' + name + ' is created');
		}
	});
});

router.put('/:id', function(req, res, next){
	
	var id = req.params.id;
	var name = req.body.name;
	var user_id = req.body.user_id;
	
	pool.query({
		sql: 'UPDATE Chats SET name=?, user_id=? WHERE id=?',
		timeout: 4000,
		values: [name, parseInt(user_id), parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('User ' + name + ' is modified');
		}
	});
});


router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	pool.query({
		sql: 'DELETE FROM Chats WHERE id=?',
		timeout: 4000,
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('Chat ' + id + ' is deleted');
		}
	});
});

router.delete('/', function(req, res, next){
	pool.query({
		sql: 'DELETE FROM Chats',
		timeout: 4000
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('All Chats is deleted');
		}
	});
});

module.exports = router;
