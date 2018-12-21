const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  // Init locals
  locals.section = 'blog';
  locals.filters = {
    category: req.params.category,
  };
  locals.data = {
    posts: [],
    categories: [],
  };

  // Load all categories
  view.on('init', (next) => {
    keystone.list('PostCategory').model.find().sort('name').exec((err, results) => {
      if (err || !results.length) {
        return next(err);
      }

      locals.data.categories = results;
      return next();
    });
  });

  // Load the current category filter
  view.on('init', (next) => {
    if (req.params.category) {
      return keystone.list('PostCategory').model.findOne({ key: locals.filters.category }).exec((listErr, result) => {
        locals.data.category = result;
        return next(listErr);
      });
    }

    return next();
  });

  // Load the posts
  view.on('init', (next) => {
    const q = keystone.list('Post').paginate({
      page: req.query.page || 1,
      perPage: 10,
      maxPages: 10,
      filters: {
        state: 'published',
      },
    })
      .sort('-publishedDate')
      .populate('author categories');

    if (locals.data.category) {
      q.where('categories').in([locals.data.category]);
    }

    q.exec((err, results) => {
      locals.data.posts = results;
      next(err);
    });
  });

  // Render the view
  view.render('blog');
};
