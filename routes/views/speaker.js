var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'speakers';

	locals.filters = {
		speaker: req.params.name,
	};

	locals.data = {
		speaker: {},
		sessions: [],
	};

	view.on('init', function (next) {
		keystone.list('Speaker')
			.model
			.findOne({
				slug: locals.filters.speaker,
			})
			.populate('Session')
			.exec(function (err, results) {
				locals.data.speaker = results;
				next(err);
			});
	});

	view.on('init', function (next) {
		keystone.list('Session')
			.model
			.find({
				speaker: locals.data.speaker._id,
			})
			.exec(function (err, results) {
				locals.data.sessions = results;
				next(err);
			});
	});

	// Render the view
	view.render('speaker');
};
