const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, } = require('../services/middleware')
const ctrl = require('../controllers/tasksController');
const commentsCtrl = require('../controllers/commentsController');

router.use(requireAuth, requireRole('user'));

router.get('/calendar', ctrl.getCalendarUser);
router.put('/assignments/:assignmentId/done', ctrl.markDoneCNT);
router.post('/comments', commentsCtrl.createCommentCNT);
router.get('/comments', commentsCtrl.getCommentsCNT);

module.exports = router;