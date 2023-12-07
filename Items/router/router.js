const express = require('express');
const router = express.Router();
const controller = require('../controller/controller')

router.post('/create', controller.create)
router.get('/all', controller.all)
module.exports = router;