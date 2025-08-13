const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const courseController = require('../app/controllers/CourseController');

// Cấu hình multer cho courses
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: function (req, file, cb) {
    // Chỉ cho phép upload image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file hình ảnh!'), false);
    }
  }
});

// Hiển thị danh sách khóa học
router.get('/', courseController.index);

// Hiển thị form tạo khóa học
router.get('/create', courseController.create);

// Lưu khóa học mới
router.post('/', upload.single('image'), courseController.store);

// Tìm kiếm khóa học (API) - phải đặt trước /:id
router.get('/search', courseController.search);

// Hiển thị chi tiết khóa học
router.get('/:id', courseController.show);

// Hiển thị form chỉnh sửa
router.get('/:id/edit', courseController.edit);

// Cập nhật khóa học - sử dụng multer để xử lý multipart form
router.post('/:id/update', upload.single('image'), courseController.update);

// Xóa khóa học
router.delete('/:id', courseController.destroy);

module.exports = router;
