const keystone = require('keystone');

const { Types } = keystone.Field;

/**
 * Sponsor Model
 * ==========
 */

const Sponsor = new keystone.List('Sponsor', {
  map: { name: 'company' },
  autokey: { path: 'slug', from: 'company', unique: true },
});

const storage = new keystone.Storage({
  adapter: keystone.Storage.Adapters.FS,
  fs: {
    path: keystone.expandPath('./public/images/sponsors'),
    publicPath: '/images/sponsors/',
  },
  schema: {
    url: true,
  },
});

Sponsor.add({
  company: { type: String, required: true },
  level: { type: Types.Relationship, ref: 'SponsorLevel' },
  logo: { type: Types.File, storage, thumb: true },
  description: { type: Types.Html, wysiwyg: true },
  website: { type: String },
  facebook: { type: String },
  github: { type: String },
  googleplus: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  twitter: { type: String },
});

Sponsor.defaultColumns = 'company, level';

Sponsor.register();
