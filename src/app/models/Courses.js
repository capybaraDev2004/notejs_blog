const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    maxLength: 255,
    trim: true
  },
  description: { 
    type: String, 
    maxLength: 1000,
    trim: true
  },
  image: { 
    type: String, 
    maxLength: 255,
    default: '../../img/default-course.jpg'
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number, // Thời lượng khóa học (giờ)
    default: 0,
    min: 0
  },
  category: {
    type: String,
    enum: ['programming', 'design', 'business', 'marketing', 'other'],
    default: 'other'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructor: {
    type: String,
    maxLength: 255,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true, // Tự động cập nhật createdAt và updatedAt
  strict: false,    // Cho phép đọc/giữ các field không định nghĩa (ví dụ name_courses, teacher)
  collection: 'courses'
});

// Middleware để cập nhật updatedAt trước khi save
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', CourseSchema, 'courses');