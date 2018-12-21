var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	locals.data = {
		speakers: [],
		sponsors: [],
	};

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	view.on('init', function (next) {
		keystone.list('SessionType')
			.model
			.findOne({
				name: 'keynote'
			})
			.exec(function (err, results) {

				keystone.list('Session')
					.model
					.find({
						level: results.id
					})
					.populate('speaker')
					.exec(function (err, results) {
						if (err || !results.length) {
							return next(err);
						}
						results.forEach(function (item) {
							locals.data.speakers.push(item.speaker);
						});
						next();
					});
			});
	});

	view.on('init', function (next) {
		keystone.list('Sponsor')
			.model.find()
			.populate('sponsorlevel')
			.exec(function (err, results) {
				if (err || !results.length) {
					return next(err);
				}
				locals.data.sponsors = results;
				next();
			});
	});

	// Render the view
	view.render('index');
};
