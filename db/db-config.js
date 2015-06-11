var Bookshelf = require('bookshelf');

var knex =  !process.env.RDS_HOSTNAME ? require('./local_config.js') :
  require('knex')({
  client: 'pg',
  connection: {
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    database: 'ebdb',
    port     : process.env.RDS_PORT
  }
});

var db = require('bookshelf')(knex);
db.plugin('registry');

/**
 * Creates a users table in connected db if table is not already found.
 */
db.knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('users', function (user) {
      user.increments('id').primary();
      user.string('googleId', 255).unique();
      user.string('accessToken', 255);
      user.string('refreshToken', 255);
      user.string('tokenExpDate')
      user.integer('secondsValid');
      user.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

module.exports = db;
