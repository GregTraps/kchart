var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('test', { title: 'Express' });
});
router.get('/fullKline', function(req, res, next) {
    res.render('fullKline', { title: 'Express' });
});
module.exports = router;
