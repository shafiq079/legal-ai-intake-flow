const express = require('express');
const router = express.Router();
const { getAllForms, getFormById } = require('../controllers/formController');

router.get('/', getAllForms);
router.get('/:id', getFormById);

module.exports = router;
