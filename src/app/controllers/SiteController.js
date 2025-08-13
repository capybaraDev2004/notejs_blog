const Course = require('../models/Courses.js');
const { normalizeCourse } = require('../utils/courseTransform');

class SiteController {
    // GET /search
    async search(req, res) {
        try {
            const { query } = req.query;
            let courses;
            
            if (query) {
                // Tìm kiếm theo tên khóa học
                const raw = await Course.find({ 
                    name: { $regex: query, $options: 'i' } 
                }).lean();
                courses = raw.map(normalizeCourse);
            } else {
                // Lấy tất cả khóa học
                const raw = await Course.find({}).lean();
                courses = raw.map(normalizeCourse);
            }
            
            // Trả về dữ liệu JSON
            res.json({
                success: true,
                data: courses,
                count: courses.length,
                query: query || 'all'
            });
        } catch (err) {
            console.error('❌ Lỗi truy vấn search:', err);
            res.status(500).json({ 
                success: false,
                error: 'Lỗi truy vấn cơ sở dữ liệu',
                message: err.message 
            });
        }
    }

    // POST /search (test bằng Postman)
    async searchPost(req, res) {
        try {
            const { text } = req.body;
            const courses = await Course.find({ 
                name: { $regex: text, $options: 'i' } 
            });
            
            res.json({
                success: true,
                data: courses,
                count: courses.length,
                query: text
            });
        } catch (err) {
            console.error('❌ Lỗi searchPost:', err);
            res.status(500).json({ 
                success: false,
                error: 'Lỗi tìm kiếm',
                message: err.message 
            });
        }
    }

    // GET /
    async index(req, res) {
        try {
            const raw = await Course.find({}).sort({ createdAt: -1 }).limit(8).lean();
            const courses = raw.map(normalizeCourse);
            
            // Tính toán thống kê
            const totalCourses = await Course.countDocuments({});
            const uniqueInstructors = await Course.distinct('instructor');
            const uniqueCategories = await Course.distinct('category');
            
            res.render('home', { 
                courses,
                totalCourses,
                uniqueInstructors: uniqueInstructors.filter(instructor => instructor && instructor !== 'Chưa có'),
                uniqueCategories: uniqueCategories.filter(category => category)
            });
        } catch (err) {
            console.error('❌ Lỗi index:', err);
            res.status(500).render('error', { 
                message: 'Lỗi truy vấn cơ sở dữ liệu',
                error: err.message 
            });
        }
    }
}

module.exports = new SiteController();