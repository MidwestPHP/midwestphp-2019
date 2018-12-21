var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	locals.data = {
		speakers: [],
	};

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'speakers';

	view.on('init', function (next) {
		keystone.list('Speaker').model.find().exec(function (err, results) {
			if (err || !results.length) {
				return next(err);
			}

			locals.data.speakers = results;
			next();
		});
	});

	// Render the view
	view.render('speakers');
};
