const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

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

  view.on('init', (next) => {
    const platinum = keystone.list('Sponsor').model.find().where({ level: 'platinum' });
    const gold = keystone.list('Sponsor').model.find().where({ level: 'gold' });
    const silver = keystone.list('Sponsor').model.find().where({ level: 'silver' });
    const bronze = keystone.list('Sponsor').model.find().where({ level: 'bronze' });
    const community = keystone.list('Sponsor').model.find().where({ level: 'community' });

    Promise.all([
      platinum, gold, silver, bronze, community,
    ]).then(([platinumResults, goldResults, silverResults, bronzeResults, communityResults]) => {
      locals.data.platinum = platinumResults;
      locals.data.gold = goldResults;
      locals.data.silver = silverResults;
      locals.data.bronze = bronzeResults;
      locals.data.community = communityResults;
      next();
    })
      .catch((err) => {
        next(err);
      });
  });

  // Render the view
  view.render('sponsors');
};
