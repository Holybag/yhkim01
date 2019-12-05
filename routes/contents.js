var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser')
var mongo = require('mongodb');
var redis = require('redis');

var router = express.Router();
var redis_Client = redis.createClient();

router.use(bodyParser.urlencoded({ extended: false }));

///////////// redis /////////////
redis_Client.on("error", function(err){
	console.log("Error " + err);
})

// var pool  = mysql.createPool({
//   connectionLimit : 10,
//   host            : 'localhost',
//   user            : 'yhkim',
//   password        : 'yhkim01!',
//   database        : 'yhkim01'
// });

/////////// mongodb /////////////
const url = 'mongodb://yhkim:yhkim01!@localhost:27017';
const dbName = 'myproject';
var db = null;
mongo.MongoClient.connect(url, function(err, client) {
	if (err) {
		console.log(err);
	} else {
		console.log('Connected successfully to mongodb server(contents)');
		db = client.db(dbName);
	}
});

/* GET users listing. */
router.get('/', function(req, res, next) {
	
	var cache_key = "contents";

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply) {
			console.log("cached " + cache_key);
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached" + cache_key);
			const chatCollection = db.collection('contents');
			chatCollection.find({}).toArray(function(error, results){
				if (err) {
					var resp = `{ result: false, message: "${error}" }`;
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
	
	var cache_key = JSON.stringify({ _id: new mongo.ObjectID(id) });
	console.log(cache_key);

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply) {
			console.log("cached " + cache_key);
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");

			const contentsCollection = db.collection('contents');
			contentsCollection.find({ _id: new mongo.ObjectID(id)}).toArray(function(err, result) {
				if (err) {
					var resp = `{ result:false, message: "${error}" }`;
					res.send(resp);
				} else {
					redis_Client.set(cache_key, JSON.stringify(result));
					redis_Client.expire(cache_key, 10);
					res.send(result);
				}
			})
		}
	})
});

router.post('/', function(req, res, next){
	
	var title = req.body.title;
	var type = req.body.type;
	var contents = req.body.contents;
	var image_url = req.body.image_url;
	var user_id = req.body.user_id;

	var cache_key = "contents";

	const contentsCollection = db.collection('contents');
	contentsCollection.save({
		title: title,
		type: type,
		contents: contents,
		image_url: image_url,
		user_id: parseInt(user_id),
		created_at: new Date()
	}, function(error, result){
		if (error) {
			var resp = `{ result:false, message: "${error}" }`;
			res.send(resp);
		} else {
			// after add new contents deleting the retrieving cached data.  
			redis_Client.del(cache_key);
			res.send(result);
		}
	})
});

router.put('/:id', function(req, res, next){
	var id = req.params.id;
	var title = req.body.title;
	var type = req.body.type;
	var contents = req.body.contents;
	var image_url = req.body.image_url;
	var user_id = req.body.user_id;

	var cache_key = "contents";
	
	const contentsCollection = db.collection('contents');
	contentsCollection.updateOne({
		_id: new mongo.ObjectID(id)
	}, {
		$set: { title: title, type: type, contents: contents, image_url: image_url, user_id: user_id }
	}, 
	function(error, result){
		if (error) {
			var resp = `{ result: false, message: "${error}" }`;
			res.send(resp);
		} else {
			// after modify contents deleting the retrieving cached data.  
			redis_Client.del(cache_key);
			res.send(result);
		}
	});
	
});

router.delete('/', function(req, res, next){
	var cache_key = "contents";
	const contentsCollection = db.collection('contents');
	contentsCollection.deleteMany({}, function(error, result){
		if (error) {
			var resp = `{ result: false, message: "${error}" }`;
			res.send(resp);
		} else {
			redis_Client.del(cache_key);
			res.send(result);
		}
	})
});

router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	console.log(id);

	var cache_key1 = JSON.stringify({ _id: new mongo.ObjectID(id) });
	var cache_key2 = "contents";
	
	const contentsCollection = db.collection('contents');
	contentsCollection.deleteOne({
		_id: new mongo.ObjectID(id)
	}, function(error, result){
		if (error) {
			var resp = `{ result:false, message: "${error}" }`;
			res.send(resp);
		} else {
			redis_Client.del(cache_key1);
			redis_Client.del(cache_key2);
			res.send(result);
		}
	})
});

module.exports = router;
