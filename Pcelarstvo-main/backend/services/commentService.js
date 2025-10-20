const { sql, poolConnect } = require('../db');

function clampPaging(page = 1, pageSize = 20) {
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

async function createComment({ authorId, taskId, content, assignmentId }) {
  if (!authorId || !taskId || !content) {
    const e = new Error('authorId, taskId and content are required');
    e.statusCode = 400; throw e;
  }

  await poolConnect;

  {
    const r = (await poolConnect).request();
    r.input('tid', sql.Int, taskId);
    const chk = await r.query(`SELECT id FROM Tasks WHERE id=@tid`);
    if (!chk.recordset[0]) {
      const e = new Error('Task not found');
      e.statusCode = 404; throw e;
    }
  }

  if (assignmentId) {
    const r2 = (await poolConnect).request();
    r2.input('aid', sql.Int, assignmentId);
    const chk2 = await r2.query(`
      SELECT a.id, a.task_id, a.beekeeper_id
      FROM TaskAssignments a
      WHERE a.id=@aid
    `);
    const arow = chk2.recordset[0];
    if (!arow) {
      const e = new Error('Assignment not found');
      e.statusCode = 404; throw e;
    }
    if (arow.task_id !== taskId) {
      const e = new Error('Assignment does not belong to this task');
      e.statusCode = 400; throw e;
    }

    if (arow.beekeeper_id !== authorId) {
      const e = new Error('Forbidden to comment with this assignment_id');
      e.statusCode = 403; throw e;
    }
  }

  const ins = (await poolConnect).request();
  ins.input('tid', sql.Int, taskId);
  ins.input('aid', sql.Int, assignmentId || null);
  ins.input('uid', sql.Int, authorId);
  ins.input('content', sql.VarChar(2000), content);

  const insQ = `
    INSERT INTO TaskComments(task_id, assignment_id, author_id, content, created_at)
    VALUES (@tid, @aid, @uid, @content, SYSUTCDATETIME());
  `;
  await ins.query(insQ);

  return { ok: true };
}

async function fetchComments({ taskId, assignmentId, page, pageSize }) {
  if (!taskId && !assignmentId) {
    const e = new Error('Provide taskId and/or assignmentId');
    e.statusCode = 400; throw e;
  }
  await poolConnect;
  const { offset, pageSize: ps } = clampPaging(page, pageSize);

  const req = (await poolConnect).request();

  let where = '1=1';
  if (taskId) { req.input('tid', sql.Int, taskId); where += ' AND c.task_id=@tid'; }
  if (assignmentId) { req.input('aid', sql.Int, assignmentId); where += ' AND c.assignment_id=@aid'; }

  const countQ = `
    SELECT COUNT(*) AS total
    FROM TaskComments c
    WHERE ${where};
  `;
  const dataQ = `
    SELECT
      c.id, c.task_id, c.assignment_id, c.author_id,
      c.content, c.created_at,
      u.name, u.surname, u.username
    FROM TaskComments c
    JOIN Users u ON u.id = c.author_id
    WHERE ${where}
    ORDER BY c.created_at DESC, c.id DESC
    OFFSET ${offset} ROWS FETCH NEXT ${ps} ROWS ONLY;
  `;

  pool = await poolConnect;
  if (!taskId && assignmentId){
    const taskRes = await pool.request()
      .input('aid', sql.Int, assignmentId)
      .query(`
        SELECT task_id 
        FROM TaskAssignments 
        WHERE id = @aid
      `);
    if (taskRes.recordset.length) {
      taskId = taskRes.recordset[0].task_id;
    }
  }

  const [cnt, data] = await Promise.all([
    req.query(countQ),
    req.query(dataQ)
  ]);
  const total = cnt.recordset[0]?.total || 0;
  return { total, items: data.recordset, task_id: taskId || null};
}

module.exports = {
  createComment,
  fetchComments
};