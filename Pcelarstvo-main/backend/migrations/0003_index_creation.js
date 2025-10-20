/** Index the table */
exports.up = async knex => {
  await knex.schema.alterTable('TaskAssignments', t => {
    t.index(['beekeeper_id', 'status'], 'IX_TaskAssignments_Beekeeper_Status');
    t.index(['task_id'], 'IX_TaskAssignments_Task');
  });
  await knex.schema.alterTable('TaskComments', t => {
    t.index(['task_id', 'created_at'], 'IX_TaskComments_Task_Created');
  });
  await knex.schema.alterTable('Tasks', t => {
    t.index(['start_at'], 'IX_Tasks_StartAt');
  });
};

exports.down = async knex => {
  await knex.raw('DROP INDEX IX_TaskAssignments_Beekeeper_Status ON TaskAssignments');
  await knex.raw('DROP INDEX IX_TaskAssignments_Task ON TaskAssignments');
  await knex.raw('DROP INDEX IX_TaskComments_Task_Created ON TaskComments');
  await knex.raw('DROP INDEX IX_Tasks_StartAt ON Tasks');
};
