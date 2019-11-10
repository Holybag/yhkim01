var express = require('express');
var bodyParser = require('body-parser')

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {
	console.log(req.body.id);
	console.log(req.body.password);
	res.send('Welcome ' + req.body.id + '('+req.body.password+')');
});

router.post('/register', function(req, res, next) {
	res.send("Register succeed");
});

module.exports = router;
