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

  const levels = {
    platinum: null,
    gold: null,
    silver: null,
    bronze: null,
    community: null,
  }

  view.on('init', (next) => {
    keystone.list('SponsorLevel')
      .model
      .find()
      .then((response) => {
        response.forEach((item) => {
          levels[`${item.name}`.toLowerCase()] = item._id;
        });
        next();
      })
      .catch((err) => {
        next(err);
      });

  });

  view.on('init', (next) => {
    const platinum = keystone.list('Sponsor').model.find().where({ level: levels.platinum });
    const gold = keystone.list('Sponsor').model.find().where({ level: levels.gold });
    const silver = keystone.list('Sponsor').model.find().where({ level: levels.silver });
    const bronze = keystone.list('Sponsor').model.find().where({ level: levels.bronze });
    const community = keystone.list('Sponsor').model.find().where({ level: levels.community });
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
