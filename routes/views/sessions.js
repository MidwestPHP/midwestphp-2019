const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'sessions';
  locals.data = {
    speakers: [],
  };

  view.on('init', (next) => {
    keystone.list('Session')
      .model
      .find()
      .populate('speaker')
      .populate('level')
      .exec((err, results) => {
        if (err || !results.length) {
          return next(err);
        }

        locals.data.sessions = results;
        return next();
      });
  });

  // Render the view
  view.render('sessions');
};
