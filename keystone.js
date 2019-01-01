// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();

// Require keystone
const handlebars = require('express-handlebars');
const keystone = require('keystone');
const lodash = require('lodash');
const helpers = new require('./templates/views/helpers')();

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
  name: 'Midwest PHP 2019',
  brand: 'Midwest PHP 2019',

  static: 'public',
  favicon: 'public/favicon.ico',
  views: 'templates/views',
  'view engine': '.hbs',

  'custom engine': handlebars.create({
    layoutsDir: 'templates/views/layouts',
    partialsDir: 'templates/views/partials',
    defaultLayout: 'default',
    helpers: helpers,
    extname: '.hbs',
  }).engine,

  'auto update': true,
  session: true,
  auth: true,
  'user model': 'User',
});

// Load your project's Models
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
  _: lodash,
  env: keystone.get('env'),
  utils: keystone.utils,
  editable: keystone.content.editable,
});

// Load your project's Routes
keystone.set('routes', require('./routes'));


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
  posts: ['posts', 'post-categories'],
  enquiries: 'enquiries',
  users: 'users',
});

// Start Keystone to connect to your database and initialise the web server
keystone.start();
