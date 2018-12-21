var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'sponsors';

	locals.data = {
		platinum: [],
		gold: [],
		silver: [],
		bronze: [],
		community: [],
	};

	view.on('init', function (next) {

		var platinum = keystone.list('Sponsor').model.find().where({ level: 'platinum' });
		var gold = keystone.list('Sponsor').model.find().where({ level: 'gold' });
		var silver = keystone.list('Sponsor').model.find().where({ level: 'silver' });
		var bronze = keystone.list('Sponsor').model.find().where({ level: 'bronze' });
		var community = keystone.list('Sponsor').model.find().where({ level: 'community' });

		Promise.all([
			platinum, gold, silver, bronze, community,
		]).then(function ([platinumResults, goldResults, silverResults, bronzeResults, communityResults]) {
			console.log(platinumResults);
			console.log(goldResults);
			console.log(silverResults);
			console.log(bronzeResults);
			console.log(communityResults);
			locals.data.platinum = platinumResults;
			locals.data.gold = goldResults;
			locals.data.silver = silverResults;
			locals.data.bronze = bronzeResults;
			locals.data.community = communityResults;
			next();
		})
		.catch(function (err) {
			next(err);
		});
	});

	// Render the view
	view.render('sponsors');
};
