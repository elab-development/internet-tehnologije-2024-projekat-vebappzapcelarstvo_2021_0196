exports.up = async function(knex) {
  await knex.raw(`
    IF OBJECT_ID('dbo.v_TaskCompletionByMonth', 'V') IS NOT NULL
      DROP VIEW dbo.v_TaskCompletionByMonth;
  `);
  await knex.raw(`
    IF OBJECT_ID('dbo.v_CommentsByBeekeeper', 'V') IS NOT NULL
      DROP VIEW dbo.v_CommentsByBeekeeper;
  `);

  await knex.raw(`
    CREATE VIEW dbo.v_TaskCompletionByMonth AS
    SELECT
      FORMAT(ISNULL(done_at, assigned_at), 'yyyy-MM') AS year_month,
      COUNT(*) AS done_count
    FROM dbo.TaskAssignments
    WHERE status = 'DONE'
    GROUP BY FORMAT(ISNULL(done_at, assigned_at), 'yyyy-MM');
  `);

  await knex.raw(`
    CREATE VIEW dbo.v_CommentsByBeekeeper AS
    SELECT
      u.id AS beekeeper_id,
      u.username,
      COUNT(tc.id) AS comments_count
    FROM dbo.TaskComments tc
    JOIN dbo.Users u ON u.id = tc.author_id
    WHERE u.role = 'user'
    GROUP BY u.id, u.username;
  `);
};

exports.down = async function(knex) {
  await knex.raw(`
    IF OBJECT_ID('dbo.v_TaskCompletionByMonth', 'V') IS NOT NULL
      DROP VIEW dbo.v_TaskCompletionByMonth;
  `);
  await knex.raw(`
    IF OBJECT_ID('dbo.v_CommentsByBeekeeper', 'V') IS NOT NULL
      DROP VIEW dbo.v_CommentsByBeekeeper;
  `);
};
