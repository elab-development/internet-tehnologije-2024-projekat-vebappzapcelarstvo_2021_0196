const { createComment, fetchComments } = require('../services/commentService');

function n(v) { const x = parseInt(v, 10); return Number.isFinite(x) ? x : undefined; }

async function createCommentCNT(req, res) {
  try {
    const authorId = req.user?.id;
    const taskId = n(req.body?.task_id);
    const assignmentId = req.body?.assignment_id ? n(req.body.assignment_id) : undefined;
    const content = (req.body?.content || '').toString();
    const out = await createComment({ authorId, taskId, content, assignmentId });
    return res.json(out);
  } catch (e) {
    const code = e.statusCode || 500;
    console.error('createComment error:', e);
    return res.status(code).json({ message: e.message || 'Failed to create comment.' });
  }
}

async function getCommentsCNT(req, res) {
  try {
    const taskId = req.query.taskId ? n(req.query.taskId) : undefined;
    const assignmentId = req.query.assignmentId ? n(req.query.assignmentId) : undefined;
    const page = req.query.page ? n(req.query.page) : 1;
    const pageSize = req.query.pageSize ? n(req.query.pageSize) : 20;

    const out = await fetchComments({ taskId, assignmentId, page, pageSize });
    return res.json(out);
  } catch (e) {
    const code = e.statusCode || 500;
    console.error('getComments error:', e);
    return res.status(code).json({ message: e.message || 'Failed to load comments.' });
  }
}

module.exports = {
  createCommentCNT,
  getCommentsCNT
};

