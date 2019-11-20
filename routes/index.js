var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

var pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'yhkim',
  password        : 'yhkim01!',
  database        : 'yhkim01'
});

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {
	console.log(req.body.email);
	console.log(req.body.password);
	var email = req.body.email;
	var password = req.body.password;
	pool.query({
		sql: 'SELECT * FROM Users WHERE email=? and password=?',
		timeout: 4000,
		values: [email, password]
	}, function(error, results, fields){
		if (error) {
			var resp = '{ \
				result: false,\
				message: "${error}"\
			}';
			res.send(resp);
		} else {
			if (results.length > 0) {
				var resp = '{ result: true, \
					message: "Login was succeed"}';
				res.send(resp);
			} 
			else {
				var resp = '{ \
					result: false,\
					message: "Login fail"\
				}';
				res.send(401, resp);
			}
			
		}
	});

});


module.exports = router;
