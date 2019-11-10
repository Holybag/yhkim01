var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'yhkim01'
});

/* GET users listing. */
router.get('/', function(req, res, next) {

	pool.query('SELECT * FROM Users', function(error, results, fields){
		if (error) res.send(error);
		res.send(results);
	});

});

router.get('/:id', function(req, res, next){
	
	var id = req.params.id;
	pool.query({
		sql: 'SELECT * FROM Users WHERE id=?',
		timeout: 4000,
		values: [id]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send(results);
		}
	});
});

router.delete('/', function(req, res, next){
	pool.query({
		sql: 'DELETE FROM Users',
		timeout: 4000
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('All User is deleted');
		}
	});
});

router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	pool.query({
		sql: 'DELETE FROM Users WHERE id=?',
		timeout: 4000,
		values: [id]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('User ' + id + ' is deleted');
		}
	});
});

router.post('/', function(req, res, next){
	
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	pool.query({
		sql: 'INSERT INTO Users (email, password, name, created_at)\
		                  Values (?, ?, ?, NOW())',
		timeout: 4000,
		values: [email, password, name]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('User ' + name + ' is registed');
		}
	});
})

module.exports = router;
