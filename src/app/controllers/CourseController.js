const Course = require('../models/Courses.js');
const { normalizeCourse } = require('../utils/courseTransform');

class CourseController {
    // GET /courses - Hiển thị danh sách khóa học
    async index(req, res) {
        try {
            const { page = 1, limit = 10, search, category, level } = req.query;
            const skip = (page - 1) * limit;
            
            // Xây dựng query filter
            // Không ép buộc isActive để lấy được dữ liệu cũ chưa có field này
            let filter = {};
            
            if (search) {
                filter.name = { $regex: search, $options: 'i' };
            }
            
            if (category && category !== 'all') {
                filter.category = category;
            }
            
            if (level && level !== 'all') {
                filter.level = level;
            }
            
            // Thực hiện truy vấn với phân trang
            const rawCourses = await Course.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
            // Chuẩn hoá dữ liệu để phù hợp với view, hỗ trợ cả data schema cũ
            const courses = rawCourses.map(normalizeCourse);
            
            // Đếm tổng số khóa học
            const total = await Course.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);
            
            res.render('courses/index', {
                courses,
                currentPage: parseInt(page),
                totalPages,
                total,
                search: search || '',
                category: category || 'all',
                level: level || 'all',
                categories: ['programming', 'design', 'business', 'marketing', 'other'],
                levels: ['beginner', 'intermediate', 'advanced']
            });
        } catch (err) {
            console.error('❌ Lỗi hiển thị danh sách khóa học:', err);
            res.status(500).render('error', { 
                message: 'Lỗi truy vấn cơ sở dữ liệu',
                error: err.message 
            });
        }
    }

    // GET /courses/create - Hiển thị form tạo khóa học
    async create(req, res) {
        try {
            res.render('courses/create', {
                categories: ['programming', 'design', 'business', 'marketing', 'other'],
                levels: ['beginner', 'intermediate', 'advanced']
            });
        } catch (err) {
            console.error('❌ Lỗi hiển thị form tạo khóa học:', err);
            res.status(500).render('error', { 
                message: 'Lỗi hiển thị form',
                error: err.message 
            });
        }
    }

    // POST /courses - Lưu khóa học mới
    async store(req, res) {
        try {
            const { name, description, price, duration, category, level, instructor } = req.body;
            
            // Validation
            if (!name || !description) {
                return res.status(400).render('courses/create', {
                    error: 'Tên và mô tả khóa học là bắt buộc',
                    data: req.body,
                    categories: ['programming', 'design', 'business', 'marketing', 'other'],
                    levels: ['beginner', 'intermediate', 'advanced']
                });
            }
            
            // Tạo khóa học mới
            const course = new Course({
                name,
                description,
                price: parseFloat(price) || 0,
                duration: parseInt(duration) || 0,
                category: category || 'other',
                level: level || 'beginner',
                instructor: instructor || 'Chưa có'
            });
            
            await course.save();
            
            res.redirect('/courses');
        } catch (err) {
            console.error('❌ Lỗi tạo khóa học:', err);
            res.status(500).render('courses/create', {
                error: 'Lỗi tạo khóa học',
                data: req.body,
                categories: ['programming', 'design', 'business', 'marketing', 'other'],
                levels: ['beginner', 'intermediate', 'advanced']
            });
        }
    }

    // GET /courses/:id - Hiển thị chi tiết khóa học
    async show(req, res) {
        try {
            const courseDoc = await Course.findById(req.params.id).lean();
            
            if (!courseDoc) {
                return res.status(404).render('error', { 
                    message: 'Khóa học không tồn tại' 
                });
            }
            
            res.render('courses/show', { course: normalizeCourse(courseDoc) });
        } catch (err) {
            console.error('❌ Lỗi hiển thị chi tiết khóa học:', err);
            res.status(500).render('error', { 
                message: 'Lỗi truy vấn cơ sở dữ liệu',
                error: err.message 
            });
        }
    }

    // GET /courses/:id/edit - Hiển thị form chỉnh sửa
    async edit(req, res) {
        try {
            // Lấy khoá học và chuẩn hoá dữ liệu để map đúng vào form
            const courseDoc = await Course.findById(req.params.id).lean();
            
            if (!courseDoc) {
                return res.status(404).render('error', { 
                    message: 'Khóa học không tồn tại' 
                });
            }
            
            res.render('courses/edit', {
                course: normalizeCourse(courseDoc),
                categories: ['programming', 'design', 'business', 'marketing', 'other'],
                levels: ['beginner', 'intermediate', 'advanced']
            });
        } catch (err) {
            console.error('❌ Lỗi hiển thị form chỉnh sửa:', err);
            res.status(500).render('error', { 
                message: 'Lỗi truy vấn cơ sở dữ liệu',
                error: err.message 
            });
        }
    }

    // PUT /courses/:id - Cập nhật khóa học (cũng xử lý POST với _method=PUT)
    async update(req, res) {
        try {
            console.log('📝 Request method:', req.method);
            console.log('📝 Request body:', req.body);
            console.log('📝 Request params:', req.params);
            console.log('📝 Request query:', req.query);
            console.log(' Request headers:', req.headers);
            console.log('📝 Content-Type:', req.get('Content-Type'));
            console.log(' File upload:', req.file);
            
            // Kiểm tra req.body có tồn tại không
            if (!req.body || Object.keys(req.body).length === 0) {
                console.error('❌ req.body is empty or undefined');
                
                return res.status(400).render('courses/edit', {
                    error: 'Dữ liệu form không được gửi đúng cách. Vui lòng thử lại. (req.body: ' + JSON.stringify(req.body) + ')',
                    course: { _id: req.params.id },
                    categories: ['programming', 'design', 'business', 'marketing', 'other'],
                    levels: ['beginner', 'intermediate', 'advanced']
                });
            }
            
            // Xử lý cả schema cũ và mới với fallback an toàn
            const name = req.body.name || req.body.name_courses || '';
            const description = req.body.description || req.body.catalogue || '';
            const price = req.body.price || req.body.price_courses || 0;
            const duration = req.body.duration || req.body.total_time || 0;
            const category = req.body.category || 'other';
            const level = req.body.level || 'beginner';
            const instructor = req.body.instructor || req.body.teacher || 'Chưa có';
            const imageUrl = req.body.imageUrl || '';
            
            console.log('📝 Parsed data:', {
                name, description, price, duration, category, level, instructor, imageUrl
            });
            
            // Validation
            if (!name || !description) {
                return res.status(400).render('courses/edit', {
                    error: 'Tên và mô tả khóa học là bắt buộc',
                    course: { 
                        _id: req.params.id,
                        name: name,
                        description: description,
                        price: price,
                        duration: duration,
                        category: category,
                        level: level,
                        instructor: instructor
                    },
                    categories: ['programming', 'design', 'business', 'marketing', 'other'],
                    levels: ['beginner', 'intermediate', 'advanced']
                });
            }
            
            // Xử lý giá tiền - loại bỏ dấu phẩy và chuyển về số
            let processedPrice = 0;
            if (price) {
                if (typeof price === 'string') {
                    // Xử lý trường hợp "Miễn phí" => 0
                    if (price.toLowerCase().includes('miễn phí') || price.toLowerCase().includes('free')) {
                        processedPrice = 0;
                    } else {
                        processedPrice = parseInt(price.replace(/[^\d]/g, '')) || 0;
                    }
                } else {
                    processedPrice = parseInt(price) || 0;
                }
            }
            
            // Xử lý thời lượng - chuyển đổi từ format "27h32p" sang số giờ
            let processedDuration = 0;
            if (duration) {
                if (typeof duration === 'string') {
                    // Xử lý format "27h32p" hoặc "27h 32p"
                    const timeMatch = duration.match(/(\d+)h(?:\s*(\d+)p)?/i);
                    if (timeMatch) {
                        const hours = parseInt(timeMatch[1]) || 0;
                        const minutes = parseInt(timeMatch[2]) || 0;
                        processedDuration = hours + (minutes / 60);
                    } else {
                        processedDuration = parseFloat(duration) || 0;
                    }
                } else {
                    processedDuration = parseFloat(duration) || 0;
                }
            }
            
            // Xử lý hình ảnh
            let imageToUpdate = undefined;
            
            // Nếu có file upload
            if (req.file) {
                console.log('📝 File uploaded:', req.file);
                // Tạo URL cho file đã upload
                imageToUpdate = `/uploads/${req.file.filename}`;
            } 
            // Nếu có URL hình ảnh
            else if (imageUrl && imageUrl.trim() !== '') {
                imageToUpdate = imageUrl.trim();
            }
            
            const updateData = {
                // Cập nhật cả schema cũ và mới để đảm bảo tương thích
                name: name,
                name_courses: name, // Giữ lại schema cũ
                description: description,
                catalogue: description, // Giữ lại schema cũ
                price: processedPrice,
                price_courses: processedPrice, // Giữ lại schema cũ
                duration: processedDuration,
                total_time: duration, // Giữ lại schema cũ
                category: category,
                level: level,
                instructor: instructor,
                teacher: instructor, // Giữ lại schema cũ
                updatedAt: Date.now()
            };
            
            // Chỉ cập nhật hình ảnh nếu có thay đổi
            if (imageToUpdate !== undefined) {
                updateData.image = imageToUpdate;
            }
            
            console.log('📝 Update data:', updateData);
            
            const course = await Course.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!course) {
                return res.status(404).render('error', { 
                    message: 'Khóa học không tồn tại' 
                });
            }
            
            console.log('✅ Cập nhật khóa học thành công:', {
                id: course._id,
                name: course.name || course.name_courses,
                price: course.price || course.price_courses,
                duration: course.duration || course.total_time
            });
            
            // Tạo object course để hiển thị trong form với dữ liệu đã cập nhật
            const displayCourse = {
                _id: course._id,
                name: course.name || course.name_courses || name,
                description: course.description || course.catalogue || description,
                price: course.price || course.price_courses || processedPrice,
                duration: course.duration || course.total_time || processedDuration,
                category: course.category || category,
                level: course.level || level,
                instructor: course.instructor || course.teacher || instructor,
                image: course.image || (imageToUpdate ? imageToUpdate : course.image)
            };
            
            // Thay vì redirect, render lại trang edit với thông báo thành công và dữ liệu đã cập nhật
            res.render('courses/edit', {
                success: 'Cập nhật khóa học thành công! 🎉',
                course: displayCourse, // Sử dụng dữ liệu đã cập nhật
                categories: ['programming', 'design', 'business', 'marketing', 'other'],
                levels: ['beginner', 'intermediate', 'advanced']
            });
            
        } catch (err) {
            console.error('❌ Lỗi cập nhật khóa học:', err);
            res.status(500).render('courses/edit', {
                error: 'Lỗi cập nhật khóa học: ' + err.message,
                course: { 
                    _id: req.params.id,
                    ...(req.body || {})
                },
                categories: ['programming', 'design', 'business', 'marketing', 'other'],
                levels: ['beginner', 'intermediate', 'advanced']
            });
        }
    }

    // DELETE /courses/:id - Xóa khóa học
    async destroy(req, res) {
        try {
            const course = await Course.findByIdAndDelete(req.params.id);
            
            if (!course) {
                return res.status(404).json({ 
                    success: false,
                    message: 'Khóa học không tồn tại' 
                });
            }
            
            res.json({ 
                success: true,
                message: 'Xóa khóa học thành công!' 
            });
        } catch (err) {
            console.error('❌ Lỗi xóa khóa học:', err);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi xóa khóa học',
                error: err.message 
            });
        }
    }

    // GET /courses/search - Tìm kiếm khóa học (API)
    async search(req, res) {
        try {
            const { query, category, level, page = 1, limit = 10 } = req.query;
            const skip = (page - 1) * limit;
            
            let filter = { isActive: true };
            
            if (query) {
                filter.name = { $regex: query, $options: 'i' };
            }
            
            if (category && category !== 'all') {
                filter.category = category;
            }
            
            if (level && level !== 'all') {
                filter.level = level;
            }
            
            const raw = await Course.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();
            const courses = raw.map(normalizeCourse);
            
            const total = await Course.countDocuments(filter);
            
            res.json({
                success: true,
                data: courses,
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit)
            });
        } catch (err) {
            console.error('❌ Lỗi tìm kiếm khóa học:', err);
            res.status(500).json({ 
                success: false,
                error: 'Lỗi tìm kiếm',
                message: err.message 
            });
        }
    }
}

module.exports = new CourseController();
