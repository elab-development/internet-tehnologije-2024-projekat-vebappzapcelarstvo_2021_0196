const { sql, poolConnect } = require('../db');

function daysDiffUtc(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  const ax = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bx = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.floor((ax - bx) / MS);
}

function pagingClause(page = 1, pageSize = 20, defaultOrder = 't.start_at DESC, t.id DESC') {
  page = Math.max(1, parseInt(page, 10) || 1);
  pageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset, orderBy: defaultOrder };
}

function toDateOnly(d) {
  const dt = new Date(d);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function fetchTasks({ from, to, status, page, pageSize }) {
  await poolConnect;
  const req = (await poolConnect).request();
  const { offset, pageSize: ps, orderBy } = pagingClause(page, pageSize);

  let where = '1=1';
  if (from) { req.input('from', sql.DateTime2, new Date(from)); where += ' AND t.start_at >= @from'; }
  if (to)   { req.input('to',   sql.DateTime2, new Date(to));   where += ' AND (t.end_at IS NULL OR t.end_at <= @to)'; }
  if (status) { 
    req.input('st', sql.VarChar(20), status);
    where += ' AND EXISTS (SELECT 1 FROM TaskAssignments a WHERE a.task_id=t.id AND a.status=@st)';
  }

  const countQ = `
    SELECT COUNT(*) AS total
    FROM Tasks t
    WHERE ${where};
  `;
  const dataQ = `
    SELECT
      t.id, t.title, t.description, t.start_at, t.end_at, t.created_at, t.location,
      t.source_type,
      COUNT(a.id) AS assignments_total,
      SUM(CASE WHEN a.status='DONE' THEN 1 ELSE 0 END) AS assignments_done
    FROM Tasks t
    LEFT JOIN TaskAssignments a ON a.task_id = t.id
    WHERE ${where}
    GROUP BY t.id, t.title, t.description, t.start_at, t.end_at, t.created_at, t.location, t.source_type
    ORDER BY ${orderBy}
    OFFSET ${offset} ROWS FETCH NEXT ${ps} ROWS ONLY;
  `;

  const [countRes, dataRes] = await Promise.all([
    req.query(countQ),
    req.query(dataQ)
  ]);

  const total = countRes.recordset[0]?.total || 0;
  return { total, items: dataRes.recordset };
}

async function fetchComments({ from, to, beekeeperId, taskId, page, pageSize }) {
  await poolConnect;
  const req = (await poolConnect).request();
  const { offset, pageSize: ps, orderBy } = pagingClause(page, pageSize, 'c.created_at DESC, c.id DESC');

  let where = '1=1';
  if (from) { req.input('from', sql.DateTime2, new Date(from)); where += ' AND c.created_at >= @from'; }
  if (to)   { req.input('to',   sql.DateTime2, new Date(to));   where += ' AND c.created_at <= @to'; }
  if (beekeeperId) { req.input('bk', sql.Int, beekeeperId); where += ' AND c.author_id = @bk'; }
  if (taskId)      { req.input('tid', sql.Int, taskId);     where += ' AND c.task_id = @tid'; }

  const countQ = `
    SELECT COUNT(*) AS total
    FROM TaskComments c
    WHERE ${where};
  `;
  const dataQ = `
    SELECT
      c.id, c.task_id, c.assignment_id, c.author_id,
      c.content, c.created_at,
      t.title AS task_title,
      u.name, u.surname
    FROM TaskComments c
    LEFT JOIN Tasks t ON t.id = c.task_id
    LEFT JOIN Users u ON u.id = c.author_id
    WHERE ${where}
    ORDER BY ${orderBy}
    OFFSET ${offset} ROWS FETCH NEXT ${ps} ROWS ONLY;
  `;

  const [countRes, dataRes] = await Promise.all([
    req.query(countQ),
    req.query(dataQ)
  ]);

  const total = countRes.recordset[0]?.total || 0;
  return { total, items: dataRes.recordset };
}

async function fetchCompleted({ from, to, beekeeperId, taskId, page, pageSize }) {
  await poolConnect;
  const req = (await poolConnect).request();
  const { offset, pageSize: ps, orderBy } = pagingClause(page, pageSize, 'a.done_at DESC, a.id DESC');

  let where = "a.status='DONE'";
  if (from) { req.input('from', sql.DateTime2, new Date(from)); where += ' AND a.done_at >= @from'; }
  if (to)   { req.input('to',   sql.DateTime2, new Date(to));   where += ' AND a.done_at <= @to'; }
  if (beekeeperId) { req.input('bk', sql.Int, beekeeperId); where += ' AND a.beekeeper_id = @bk'; }
  if (taskId)      { req.input('tid', sql.Int, taskId);     where += ' AND a.task_id = @tid'; }

  const countQ = `
    SELECT COUNT(*) AS total
    FROM TaskAssignments a
    WHERE ${where};
  `;
  const dataQ = `
    SELECT
      a.id AS assignment_id,
      a.task_id,
      a.beekeeper_id,
      a.done_at,
      a.result_note,
      t.title AS task_title,
      t.start_at, t.end_at,
      u.name, u.surname
    FROM TaskAssignments a
    LEFT JOIN Tasks t ON t.id = a.task_id
    LEFT JOIN Users u ON u.id = a.beekeeper_id
    WHERE ${where}
    ORDER BY ${orderBy}
    OFFSET ${offset} ROWS FETCH NEXT ${ps} ROWS ONLY;
  `;

  const [countRes, dataRes] = await Promise.all([
    req.query(countQ),
    req.query(dataQ)
  ]);

  const total = countRes.recordset[0]?.total || 0;
  return { total, items: dataRes.recordset };
}

async function getBeekeeperCalendar({ beekeeperId, from, to }) {
  if (!beekeeperId) throw new Error('beekeeperId required');
  if (!from || !to) throw new Error('from and to required');

  await poolConnect;
  const req = (await poolConnect).request();
  req.input('bk', sql.Int, beekeeperId);
  req.input('from', sql.Date, new Date(from));
  req.input('to', sql.Date, new Date(to));

  const q = `
    SELECT
      a.id AS assignment_id,
      a.status AS assignment_status,
      a.done_at,
      t.id AS task_id,
      t.title,
      t.start_at,
      t.end_at,
      t.description
    FROM TaskAssignments a
    JOIN Tasks t ON t.id = a.task_id
    WHERE a.beekeeper_id = @bk
      AND CAST(COALESCE(t.end_at, t.start_at) AS date) BETWEEN @from AND @to;  
  `;
  const rs = await req.query(q);

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = todayDate.getTime();

  const byDate = new Map();
  for (const row of rs.recordset) {
    const dayKey = toDateOnly(row.end_at || row.start_at);

    if (!byDate.has(dayKey)) {
      byDate.set(dayKey, { done: false, future: false, past: false, descriptions: [] });
    }
    const bucket = byDate.get(dayKey);

    if (row.description) bucket.descriptions.push(row.description);

    if ((row.assignment_status || '').toUpperCase() === 'DONE') {
      bucket.done = true;
    } else {
      const start = new Date(row.start_at).getTime();
      const end   = row.end_at ? new Date(row.end_at).getTime() : null;

      const isFuture  = (end ?? start) >= today;  
      const isOverdue = end ? (end < now.getTime()) : (start < today);

      if (isOverdue) bucket.past = true;
      else if (isFuture) bucket.future = true;
      else bucket.future = true;
    }
  }

  const result = [...byDate.entries()]
    .map(([date, b]) => {
      let status = null;
      if (b.done) status = 'DONE';
      else if (b.future) status = 'ASSIGNED_FUTURE';
      else if (b.past) status = 'ASSIGNED_PAST';
      return { date, status, descriptions: b.descriptions };
    })
    .filter(x => !!x.status)
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}



async function fetchFutureTasks() {
  await poolConnect;
  const req = (await poolConnect).request();

  const now = new Date(); 
  req.input('now', sql.DateTime2, now);

  const q = `
    SELECT id, title, description, start_at, end_at
    FROM Tasks
    WHERE start_at >= @now AND (end_at IS NULL OR end_at >= @now)
    ORDER BY start_at ASC, id ASC;
  `;

  const rs = await req.query(q);
  return rs.recordset || [];
}

async function assignExistingTask({ beekeeperId, taskId }) {
  if (!beekeeperId || !taskId) throw new Error('beekeeperId and taskId are required');

  await poolConnect;
  const now = new Date();

  const req = (await poolConnect).request();
  req.input('bk', sql.Int, beekeeperId);
  req.input('tid', sql.Int, taskId);
  req.input('now', sql.DateTime2, now);

  const u = await req.query(`
    SELECT id FROM Users
    WHERE id = @bk AND LOWER(role) = 'user';
  `);
  if (!u.recordset.length) throw new Error('Beekeeper not found or not a user');

  const t = await req.query(`
    SELECT id, start_at, end_at
    FROM Tasks
    WHERE id = @tid;
  `);
  if (!t.recordset.length) throw new Error('Task not found');

  const row = t.recordset[0];
  if (new Date(row.start_at).getTime() < now.getTime() ||
      (row.end_at && new Date(row.end_at).getTime() < now.getTime())) {
    throw new Error('Task must have start/end in the future');
  }

  const dup = await req.query(`
    SELECT TOP 1 1 AS x
    FROM TaskAssignments
    WHERE beekeeper_id = @bk AND task_id = @tid
      AND status IN ('ASSIGNED','IN_PROGRESS');
  `);
  if (dup.recordset.length) throw new Error('Task already assigned to this user');

  const chkReq = (await poolConnect).request();
  chkReq.input('bk', sql.Int, beekeeperId);
  chkReq.input('end', sql.DateTime2, row.end_at);

  const conflict = await chkReq.query(`
    SELECT TOP 1 a.id
    FROM TaskAssignments a
    JOIN Tasks t2 ON t2.id = a.task_id
    WHERE a.beekeeper_id = @bk
      AND CAST(t2.end_at AS date) = CAST(@end AS date);
  `);
  if (conflict.recordset.length) {
    const endDate = new Date(row.end_at);
    const endKey = `${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;
    throw new Error(`Assignment already exists for ${endKey}.`);
  }

  const insReq = (await poolConnect).request();
  insReq.input('bk', sql.Int, beekeeperId);
  insReq.input('tid', sql.Int, taskId);
  insReq.input('st', sql.VarChar(20), 'ASSIGNED');

  await insReq.query(`
    INSERT INTO TaskAssignments (beekeeper_id, task_id, status)
    VALUES (@bk, @tid, @st);
  `);

  return { ok: true };
}

async function createAndAssignTask({ beekeeperId, title, description, start_at, end_at }) {
  if (!beekeeperId || !title || !start_at || !end_at) {
    throw new Error('beekeeperId, title, start_at and end_at are required');
  }

  await poolConnect;
  const now = new Date();

  const start = new Date(start_at);
  const end   = new Date(end_at);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid dates');
  }
  if (start.getTime() < now.getTime() || end.getTime() < now.getTime()) {
    throw new Error('New task must be in the future');
  }
  if (end.getTime() < start.getTime()) {
    throw new Error('end_at must be after start_at');
  }

  const req = (await poolConnect).request();
  req.input('bk', sql.Int, beekeeperId);
  const u = await req.query(`SELECT id FROM Users WHERE id = @bk AND LOWER(role)='user';`);
  if (!u.recordset.length) throw new Error('Beekeeper not found or not a user');

  const chkReq = (await poolConnect).request();
  chkReq.input('bk', sql.Int, beekeeperId);
  chkReq.input('end', sql.DateTime2, end);

  const conflict = await chkReq.query(`
    SELECT TOP 1 a.id
    FROM TaskAssignments a
    JOIN Tasks t2 ON t2.id = a.task_id
    WHERE a.beekeeper_id = @bk
      AND CAST(t2.end_at AS date) = CAST(@end AS date);
  `);
  if (conflict.recordset.length) {
    const endKey = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
    throw new Error(`Assignment already exists for ${endKey}.`);
  }

  const createReq = (await poolConnect).request();
  createReq.input('title', sql.NVarChar, title);
  createReq.input('desc', sql.NVarChar, description || '');
  createReq.input('start', sql.DateTime2, start);
  createReq.input('end', sql.DateTime2, end);
  createReq.input('createdBy', sql.Int, 1);
  createReq.input('sourceType', sql.VarChar(20), 'ADMIN');

  const taskRes = await createReq.query(`
    INSERT INTO Tasks (title, description, start_at, end_at, created_by, source_type)
    OUTPUT INSERTED.id
    VALUES (@title, @desc, @start, @end, @createdBy, @sourceType);
  `);
  const newTaskId = taskRes.recordset[0].id;

  const assignReq = (await poolConnect).request();
  assignReq.input('bk', sql.Int, beekeeperId);
  assignReq.input('tid', sql.Int, newTaskId);
  assignReq.input('st', sql.VarChar(20), 'ASSIGNED');

  await assignReq.query(`
    INSERT INTO TaskAssignments (beekeeper_id, task_id, status)
    VALUES (@bk, @tid, @st);
  `);

  return { ok: true, taskId: newTaskId };
}


async function updateTask({ taskId, title, description, start_at, end_at }) {
  await poolConnect;
  const req = (await poolConnect).request();

  req.input('id', sql.Int, taskId);
  req.input('title', sql.NVarChar(255), title);
  req.input('desc', sql.NVarChar(sql.MAX), description);
  req.input('start', sql.DateTime2, new Date(start_at));
  req.input('end', sql.DateTime2, new Date(end_at));

  const checkQ = `
    SELECT COUNT(*) AS cnt
    FROM Tasks
    WHERE id = @id AND start_at > GETDATE();
  `;
  const checkRes = await req.query(checkQ);
  if (!checkRes.recordset[0].cnt) {
    throw new Error('Cannot update past or ongoing tasks.');
  }

  const updateQ = `
    UPDATE Tasks
    SET title = @title,
        description = @desc,
        start_at = @start,
        end_at = @end
    WHERE id = @id;
  `;
  await req.query(updateQ);

  return { success: true };
}

async function deleteTask(taskId) {
  await poolConnect;
  const req = (await poolConnect).request();

  req.input('id', sql.Int, taskId);

  const checkQ = `
    SELECT COUNT(*) AS cnt
    FROM Tasks
    WHERE id = @id AND start_at > GETDATE();
  `;
  const checkRes = await req.query(checkQ);
  if (!checkRes.recordset[0].cnt) {
    throw new Error('Cannot delete past or ongoing tasks.');
  }

  await req.query(`
    DELETE FROM TaskAssignments WHERE task_id = @id;
  `);

  await req.query(`
    DELETE FROM Tasks WHERE id = @id;
  `);

  return { success: true };
}

async function getUserCalendar({ beekeeperId, from, to }) {
  if (!beekeeperId) throw new Error('beekeeperId required');
  if (!from || !to) throw new Error('from and to required');

  await poolConnect;
  const req = (await poolConnect).request();
  req.input('bk', sql.Int, beekeeperId);
  req.input('from', sql.Date, new Date(from));
  req.input('to', sql.Date, new Date(to));

  const q = `
    SELECT
      a.id AS assignment_id,
      a.status AS assignment_status,
      a.done_at,
      t.id AS task_id,
      t.title,
      t.start_at,
      t.end_at,
      t.description
    FROM TaskAssignments a
    JOIN Tasks t ON t.id = a.task_id
    WHERE a.beekeeper_id = @bk
      AND CAST(COALESCE(t.end_at, t.start_at) AS date) BETWEEN @from AND @to;
  `;

  const rs = await req.query(q);

  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = todayDate.getTime();

  const assignments = [];

  for (const row of rs.recordset) {
    const dayKey = toDateOnly(row.end_at || row.start_at);

    let status = null;
    if ((row.assignment_status || '').toUpperCase() === 'DONE') {
      status = 'DONE';
    } else {
      const start = new Date(row.start_at).getTime();
      const end = row.end_at ? new Date(row.end_at).getTime() : null;

      const isFuture = (end ?? start) >= today;
      const isOverdue = end ? (end < now.getTime()) : (start < today);

      if (isOverdue) status = 'ASSIGNED_PAST';
      else status = 'ASSIGNED_FUTURE';
    }

    assignments.push({
      assignment_id: row.assignment_id,
      date: dayKey,
      status,
      tasks: [
        {
          assignment_id: row.assignment_id, 
          title: row.title || '',
          description: row.description || ''
        }
      ]
    });
  }

  return assignments
    .filter(a => !!a.status)
    .sort((a, b) => a.date.localeCompare(b.date));
}



async function markAssignmentDone({ assignmentId, userId, resultNote }) {
  if (!assignmentId || !userId) throw new Error('assignmentId and userId required');

  await poolConnect;
  const req = (await poolConnect).request();
  req.input('aid', sql.Int, assignmentId);
  req.input('uid', sql.Int, userId);

  const q = `
    SELECT a.id, a.beekeeper_id, a.status,
           t.id AS task_id, t.title, t.start_at, t.end_at
    FROM TaskAssignments a
    JOIN Tasks t ON t.id = a.task_id
    WHERE a.id = @aid;
  `;
  const rs = await req.query(q);
  const row = rs.recordset[0];
  if (!row) {
    const e = new Error('Assignment not found');
    e.statusCode = 404; throw e;
  }
  if (row.beekeeper_id !== userId) {
    const e = new Error('Forbidden');
    e.statusCode = 403; throw e;
  }
  if ((row.status || '').toUpperCase() === 'DONE') {
    const e = new Error('Assignment already DONE');
    e.statusCode = 400; throw e;
  }

  const now = new Date(); 
  const ref = row.end_at ? new Date(row.end_at) : new Date(row.start_at);
  const overdueDays = daysDiffUtc(now, ref);
  if (overdueDays > 3) {
    const e = new Error('Assignment is too old to mark as DONE (> 3 days overdue)');
    e.statusCode = 400; throw e;
  }

  // Update
  const upd = (await poolConnect).request();
  upd.input('aid', sql.Int, assignmentId);
  upd.input('note', sql.VarChar(1000), resultNote || null);
  const updQ = `
    UPDATE TaskAssignments
      SET status = 'DONE',
          done_at = SYSUTCDATETIME(),
          result_note = @note
    WHERE id = @aid;
  `;
  await upd.query(updQ);

  return { assignmentId, status: 'DONE' };
}

module.exports = {
  fetchTasks,
  fetchComments,
  fetchCompleted,
  getBeekeeperCalendar,
  fetchFutureTasks,
  assignExistingTask,
  createAndAssignTask,
  updateTask,
  deleteTask,
  getUserCalendar,
  markAssignmentDone
};