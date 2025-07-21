const express = require('express');
const router = express.Router();
const controller = require('../controllers/counsellingRequestController');

router.post('/', controller.createRequest);
router.get('/', controller.getAllRequests);

module.exports = router; 