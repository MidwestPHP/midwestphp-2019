var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Speaker Model
 * ==========
 */

var Speaker = new keystone.List('Speaker', {
	map: { name: 'speaker' },
	autokey: { path: 'slug', from: 'speaker', unique: true },
});

var storage = new keystone.Storage({
	adapter: keystone.Storage.Adapters.FS,
	fs: {
		path: keystone.expandPath('./public/images/speakers'),
		publicPath: '/images/speakers/',
	},
	schema: {
		url: true,
	},
});

Speaker.add({
	speaker: { type: String, required: true },
	bio: { type: Types.Html, wysiwyg: true },
	company: { type: String },
	companyUrl: { type: String },
	image: { type: Types.File, storage: storage, thumb: true },
	twitter: { type: String },
	github: { type: String },
});

/**
 * Relationships
 */
Speaker.relationship({ ref: 'Session', path: 'sessions', refPath: 'speaker' });

Speaker.defaultColumns = 'speaker, state|20%, author|20%, publishedDate|20%';
Speaker.register();
