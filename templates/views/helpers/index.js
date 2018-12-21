const moment = require('moment');
const _ = require('lodash');
const hbs = require('handlebars');
const keystone = require('keystone');
const cloudinary = require('cloudinary');

// Collection of templates to interpolate
const linkTemplate = _.template('<a href="<%= url %>"><%= text %></a>');
const scriptTemplate = _.template('<script src="<%= src %>"></script>');
const cssLinkTemplate = _.template('<link href="<%= href %>" rel="stylesheet">');

module.exports = () => {
  const helpers = {};

  /**
   * Generic HBS Helpers
   * ===================
   */

  // standard hbs equality check, pass in two values from template
  // {{#ifeq keyToCheck data.myKey}} [requires an else blockin template regardless]
  helpers.ifeq = (a, b, options) => {
    if (a == b) { // eslint-disable-line eqeqeq
      return options.fn(this);
    }
    return options.inverse(this);
  };

  /**
   * Port of Ghost helpers to support cross-theming
   * ==============================================
   *
   * Also used in the default keystonejs-hbs theme
   */

  // ### Date Helper
  // A port of the Ghost Date formatter similar to the keystonejs - pug interface
  //
  //
  // *Usage example:*
  // `{{date format='MM YYYY}}`
  // `{{date publishedDate format='MM YYYY'`
  //
  // Returns a string formatted date
  // By default if no date passed into helper than then a current-timestamp is used
  //
  // Options is the formatting and context check this.publishedDate
  // If it exists then it is formated, otherwise current timestamp returned

  helpers.date = (context, options) => {
    if (!options && Object.prototype.hasOwnProperty.call(context, 'hash')) {
      options = context; // eslint-disable-line no-param-reassign
      context = undefined; // eslint-disable-line no-param-reassign

      if (this.publishedDate) {
        context = this.publishedDate; // eslint-disable-line no-param-reassign
      }
    }

    // ensure that context is undefined, not null, as that can cause errors
    context = context === null ? undefined : context; // eslint-disable-line no-param-reassign

    const f = options.hash.format || 'MMM Do, YYYY';
    const { timeago } = options.hash;
    let date;

    // if context is undefined and given to moment then current timestamp is given
    // nice if you just want the current year to define in a tmpl
    if (timeago) {
      date = moment(context).fromNow();
    } else {
      date = moment(context).format(f);
    }
    return date;
  };

  // ### Category Helper
  // Ghost uses Tags and Keystone uses Categories
  // Supports same interface, just different name/semantics
  //
  // *Usage example:*
  // `{{categoryList categories separator=' - ' prefix='Filed under '}}`
  //
  // Returns an html-string of the categories on the post.
  // By default, categories are separated by commas.
  // input. categories:['tech', 'js']
  // output. 'Filed Undder <a href="blog/tech">tech</a>, <a href="blog/js">js</a>'

  helpers.categoryList = (categories, options) => {
    const autolink = !(_.isString(options.hash.autolink) && options.hash.autolink === 'false');
    const separator = _.isString(options.hash.separator) ? options.hash.separator : ', ';
    const prefix = _.isString(options.hash.prefix) ? options.hash.prefix : '';
    const suffix = _.isString(options.hash.suffix) ? options.hash.suffix : '';
    let output = '';

    function createTagList(tags) {
      const tagNames = _.map(tags, 'name');

      if (autolink) {
        return _.map(tags, tag => linkTemplate({
          url: (`/blog/${tag.key}`),
          text: _.escape(tag.name),
        })).join(separator);
      }
      return _.escape(tagNames.join(separator));
    }

    if (categories && categories.length) {
      output = prefix + createTagList(categories) + suffix;
    }
    return new hbs.SafeString(output);
  };

  /**
   * KeystoneJS specific helpers
   * ===========================
   */

  // block rendering for keystone admin css
  helpers.isAdminEditorCSS = (user) => {
    let output = '';
    if (typeof (user) !== 'undefined' && user.isAdmin) {
      output = cssLinkTemplate({
        href: '/keystone/styles/content/editor.min.css',
      });
    }
    return new hbs.SafeString(output);
  };

  // block rendering for keystone admin js
  helpers.isAdminEditorJS = (user) => {
    let output = '';
    if (typeof (user) !== 'undefined' && user.isAdmin) {
      output = scriptTemplate({
        src: '/keystone/js/content/editor.js',
      });
    }
    return new hbs.SafeString(output);
  };

  // Used to generate the link for the admin edit post button
  helpers.adminEditableUrl = (user, options) => {
    const rtn = keystone.app.locals.editable(user, {
      list: 'Post',
      id: options,
    });
    return rtn;
  };

  // ### CloudinaryUrl Helper
  // Direct support of the cloudinary.url method from Handlebars (see
  // cloudinary package documentation for more details).
  //
  // *Usage examples:*
  // `{{{cloudinaryUrl image width=640 height=480 crop='fill' gravity='north'}}}`
  // `{{#each images}} {{cloudinaryUrl width=640 height=480}} {{/each}}`
  //
  // Returns an src-string for a cloudinary image

  helpers.cloudinaryUrl = (context, options) => {
    // if we dont pass in a context and just kwargs
    // then `this` refers to our default scope block and kwargs
    // are stored in context.hash
    if (!options && Object.prototype.hasOwnProperty.call(context, 'hash')) {
      // strategy is to place context kwargs into options
      options = context; // eslint-disable-line no-param-reassign
      // bind our default inherited scope into context
      context = this; // eslint-disable-line no-param-reassign
    }

    // safe guard to ensure context is never null
    context = context === null ? undefined : context; // eslint-disable-line no-param-reassign

    if (context && context.public_id) { // eslint-disable-line react/destructuring-assignment
      const { hash } = options;
      hash.secure = keystone.get('cloudinary secure') || false;
      const imageName = context.public_id.concat('.', context.format);
      return cloudinary.url(imageName, hash);
    }

    return null;
  };

  // ### Content Url Helpers
  // KeystoneJS url handling so that the routes are in one place for easier
  // editing.  Should look at Django/Ghost which has an object layer to access
  // the routes by keynames to reduce the maintenance of changing urls

  // Direct url link to a specific post
  helpers.postUrl = postSlug => (`/blog/post/${postSlug}`);

  // might be a ghost helper
  // used for pagination urls on blog
  helpers.pageUrl = pageNumber => `/blog?page=${pageNumber}`;

  // create the category url for a blog-category page
  helpers.categoryUrl = categorySlug => (`/blog/${categorySlug}`);

  /**
   * ### Pagination Helpers
   * These are helpers used in rendering a pagination system for content
   * Mostly generalized and with a small adjust to `_helper.pageUrl` could be
   * universal for content types
   */

  /*
  * expecting the data.posts context or an object literal that has `previous` and `next` properties
  * ifBlock helpers in hbs
  * - http://stackoverflow.com/questions/8554517/handlerbars-js-using-an-helper-function-in-a-if-statement
  * */
  helpers.ifHasPagination = (postContext, options) => {
    // if implementor fails to scope properly or has an empty data set
    // better to display else block than throw an exception for undefined
    if (_.isUndefined(postContext)) {
      return options.inverse(this);
    }
    if (postContext.next || postContext.previous) {
      return options.fn(this);
    }
    return options.inverse(this);
  };

  helpers.paginationNavigation = (pages, currentPage, totalPages) => {
    let html = '';

    // pages should be an array ex.  [1,2,3,4,5,6,7,8,9,10, '....']
    // '...' will be added by keystone if the pages exceed 10
    _.each(pages, (page, ctr) => {
      // create ref to page, so that '...' is displayed as text even though int value is required
      const pageText = page;
      // create boolean flag state if currentPage
      const isActivePage = ((page === currentPage));
      // need an active class indicator
      const liClass = ((isActivePage) ? ' class="active"' : '');

      // if '...' is sent from keystone then we need to override the url
      let pageNum = page;
      if (page === '...') {
        // check position of '...' if 0 then return page 1, otherwise use totalPages
        pageNum = ((ctr) ? totalPages : 1);
      }

      // get the pageUrl using the integer value
      const pageUrl = helpers.pageUrl(pageNum);
      // wrapup the html
      html += `<li${liClass}>${linkTemplate({ url: pageUrl, text: pageText })}</li>\n`;
    });
    return html;
  };

  // special helper to ensure that we always have a valid page url set even if
  // the link is disabled, will default to page 1
  helpers.paginationPreviousUrl = (previousPage, totalPages) => {
    if (previousPage === false) {
      return helpers.pageUrl(1);
    }
    if (previousPage > totalPages) {
      return helpers.pageUrl(totalPages);
    }
    return helpers.pageUrl(previousPage);
  };

  // special helper to ensure that we always have a valid next page url set
  // even if the link is disabled, will default to totalPages
  helpers.paginationNextUrl = (nextPage, totalPages) => {
    if (nextPage === false) {
      return helpers.pageUrl(totalPages);
    }
    return helpers.pageUrl(nextPage);
  };


  //  ### Flash Message Helper
  //  KeystoneJS supports a message interface for information/errors to be passed from server
  //  to the front-end client and rendered in a html-block.  FlashMessage mirrors the Pug Mixin
  //  for creating the message.  But part of the logic is in the default.layout.  Decision was to
  //  surface more of the interface in the client html rather than abstracting behind a helper.
  //
  //  @messages:[]
  //
  //  *Usage example:*
  //  `{{#if messages.warning}}
  //      <div class="alert alert-warning">
  //          {{{flashMessages messages.warning}}}
  //      </div>
  //   {{/if}}`

  helpers.flashMessages = (messages) => {
    let output = '';
    messages.forEach((message) => {
      if (message.title) {
        output += `<h4>${message.title}</h4>`;
      }

      if (message.detail) {
        output += `<p>${message.detail}</p>`;
      }

      if (message.list) {
        output += '<ul>';
        message.list.forEach((list) => {
          output += `<li>${list}</li>`;
        });
        output += '</ul>';
      }
    });

    return new hbs.SafeString(output);
  };


  //  ### underscoreMethod call + format helper
  //  Calls to the passed in underscore method of the object (Keystone Model)
  //  and returns the result of format()
  //
  //  @obj: The Keystone Model on which to call the underscore method
  //  @undescoremethod: string - name of underscore method to call
  //
  //  *Usage example:*
  //  `{{underscoreFormat enquiry 'enquiryType'}}

  helpers.underscoreFormat = (obj, underscoreMethod) => obj._[underscoreMethod].format();

  return helpers;
};
