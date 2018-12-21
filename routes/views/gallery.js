const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  // Set locals
  locals.section = 'gallery';

  // Load the galleries by sortOrder
  view.query('galleries', keystone.list('Gallery').model.find().sort('sortOrder'));

  // Render the view
  view.render('gallery');
};
