exports.seed = async function(knex) {
  // 1) Filter for User role
  const beekeepers = await knex('Users')
    .select('id', 'username')
    .where({ role: 'user' });

  if (beekeepers.length === 0) {
    console.log('Nema korisnika sa role="user". Preskačem demo seed.');
    return;
  }

  // 2) Clear old SEED data
  const seedTaskIdsQuery = knex('Tasks').select('id').where({ source_type: 'SEED' });

  await knex('TaskComments').whereIn('task_id', seedTaskIdsQuery).del();
  await knex('TaskAssignments').whereIn('task_id', seedTaskIdsQuery).del();
  await knex('Tasks').where({ source_type: 'SEED' }).del();

  // 3) DateTime helper functions
  const now = new Date();
  function startOfMonthOffset(monthsAgo) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    d.setUTCMonth(d.getUTCMonth() - monthsAgo);
    return d;
  }
  function midOfMonth(dt) {
    const d = new Date(dt);
    d.setUTCDate(15);
    d.setUTCHours(9, 0, 0, 0);
    return d;
  }
  function endOfMonth(dt) {
    const d = new Date(dt);
    d.setUTCMonth(d.getUTCMonth() + 1, 0); 
    d.setUTCHours(17, 0, 0, 0);
    return d;
  }

 
  const months = [5, 4, 3, 2, 1, 0]; 
  const taskRows = [];

  for (const m of months) {
    const s = startOfMonthOffset(m);
    const titles = [
      `Pregled rama i legla (${s.toISOString().slice(0,7)})`,
      `Kontrola varoe (${s.toISOString().slice(0,7)})`,
      `Prihrana sirupom (${s.toISOString().slice(0,7)})`
    ];

    taskRows.push(
      {
        title: titles[0],
        description: 'Vizuelni pregled stanja legla i prisustva matice.',
        start_at: s,
        end_at: midOfMonth(s),
        created_by: 1, 
        source_type: 'SEED',
        source_payload: null
      },
      {
        title: titles[1],
        description: 'Postavljanje podnjača za kontrolu varoe.',
        start_at: midOfMonth(s),
        end_at: endOfMonth(s),
        created_by: 1,
        source_type: 'SEED',
        source_payload: null
      },
      {
        title: titles[2],
        description: 'Prihrana pogačom ili sirupom u zavisnosti od temperature.',
        start_at: s,
        end_at: endOfMonth(s),
        created_by: 1,
        source_type: 'SEED',
        source_payload: null
      }
    );
  }

  // 5) Insert Tasks
  const taskIds = await knex('Tasks').insert(taskRows).returning('id');
  const allTaskIds = (taskIds || []).map(r => (typeof r === 'object' ? r.id : r));

  
  let tasks;
  if (!allTaskIds.length) {
    tasks = await knex('Tasks').select('id').where({ source_type: 'SEED' });
  } else {
    tasks = allTaskIds.map(id => ({ id }));
  }

  // 6) Task assignemnt
  const assignments = [];
  for (const t of tasks) {
    for (const b of beekeepers) {
      assignments.push({
        task_id: t.id,
        beekeeper_id: b.id,
        assigned_at: knex.fn.now(),
        status: 'ASSIGNED',
        done_at: null,
        result_note: null
      });
    }
  }
  const assignmentIds = await knex('TaskAssignments').insert(assignments).returning('id');
  const allAssignmentIds = (assignmentIds || []).map(r => (typeof r === 'object' ? r.id : r));
  let createdAssignments;
  if (!allAssignmentIds.length) {
    createdAssignments = await knex('TaskAssignments')
      .select('id', 'task_id', 'beekeeper_id')
      .whereIn('task_id', knex('Tasks').select('id').where({ source_type: 'SEED' }));
  } else {
    createdAssignments = await knex('TaskAssignments')
      .select('id', 'task_id', 'beekeeper_id')
      .whereIn('id', allAssignmentIds);
  }

  // 7)  Mark 50% as DONE and add comments
  const comments = [];
  for (const asg of createdAssignments) {
    
    const task = await knex('Tasks').select('start_at').where({ id: asg.task_id }).first();
    if (!task) continue;

    const s = new Date(task.start_at);
    const doneAt = midOfMonth(s);

    if ((asg.id % 2) === 0) {
      await knex('TaskAssignments')
        .where({ id: asg.id })
        .update({ status: 'DONE', done_at: doneAt, result_note: 'Obavljeno' });

      if ((asg.id % 4) === 0) {
        comments.push({
          task_id: asg.task_id,
          author_id: asg.beekeeper_id,
          assignment_id: asg.id,
          content: 'Obavljeno bez poteškoća.',
          created_at: doneAt
        });
      }
    } else {
      if ((asg.id % 5) === 0) {
        comments.push({
          task_id: asg.task_id,
          author_id: asg.beekeeper_id,
          assignment_id: asg.id,
          content: 'Nije bilo moguće zbog kiše.',
          created_at: endOfMonth(s)
        });
      }
    }
  }

  if (comments.length) {
    await knex('TaskComments').insert(comments);
  }

  console.log(`SEED gotovo: Tasks=${taskRows.length}, Assignments=${createdAssignments.length}, Comments=${comments.length}`);
};
