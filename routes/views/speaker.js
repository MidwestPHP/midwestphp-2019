const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;
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

  view.on('init', (next) => {
    keystone.list('Speaker')
      .model
      .findOne({
        slug: locals.filters.speaker,
      })
      .populate('Session')
      .exec((err, results) => {
        locals.data.speaker = results;
        next(err);
      });
  });

  view.on('init', (next) => {
    keystone.list('Session')
      .model
      .find({
        speaker: locals.data.speaker._id, // eslint-disable-line no-underscore-dangle
      })
      .exec((err, results) => {
        locals.data.sessions = results;
        next(err);
      });
  });

  // Render the view
  view.render('speaker');
};
