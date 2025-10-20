const { 
  fetchTasks, fetchComments, fetchCompleted, getBeekeeperCalendar,
  fetchFutureTasks, assignExistingTask, createAndAssignTask, updateTask,
  deleteTask, getUserCalendar, markAssignmentDone
 } = require('../services/tasksService');

function n(v) { const x = parseInt(v, 10); return Number.isFinite(x) ? x : undefined; }
function d(v) { return v ? String(v) : undefined; }

async function getTasks(req, res) {
  try {
    const data = await fetchTasks({
      from: req.query.from,
      to: req.query.to,
      status: req.query.status,
      page: n(req.query.page),
      pageSize: n(req.query.pageSize)
    });
    res.json({ total: data.total, items: data.items });
  } catch (e) {
    console.error('admin getTasks error:', e);
    res.status(500).json({ message: 'Failed to load tasks.' });
  }
}

async function getComments(req, res) {
  try {
    const data = await fetchComments({
      from: req.query.from,
      to: req.query.to,
      beekeeperId: n(req.query.beekeeperId),
      taskId: n(req.query.taskId),
      page: n(req.query.page),
      pageSize: n(req.query.pageSize)
    });
    res.json({ total: data.total, items: data.items });
  } catch (e) {
    console.error('admin getComments error:', e);
    res.status(500).json({ message: 'Failed to load comments.' });
  }
}

async function getCompleted(req, res) {
  try {
    const data = await fetchCompleted({
      from: req.query.from,
      to: req.query.to,
      beekeeperId: n(req.query.beekeeperId),
      taskId: n(req.query.taskId),
      page: n(req.query.page),
      pageSize: n(req.query.pageSize)
    });
    res.json({ total: data.total, items: data.items });
  } catch (e) {
    console.error('admin getCompleted error:', e);
    res.status(500).json({ message: 'Failed to load completed assignments.' });
  }
}

async function beekeeperCalendarCNT(req, res) {
  try {
    const beekeeperId = n(req.query.beekeeperId);
    const from = d(req.query.from);
    const to = d(req.query.to);

    if (!beekeeperId || !from || !to) {
      return res.status(400).json({ message: 'beekeeperId, from and to are required.' });
    }

    const items = await getBeekeeperCalendar({ beekeeperId, from, to });
    return res.json({ items });
  } catch (e) {
    console.error('beekeeperCalendar error:', e);
    return res.status(500).json({ message: 'Failed to load calendar.' });
  }
}

async function getFutureTasksCNT(req, res) {
  try {
    const items = await fetchFutureTasks();
    return res.json({ items });
  } catch (e) {
    console.error('getFutureTasks error:', e);
    return res.status(500).json({ message: 'Failed to load future tasks.' });
  }
}

async function assignExistingTaskCNT(req, res) {
  try {
    const beekeeperId = n(req.body.beekeeperId);
    const taskId = n(req.body.taskId);
    if (!beekeeperId || !taskId) {
      return res.status(400).json({ message: 'beekeeperId and taskId are required.' });
    }
    const out = await assignExistingTask({ beekeeperId, taskId });
    return res.json({ success: true, ...out });
  } catch (e) {
    console.error('assignExistingTask error:', e);
    return res.status(400).json({ message: e.message || 'Failed to assign task.' });
  }
}

async function createAndAssignTaskCNT(req, res) {
  try {
    const { beekeeperId, title, description, start_at, end_at } = req.body || {};
    const bk = n(beekeeperId);
    if (!bk || !title || !start_at || !end_at) {
      return res.status(400).json({ message: 'beekeeperId, title, start_at and end_at are required.' });
    }
    const out = await createAndAssignTask({ beekeeperId: bk, title, description, start_at, end_at });
    return res.json({ success: true, ...out });
  } catch (e) {
    console.error('createAndAssignTask error:', e);
    return res.status(400).json({ message: e.message || 'Failed to create/assign task.' });
  }
}

async function updateTaskCNT(req, res) {
  try {
    const taskId = n(req.params.id);
    const { title, description, start_at, end_at } = req.body;

    if (!taskId || !title || !description || !start_at || !end_at) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const result = await updateTask({ taskId, title, description, start_at, end_at });
    res.json(result);
  } catch (e) {
    console.error('updateTask error:', e);
    res.status(400).json({ message: e.message || 'Failed to update task.' });
  }
}

async function deleteTaskCNT(req, res) {
  try {
    const taskId = n(req.params.id);
    if (!taskId) return res.status(400).json({ message: 'Task ID is required.' });

    const result = await deleteTask(taskId);
    res.json(result);
  } catch (e) {
    console.error('deleteTask error:', e);
    res.status(400).json({ message: e.message || 'Failed to delete task.' });
  }
}

async function getCalendarUser(req, res) {
  try {
    const beekeeperId = req.user.id; 
    const { from, to } = req.query;

    const items = await getUserCalendar({
      beekeeperId,
      from,
      to
    });

    res.json({ items });
  } catch (err) {
    console.error('Error in getCalendarUser:', err);
    res.status(500).json({ message: 'Failed to load calendar.' });
  }
}

async function markDoneCNT(req, res) {
  try {
    const assignmentId = n(req.params.assignmentId);
    const userId = req.user?.id;
    const resultNote = (req.body?.result_note || '').toString().slice(0, 1000) || null;

    if (!assignmentId) return res.status(400).json({ message: 'assignmentId required' });

    const out = await markAssignmentDone({ assignmentId, userId, resultNote });
    return res.json(out);
  } catch (e) {
    const code = e.statusCode || 500;
    console.error('markDone error:', e);
    return res.status(code).json({ message: e.message || 'Failed to mark as done.' });
  }
}

module.exports = { 
  getTasks, 
  getComments, 
  getCompleted, 
  beekeeperCalendarCNT,
  getFutureTasksCNT,
  assignExistingTaskCNT,
  createAndAssignTaskCNT,
  updateTaskCNT,
  deleteTaskCNT,
  getCalendarUser,
  markDoneCNT
}