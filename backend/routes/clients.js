const express = require('express');
const router = express.Router();
const { getAllClients, getClientById, createClient, updateClient, deleteClient, submitIntakeForm, getClientList } = require('../controllers/clientController');

router.get('/', getAllClients);
router.get('/list', getClientList);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.post('/intake/submit', submitIntakeForm);

module.exports = router;
