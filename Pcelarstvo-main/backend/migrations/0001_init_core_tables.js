exports.up = async function(knex) {
  await knex.schema.createTable('Tasks', t => {
    t.increments('id').primary();
    t.string('title', 200).notNullable();
    t.string('description', 2000);
    t.dateTime('start_at').notNullable();
    t.dateTime('end_at');
    t.integer('created_by').notNullable().references('id').inTable('Users');
    t.string('source_type', 50);                          
    t.specificType('source_payload', 'NVARCHAR(MAX)');   
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });

 
  await knex.schema.createTable('TaskAssignments', t => {
    t.increments('id').primary();
    t.integer('task_id').notNullable().references('id').inTable('Tasks');
    t.integer('beekeeper_id').notNullable().references('id').inTable('Users');
    t.dateTime('assigned_at').notNullable().defaultTo(knex.fn.now());
    t.string('status', 20).notNullable().defaultTo('ASSIGNED'); 
    t.dateTime('done_at');
    t.string('result_note', 1000);
    t.unique(['task_id', 'beekeeper_id']);
  });

  
  await knex.schema.createTable('TaskComments', t => {
    t.increments('id').primary();
    t.integer('task_id').notNullable().references('id').inTable('Tasks');
    t.integer('author_id').notNullable().references('id').inTable('Users');
    t.integer('assignment_id').references('id').inTable('TaskAssignments');
    t.string('content', 2000).notNullable();
    t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });

  
  await knex.schema.createTable('ApiSnapshots', t => {
    t.increments('id').primary();
    t.string('source', 50).notNullable();
    t.string('query_params', 1000);
    t.specificType('payload', 'NVARCHAR(MAX)').notNullable(); 
    t.dateTime('collected_at').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('ApiSnapshots');
  await knex.schema.dropTableIfExists('TaskComments');
  await knex.schema.dropTableIfExists('TaskAssignments');
  await knex.schema.dropTableIfExists('Tasks');
};
