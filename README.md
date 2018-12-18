# Midwest PHP 2019

This repository is for the Midwest PHP 2019 website.  The website is leveraging a static site generator (more on that
below). Open up issues with any specific issues that are being faced or information that is missing from our page.

## Static Site Generation

We are leveraging [nanogen](https://github.com/doug2k1/nanogen) which is an extremely easy site generator.  This allows
for all of the templates to be created in EJS along with Markdown and YAML support.  Read the [documentation](https://doug2k1.github.io/nanogen/docs/).

## Source Layout
* `sass`: Contains SCSS stylesheets to be compiled into the `src/assets/css` folder.
* `src`: Where all of the webite source code lives.

## Running the Site

`npm install`: Yes, you will need to install the dependencies.
`npm run start`: Will compile the Sass stylesheets along and all of our nanogen EJS and Markdown templates and then
launch our browser to view the site.
