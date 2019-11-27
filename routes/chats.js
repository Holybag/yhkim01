var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var redis = require('redis');

var router = express.Router();
var redis_Client = redis.createClient();

router.use(bodyParser.urlencoded({ extended: false }));

////////////// mysql //////////////
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'yhkim01'
});

////////////// redis /////////////
redis_Client.on("error", function(err) {
	console.log("Error " + err);
});

/* GET users listing. */
router.get('/', function(req, res, next) {

	var cache_key = "SELECT * FROM Chats";
	console.log(cache_key);

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply) {
			console.log("cached");
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			
			pool.query('SELECT * FROM Chats', function(error, results, fields){
				if (error) {
					res.send(error);
				} else {
					redis_Client.set(cache_key, JSON.stringify(results));
					redis_Client.expire(cache_key, 10);
					res.send(results);
				}
				
			});
		}
	})

});

router.get('/:id', function(req, res, next){
	
	var id = req.params.id;

	var cache_key = `SELECT * FROM Chats WHERE id=${id}`;
	console.log(cache_key);

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply) {
			console.log("cached");
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			pool.query({
				sql: 'SELECT * FROM Chats WHERE id=?',
				timeout: 4000,
				values: [parseInt(id)]
			}, function(error, results, fields){
				if (error) {
					res.send(error);
				} else {
					redis_Client.set(cache_key, JSON.stringify(results));
					redis_Client.expire(cache_key, 10);
					res.send(results);
				}
			});
		}
	})
});

router.post('/', function(req, res, next){
	
	var name = req.body.name;
	var user_id = req.body.user_id;

	var cache_key = "SELECT * FROM Chats";
	
	pool.query({
		sql: 'INSERT INTO Chats (name, user_id, created_at)\
		                  VALUES (?, ?, NOW())',
		timeout: 4000,
		values: [name, parseInt(user_id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			redis_Client.del(cache_key);
			res.send('Chats ' + name + ' is created');
		}
	});
});

router.put('/:id', function(req, res, next){
	
	var id = req.params.id;
	var name = req.body.name;
	var user_id = req.body.user_id;
	
	var cache_key1 = "SELECT * FROM Chats";
	var cache_key2 = `SELECT * FROM Chats WHERE id=${id}`;

	pool.query({
		sql: 'UPDATE Chats SET name=?, user_id=? WHERE id=?',
		timeout: 4000,
		values: [name, parseInt(user_id), parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			redis_Client.del(cache_key1);
			redis_Client.del(cache_key2);
			res.send('User ' + name + ' is modified');
		}
	});
});


router.delete('/:id', function(req, res, next){
	var id = req.params.id;

	var cache_key1 = "SELECT * FROM Chats";
	var cache_key2 = `SELECT * FROM Chats WHERE id=${id}`;

	pool.query({
		sql: 'DELETE FROM Chats WHERE id=?',
		timeout: 4000,
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			redis_Client.del(cache_key1);
			redis_Client.del(cache_key2);
			
			res.send('Chat ' + id + ' is deleted');
		}
	});
});

router.delete('/', function(req, res, next){

	var cache_key1 = "SELECT * FROM Chats";

	pool.query({
		sql: 'DELETE FROM Chats',
		timeout: 4000
	}, function(error, results, fields){
		if (error) {
			res.send(error);
		} else {
			redis_Client.del(cache_key);
			res.send('All Chats are deleted');
		}
	});
});

module.exports = router;
