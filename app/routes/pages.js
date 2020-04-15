module.exports = function() {

	app.get('/', function(req, res) {
		res.render('pages/home');
	});

	app.get('/second', function(req, res) {
		res.render('pages/second');
	});

}
