const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  locals.data = {
    speakers: [],
  };

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'speakers';

  view.on('init', (next) => {
    keystone.list('Speaker').model.find().exec((err, results) => {
      if (err || !results.length) {
        return next(err);
      }

      locals.data.speakers = results;
      return next();
    });
  });

  // Render the view
  view.render('speakers');
};
