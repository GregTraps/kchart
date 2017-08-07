var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/kline', function(req, res, next) {
    res.render('test', { title: 'Express' });
});

module.exports = router;
