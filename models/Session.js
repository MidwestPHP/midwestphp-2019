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
  day: {
    type: Types.Select, options: 'day 1, day 2',
  },
  room: {
    type: Types.Select, options: 'main ballroom, ballroom c, ballroom d', default: 'main ballroom', index: true,
  },
  time: {
    type: Types.Select, options: '9:00 AM, 10:00 AM, 11:00 AM, 1:00 PM, 2:00 PM, 3:00 PM, 4:00 PM',
  },
  speaker: { type: Types.Relationship, ref: 'Speaker', index: true },
});

Session.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Session.register();
