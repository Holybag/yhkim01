var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser')
var redis = require('redis');
var mongo = require('mongodb');

var router = express.Router();
var redis_Client = redis.createClient();

router.use(bodyParser.urlencoded({ extended: false }));

//////////////// mysql /////////////////
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'yhkim01'
});

///////////// redis ///////////////
redis_Client.on("error", function(err){
	console.log("Error " + err);
})

///////////// mongodb ////////////
const url = 'mongodb://yhkim:yhkim01!@localhost:27017';
const dbName = 'myproject';
var db = null;
mongo.MongoClient.connect(url, function(err, client) {
	console.log('Connected successfully to mongodb server(chatscontents)');
	db = client.db(dbName);
});

/* GET users listing. */
router.get('/', function(req, res, next) {

	var cache_key = "SELECT * FROM Users";
	console.log(cache_key);

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply) {
			console.log("cached " + cache_key);
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			pool.query('SELECT * FROM Users', function(error, results, fields){
				if (error) {
					var resp = `{ result:false, message: "${error}"}`;
					res.send(resp);
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

	var cache_key = `SELECT * FROM Users WHERE id=${id}`;
	console.log(cache_key);

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply) {
			console.log("cached");
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			pool.query({
				sql: 'SELECT * FROM Users WHERE id=?',
				timeout: 4000,
				values: [parseInt(id)]
			}, function(error, result, fields){
				if (error) {
					var resp = `{ result:false, message: "${error}"}`;
					res.send(resp);
				} else {
					console.log("1111");
					const chatCollection = db.collection('chatscontents');
					if (chatCollection){
						console.log("222");
					}
					chatCollection.find({user_id:parseInt(id)}).toArray(function(err, results) {
						if (err) {
							//var resp = `{ result:false, userInfo:${result}, chatContents:${err} }`;
							res.send({ result:false, userInfo:result, chatContents:err });
							//res.send("{}");
						} else {
							var resp = { result:true, userInfo:result, chatContents:results};
							redis_Client.set(cache_key, JSON.stringify(resp));
							redis_Client.expire(cache_key, 10);
							
							//res.send({ result:true, userInfo:result, chatContents:results});
							res.send(resp);
						}
					});
				}
			});
		}
	})
});

router.post('/', function(req, res, next){
	
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;

	var cache_key = "SELECT * FROM Users";
	console.log(cache_key);

	pool.query({
		sql: 'INSERT INTO Users (email, password, name, created_at)\
		                  VALUES (?, ?, ?, NOW())',
		timeout: 4000,
		values: [email, password, name]
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {
			redis_Client.del(cache_key);
			var resp = `{ result:true, message: ${results.insertId}}`;
			res.send(resp);
		}
	});
});

router.put('/:id', function(req, res, next){
	
	var id = req.params.id;
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;

	var cache_key1 = "SELECT * FROM Users";
	var cache_key2 = `SELECT * FROM Users WHERE id=${id}`;

	//res.send(id + ' ' + email + ' ' + password + ' ' + name)
	pool.query({
		sql: 'UPDATE Users SET email=?, password=?, name=? WHERE id=?',
		timeout: 4000,
		values: [email, password, name, parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result: false, message: "${error}"}`;
			res.send(resp);
		} else {
			redis_Client.del(cache_key1)
			redis_Client.del(cache_key2);
			var resp = `{ result: true, message: "User ${name} is modified"}`;
			res.send(resp);
		}
	});
});

router.delete('/', function(req, res, next){

	var cache_key = "SELECT * FROM Users";
	console.log(cache_key);

	pool.query({
		sql: 'DELETE FROM Users',
		timeout: 4000
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {
			redis_Client.del(cache_key);
			var resp = `{ result:true, message: "${results.affectedRows} Users was deleted"`;
			res.send(resp);
		}
	});
});

router.delete('/:id', function(req, res, next){
	var id = req.params.id;

	var cache_key1 = "SELECT * FROM Users";
	var cache_key2 = `SELECT * FROM Users WHERE id=${id}`;

	pool.query({
		sql: 'DELETE FROM Users WHERE id=?',
		timeout: 4000,
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {
			redis_Client.del(cache_key1);
			redis_Client.del(cache_key2);
			var resp = `{ result:true, message: "User ${id} was deleted"}`;
			res.send(resp);
		}
	});
});


module.exports = router;
