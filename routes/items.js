const express = require('express');
const router = express.Router();
const { getAllItems } = require('../controllers/itemsController');

router.get('/', getAllItems);

module.exports = router;
