const express = require('express');
const router = express.Router();
const controller = require('../controllers/counsellingRequestController');

router.post('/', controller.createRequest);
router.get('/', controller.getAllRequests);
router.get('/stats', controller.getRequestStats);

module.exports = router; 