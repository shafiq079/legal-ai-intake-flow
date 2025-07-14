const express = require('express');
const router = express.Router();
const {
  getAllCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');
const { protect: authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.route('/').get(getAllCases).post(createCase);
router.route('/:id').get(getCaseById).put(updateCase).delete(deleteCase);

module.exports = router;