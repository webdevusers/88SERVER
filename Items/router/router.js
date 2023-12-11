const express = require('express');
const router = express.Router();
const controller = require('../controller/controller')

router.post('/create', controller.create)
router.get('/all', controller.all)
router.get('/getSubcategory', controller.getSubcategory)
router.post('/add', controller.productCreate)
router.post('/getProduct', controller.getProduct)
router.get('/newProducts', controller.getNewProducts)
router.post('/getPopularProducts', controller.getPopularProducts)
router.get('/search', controller.search)
module.exports = router;