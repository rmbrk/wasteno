// TODO after making the api frontend-ready, finish migration system

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex.raw(`drop owned by ${process.env.DB_USERNAME}`)
    .then(() => {
      return knex('Moderator')
        .insert({
          ...JSON.parse(process.env.ORIGIN_MOD_DATA),
          isOrigin: true,
        })
    })
};
