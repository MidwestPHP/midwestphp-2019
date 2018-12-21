const keystone = require('keystone');

/**
 * SessionType Model
 * ==========
 */

const SessionType = new keystone.List('SessionType', {
  autokey: { path: 'slug', from: 'name', unique: true },
  hidden: true,
});

SessionType.add({
  name: { type: String, required: true },
});

SessionType.register();
