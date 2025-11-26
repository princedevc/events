exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.increments('id').primary();
    table.string('event_id').notNullable();
    table.string('user_id').notNullable();
    table.string('status').notNullable(); // booked, cancelled, assigned
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('orders');
};
