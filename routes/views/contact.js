const keystone = require('keystone');

const Enquiry = keystone.list('Enquiry');

module.exports = (req, res) => {
  const { View } = keystone;
  const view = new View(req, res);
  const { locals } = res;

  // Set locals
  locals.section = 'contact';
  locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
  locals.formData = req.body || {};
  locals.validationErrors = {};
  locals.enquirySubmitted = false;

  // On POST requests, add the Enquiry item to the database
  view.on('post', { action: 'contact' }, (next) => {
    const Model = Enquiry.model;
    const newEnquiry = new Model();
    const updater = newEnquiry.getUpdateHandler(req);

    updater.process(req.body, {
      flashErrors: true,
      fields: 'name, email, phone, enquiryType, message',
      errorMessage: 'There was a problem submitting your enquiry:',
    }, (err) => {
      if (err) {
        locals.validationErrors = err.errors;
      } else {
        locals.enquirySubmitted = true;
      }
      next();
    });
  });

  view.render('contact');
};
