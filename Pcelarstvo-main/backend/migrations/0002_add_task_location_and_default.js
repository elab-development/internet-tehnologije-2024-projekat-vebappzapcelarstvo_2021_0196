/** update status */
exports.up = async knex => {
  await knex.schema.alterTable('Tasks', t => {
    t.string('location', 200).nullable();
  });

  // data-fix: if there is old NULL rows, set them on ASSIGNED
  await knex('TaskAssignments').whereNull('status').update({ status: 'ASSIGNED' });
};

exports.down = async knex => {
  await knex.schema.alterTable('Tasks', t => {
    t.dropColumn('location');
  });
};
