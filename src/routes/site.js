const express = require('express');
const router = express.Router();
const siteController = require('../app/controllers/SiteController');

// GET /search => trả về dữ liệu JSON từ DB
router.get('/search', siteController.search);

// POST /search => trả về dữ liệu JSON (test bằng Postman)
router.post('/search', siteController.searchPost);

// GET / => render trang home
router.get('/', siteController.index);

module.exports = router;