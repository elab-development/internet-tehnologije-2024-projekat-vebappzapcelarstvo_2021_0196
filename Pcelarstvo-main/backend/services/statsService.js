const { sql, poolConnect } = require('../db');

async function getCompletionsByMonth() {
  await poolConnect;
  const request = (await poolConnect).request();

  const query = `
    SELECT
      FORMAT(ISNULL(done_at, assigned_at), 'yyyy-MM') AS year_month,
      COUNT(*) AS done_count
    FROM TaskAssignments
    WHERE status = 'DONE'
    GROUP BY FORMAT(ISNULL(done_at, assigned_at), 'yyyy-MM')
    ORDER BY year_month;
  `;

  const result = await request.query(query);
  return result.recordset.map(r => ({
    month: r.year_month,
    doneCount: Number(r.done_count)
  }));
}

async function getCommentsByBeekeeper() {
  await poolConnect;
  const request = (await poolConnect).request();

  const query = `
    SELECT
      u.id AS beekeeper_id,
      CONCAT(u.name, ' ', u.surname) AS full_name,
      COUNT(tc.id) AS comments_count
    FROM TaskComments tc
    JOIN Users u ON u.id = tc.author_id
    WHERE u.role = @role
    GROUP BY u.id, u.name, u.surname
    ORDER BY comments_count DESC;
  `;

  request.input('role', sql.VarChar, 'user');

  const result = await request.query(query);
  return result.recordset.map(r => ({
    beekeeperId: Number(r.beekeeper_id),
    fullName: r.full_name,
    commentsCount: Number(r.comments_count)
  }));
}

module.exports = { getCompletionsByMonth, getCommentsByBeekeeper };
