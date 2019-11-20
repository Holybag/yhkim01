var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

////////// mysql ////////////////////
var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'yhkim01'
});

/////////// mongodb /////////////
//const url = 'mongodb://localhost:27017';
// const dbName = 'myproject';
// mongoClient.connect(url, function(err, client) {
// 	console.log('Connected successfully to mongodb server');
// 	const db = client.db(dbName);

// 	insertTest(db, function() {
// 		client.close();
// 	});
// });

// const insertTest = function(db, callback) {
// 	const collection = db.collection('table01');

// 	collection.insertMany([
// 		{a:1}, {a:2}, {a:3}
// 		], function(err, result){
// 			console.log('Inserted 3 documents into the collection');
// 			callback(result);
// 		});
// }

/* GET users listing. */
router.get('/', function(req, res, next) {

	pool.query('SELECT * FROM ChatsContents', function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {
			res.send(results);
		}
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
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
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
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {			
			var resp = `{ result:true, message: ${results.insertId}}`;
			res.send(resp);
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
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {
			var resp = `{ result:true, message: "ChatsContent ${id} was modified"}`;
			res.send(resp);
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
			var resp = `{ result:false, message: "${error}"}`;
			res.send(resp);
		} else {
			var resp = `{ result:true, message: id}`;
			res.send(resp);
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
				var resp = `{ result:false, message: ${error}}`;
				res.send(resp);
			} else {
				var resp = `{ result:true, message: ${results.affectedRows} Contents was deleted`;
				res.send(resp);
			}
		});	
	} else {
		pool.query({
			sql: 'DELETE FROM ChatsContents WHERE chats_id=?',
			timeout: 4000,
			values: [parseInt(chats_id)]
		}, function(error, results, fields){
			if (error) {
				var resp = `{ result:false, message: ${error}}`;
				res.send(resp);
			} else {
				var resp = `{ result:true, message: ${results.affectedRows} Contents was deleted`;
				res.send(resp);
			}
		});	
	}
	
});

module.exports = router;
