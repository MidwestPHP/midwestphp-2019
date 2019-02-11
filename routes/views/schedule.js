const keystone = require('keystone');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const { locals } = res;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'schedule';
  locals.data = {};

  // generate schedule stubs
  const scheduleSpeakerStub = {
    title: 'TBD',
    speaker: 'TBD',
  };
  const scheduleKeynoteStub = {
    isKeynote: true,
    title: 'TBD',
    speaker: 'TBD',
  };
  const scheduleRoomsStub = {
    isSessions: true,
    'main ballroom': scheduleSpeakerStub,
    'ballroom c': scheduleSpeakerStub,
    'ballroom d': scheduleSpeakerStub,
  };

  locals.data = {
    schedule: {
      'day 1': {
        title: '8 MAR',
        id: 'day-1',
        times: {
          '8:00 AM': { isEvent: true, title: 'Registration', },
          '9:00 AM': Object.assign({}, scheduleKeynoteStub),
          '10:00 AM': Object.assign({}, scheduleRoomsStub),
          '11:00 AM': Object.assign({}, scheduleRoomsStub),
          '12:00 PM': { isEvent: true, title: 'Lunch', },
          '1:00 PM': Object.assign({}, scheduleKeynoteStub),
          '2:00 PM': Object.assign({}, scheduleRoomsStub),
          '3:00 PM': Object.assign({}, scheduleRoomsStub),
          '4:00 PM': Object.assign({}, scheduleKeynoteStub),
          '5:00 PM': { isEvent: true, title: 'Social Hour', },
        }
      },
      'day 2': {
        title: '9 MAR',
        id: 'day-2',
        times: {
          '8:00 AM': { isEvent: true, title: 'Registration', },
          '9:00 AM': Object.assign({}, scheduleKeynoteStub),
          '10:00 AM': Object.assign({}, scheduleRoomsStub),
          '11:00 AM': Object.assign({}, scheduleRoomsStub),
          '12:00 PM': { isEvent: true, title: 'Lunch', },
          '1:00 PM': Object.assign({}, scheduleRoomsStub),
          '2:00 PM': Object.assign({}, scheduleRoomsStub),
          '3:00 PM': Object.assign({}, scheduleKeynoteStub),
        }
      },
    },
  };

  view.on('init', (next) => {
    keystone.list('Session')
      .model
      .find()
      .populate('speaker')
      .populate('level')
      .exec((err, results) => {
        if (err || !results.length) {
          return next(err);
        }

        results.forEach(session => {
          if (!session.day || !session.time || !session.room) {
            return;
          }
          if (session.level.name == 'keynote') {
            locals.data.schedule[session.day].times[session.time] = {
              isKeynote: true,
              title: session.title,
              speaker: session.speaker.speaker,
            };
            return;
          }
          locals.data.schedule[session.day].times[session.time][session.room] = {
            title: session.title,
            speaker: session.speaker.speaker,
          };
        });

        return next();
      });
  });

  // Render the view
  view.render('schedule');
};
