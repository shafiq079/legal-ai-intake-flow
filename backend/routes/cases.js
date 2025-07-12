const express = require('express');
const router = express.Router();
const { getAllCases, getCaseById, createCase, updateCase, deleteCase } = require('../controllers/caseController');

router.get('/', getAllCases);
router.get('/:id', getCaseById);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;
