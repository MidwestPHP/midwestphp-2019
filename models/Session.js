const keystone = require('keystone');

const { Types } = keystone.Field;

/**
 * Session Model
 * ==========
 */

const Session = new keystone.List('Session', {
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'title', unique: true },
});

Session.add({
  title: { type: String, required: true },
  description: { type: Types.Html, wysiwyg: true },
  level: { type: Types.Relationship, ref: 'SessionType', index: true },
  room: {
    type: Types.Select, options: 'main ballroom, ballroom c, ballroom d', default: 'main ballroom', index: true,
  },
  speaker: { type: Types.Relationship, ref: 'Speaker', index: true },
});

Session.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Session.register();
