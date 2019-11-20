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

	pool.query('SELECT * FROM Contents', function(error, results, fields){
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
		sql: 'SELECT * FROM Contents WHERE id=?',
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
	
	var title = req.body.title;
	var type = req.body.type;
	var contents = req.body.contents;
	var image_url = req.body.image_url;
	var user_id = req.body.user_id;
	pool.query({
		sql: 'INSERT INTO Contents (title, type, contents, image_url, user_id, created_at)\
		                  Values (?, ?, ?, ?, ?, NOW())',
		timeout: 4000,
		values: [title, type, contents, image_url, parseInt(user_id)]
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
	var title = req.body.title;
	var type = req.body.type;
	var contents = req.body.contents;
	var image_url = req.body.image_url;
	var user_id = req.body.user_id;
	pool.query({
		sql: 'UPDATE Contents SET title=?, type=?, contents=?, image_url=?, user_id=? WHERE id=?',
		timeout: 4000,
		values: [title, type, contents, image_url, parseInt(user_id), parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: ${error}}`;
			res.send(resp);
		} else {
			var resp = `{ result:true, message: "Content ${title} is modified"}`;
			res.send(resp);
		}
	});
});

router.delete('/', function(req, res, next){
	pool.query({
		sql: 'DELETE FROM Contents',
		timeout: 4000
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: "${error}""}`;
			res.send(resp);
		} else {
			var resp = `{ result:true, message: "${results.affectedRows} Contents was deleted"`;
			res.send(resp);
		}
	});
});

router.delete('/:id', function(req, res, next){
	var id = req.params.id;
	console.log(id);
	pool.query({
		sql: 'DELETE FROM Contents WHERE id=?',
		timeout: 4000,
		values: [parseInt(id)]
	}, function(error, results, fields){
		if (error) {
			var resp = `{ result:false, message: "${error}" }`;
			res.send(resp);
		} else {
			var resp = `{ result:true, message: "Content ${id} was deleted" }`;
			res.send(resp);
		}
	});
});

module.exports = router;
