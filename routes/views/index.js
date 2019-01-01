const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  locals.data = {
    speakers: [],
    sponsors: [],
  };

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'home';

  view.on('init', (next) => {
    keystone.list('SessionType')
      .model
      .findOne({
        name: 'keynote',
      })
      .exec((err, results) => {
        keystone.list('Session')
          .model
          .find({
            level: results.id,
          })
          .populate('speaker')
          .exec((listErr, listResults) => {
            if (listErr || !listResults.length) {
              return next(listErr);
            }
            listResults.forEach((item) => {
              locals.data.speakers.push(item.speaker);
            });
            return next();
          });
      });
  });

  view.on('init', (next) => {
    const select = {
      company: 1,
      logo: 2,
      level: 3,
    };
    keystone.list('Sponsor')
      .model.find()
      .select(select)
      .populate('SponsorLevel')
      .exec((err, results) => {
        if (err || !results.length) {
          return next(err);
        }

        // TODO: Need to update the results so we get the correct sponsor level
        locals.data.sponsors = results;

        return next();
      });
  });

  // Render the view
  view.render('index');
};
