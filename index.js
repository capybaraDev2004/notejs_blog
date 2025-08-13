const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const multer = require('multer');
const route = require('./src/routes');
const db = require('./src/config/db');

// Kết nối đến MongoDB với xử lý lỗi
db.connect().catch(err => {
  console.error('❌ Không thể kết nối đến MongoDB:', err);
  process.exit(1);
});

const app = express();
const port = 3000;

// Cấu hình multer cho file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'src', 'public', 'uploads'))
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

// Middleware
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); // Hỗ trợ PUT, DELETE

app.use(morgan('combined'));

// Handlebars configuration với helpers
app.engine('.hbs', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname,'src', 'resources', 'views', 'layouts'),
  extname: '.hbs',
  helpers: {
    // Helper để so sánh
    eq: function(a, b) {
      return a === b;
    },
    // Helper để format date
    formatDate: function(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('vi-VN');
    },
    // Helper để lấy một phần của array
    take: function(array, count) {
      return array.slice(0, count);
    },
    // Helper để tạo range
    range: function(start, end) {
      const result = [];
      for (let i = start; i <= end; i++) {
        result.push(i);
      }
      return result;
    },
    // Helper để so sánh lớn hơn
    gt: function(a, b) {
      return a > b;
    },
    // Helper để so sánh nhỏ hơn
    lt: function(a, b) {
      return a < b;
    },
    // Helper để cộng
    add: function(a, b) {
      return a + b;
    },
    // Helper để trừ
    subtract: function(a, b) {
      return a - b;
    }
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'src', 'resources', 'views'));

// Middleware để truyền thông tin vào views
app.use((req, res, next) => {
  res.locals.currentPage = req.path.split('/')[1] || 'home';
  next();
});

// Sử dụng router chính
route(app);

// Thêm middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err);
  res.status(500).render('error', { 
    message: 'Lỗi server nội bộ',
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Trang không tồn tại',
    error: 'Không tìm thấy trang bạn yêu cầu'
  });
});

app.listen(port, () => {
  console.log(`✅ Server chạy tại http://localhost:${port}`);
  console.log(`📚 Hệ thống quản lý khóa học đã sẵn sàng!`);
});