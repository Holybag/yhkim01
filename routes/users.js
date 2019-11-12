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
	
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	pool.query({
		sql: 'INSERT INTO Users (email, password, name, created_at)\
		                  VALUES (?, ?, ?, NOW())',
		timeout: 4000,
		values: [email, password, name]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('User ' + name + ' is registed');
		}
	});
});

router.put('/:id', function(req, res, next){
	
	var id = req.params.id;
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	//res.send(id + ' ' + email + ' ' + password + ' ' + name)
	pool.query({
		sql: 'UPDATE Users SET email=?, password=?, name=? WHERE id=?',
		timeout: 4000,
		values: [email, password, name, parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('User ' + name + ' is modified');
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
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			res.send('User ' + id + ' is deleted');
		}
	});
});


module.exports = router;
