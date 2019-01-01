const keystone = require('keystone');

/**
 * SponsorLevel Model
 * ==========
 */

const SponsorLevel = new keystone.List('SponsorLevel', {
  map: { name: 'name' },
  autokey: { path: 'slug', from: 'name', unique: true },
  hidden: true,
});

SponsorLevel.add({
  name: { type: String, required: true, initial: true },
  order: { type: Number, required: true, initial: true },
});

SponsorLevel.relationship({ ref: 'Sponsor', path: 'sponsorLevels', refPath: 'level' });

SponsorLevel.register();
