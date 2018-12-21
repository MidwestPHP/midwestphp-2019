var keystone = require('keystone');

/**
 * SessionLocation Model
 * ==========
 */

var SessionLocation = new keystone.List('SessionLocation', {
	autokey: {path: 'slug', from: 'name', unique: true},
	hidden: true,
});

SessionLocation.add({
	name: {type: String, required: true},
});

SessionLocation.register();
