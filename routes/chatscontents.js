var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var redis = require('redis');

var router = express.Router();
var redis_Client = redis.createClient();
var redis_Subscribe = redis.createClient();

router.use(bodyParser.urlencoded({ extended: false }));

////////// redis ////////////////////
redis_Client.on("error", function (err) {
	console.log("Error " + err);
});

redis_Subscribe.on("error", function(err) {
	console.log("Error " + err);
});

redis_Subscribe.on("message", function(channel, message){
	console.log(channel + "--" + message);
});

//redis_Subscribe.subscribe("chat");

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
	
	var cache_key = JSON.stringify({chats_id: -1});
	console.log(cache_key);

	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply){
			console.log("cached");
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			const chatCollection = db.collection('chatscontents');
			chatCollection.find({}).toArray(function(error, results) {
				if (err) {
					var resp = `{ result:false, message: "${error}" }`;
					res.send(resp);
				} else {
					redis_Client.set(cache_key, JSON.stringify(results));
					redis_Client.expire(cache_key, 10);
					res.send(results);
				}
			});
		}
	});
});

router.get('/:chats_id', function(req, res, next) {
	var chats_id = req.params.chats_id;

	var cache_key = JSON.stringify({chats_id: parseInt(chats_id)});
	console.log(cache_key);
	redis_Client.get(cache_key, function(err, reply){
		console.log(reply);
		if (reply){
			console.log("cached");
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			const chatCollection = db.collection('chatscontents');
			chatCollection.find({chats_id:parseInt(chats_id)}).toArray(function(err, results) {
				if (err) {
					var resp = `{ result:false, message: "${error}" }`;
					res.send(resp);
				} else {
					redis_Client.set(cache_key, JSON.stringify(results));
					redis_Client.expire(cache_key, 10);
					res.send(results);
				}
			});
		}
	});
});

router.get('/:chats_id/:id', function(req, res, next){
	var chats_id = req.params.chats_id;
	var id = req.params.id;

	var cache_key = JSON.stringify({chats_id: parseInt(chats_id), id: parseInt(id)})
	console.log(cache_key);
	redis_Client.get(cache_key, function(err, reply){
		if (reply){
			console.log("cached");
			res.send(JSON.parse(reply));
		} else {
			console.log("not cached");
			const chatCollection = db.collection('chatscontents');
			chatCollection.find({chats_id:parseInt(chats_id), _id: new mongo.ObjectID(id)}).toArray(function(err, results) {
				if (err) {
					var resp = `{ result:false, message: "${error}" }`;
					res.send(resp);
				} else {
					redis_Client.set(cache_key, JSON.stringify(results));
					redis_Client.expire(cache_key, 10);
					res.send(results);
				}
			});
		}
	});
});

router.post('/', function(req, res, next){
	
	var chats_id = req.body.chats_id;
	var user_id = req.body.user_id;
	var comment = req.body.comment;
	
	const chatCollection = db.collection('chatscontents');
	chatCollection.save({
		chats_id: parseInt(chats_id),
		user_id: parseInt(user_id),
		comment: comment,
		created_at: new Date()
	}, function(error, results){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {			
			//var resp = `{ result:true, message: ${results.insertId}}`;
			redis_Client.publish(chats_id, user_id+":"+comment);
			res.send(results);
		}
	});
});

router.put('/:id', function(req, res, next){
	
	var id = req.params.id;
	var chats_id = req.body.chats_id;
	var user_id = req.body.user_id;
	var comment = req.body.comment;

	const chatCollection = db.collection('chatscontents');
	chatCollection.updateOne({
		_id: new mongo.ObjectID(id),
		chats_id: parseInt(chats_id),
		user_id: parseInt(user_id)
	}, {
		$set: {comment: comment}
	}, 
	function(error, results){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {			
			res.send(results);
		}
	});
});


router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	
	const chatCollection = db.collection('chatscontents');
	chatCollection.deleteOne({
		_id: new mongo.ObjectID(id)
	}, function(error, results){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {			
			//var resp = `{ result:true, message: ${results.insertId}}`;
			res.send(results);
		}
	});
});

router.delete('/', function(req, res, next){
	var chats_id = req.body.chats_id;

	if (chats_id == null || chats_id == undefined) {
		const chatCollection = db.collection('chatscontents');
		chatCollection.deleteMany({}, function(error, results){
			if (error) {
				var resp = `{ result:false, message: "${error}"}`;
				res.send(resp);
			} else {			
				//var resp = `{ result:true, message: ${results.insertId}}`;
				res.send(results);
			}
		});
	} else {
		const chatCollection = db.collection('chatscontents');
		chatCollection.deleteMany({
			chats_id: parseInt(chats_id)
		}, function(error, results){
			if (error) {
				var resp = `{ result:false, message: "${error}"}`;
				res.send(resp);
			} else {			
				//var resp = `{ result:true, message: ${results.insertId}}`;
				res.send(results);
			}
		});
	}
	
});

module.exports = router;
