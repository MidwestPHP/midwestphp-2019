var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'sessions';
	locals.data = {
		speakers: [],
	};

	view.on('init', function (next) {
		keystone.list('Session')
			.model
			.find()
			.populate('speaker')
			.exec(function (err, results) {
				if (err || !results.length) {
					return next(err);
				}

				locals.data.sessions = results;
				next();
			});
	});

	// Render the view
	view.render('sessions');
};
