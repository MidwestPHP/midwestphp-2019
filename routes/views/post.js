const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  // Set locals
  locals.section = 'blog';
  locals.filters = {
    post: req.params.post,
  };
  locals.data = {
    posts: [],
  };

  // Load the current post
  view.on('init', (next) => {
    const q = keystone.list('Post').model.findOne({
      state: 'published',
      slug: locals.filters.post,
    }).populate('author categories');

    q.exec((err, result) => {
      locals.data.post = result;
      next(err);
    });
  });

  // Load other posts
  view.on('init', (next) => {
    const q = keystone.list('Post').model.find().where('state', 'published').sort('-publishedDate').populate('author')
      .limit('4');

    q.exec((err, results) => {
      locals.data.posts = results;
      next(err);
    });
  });

  // Render the view
  view.render('post');
};
