// Util chuẩn hoá dữ liệu khoá học lấy từ MongoDB về dạng phù hợp view
// Ghi chú: Dữ liệu hiện có thể ở 2 kiểu schema khác nhau:
// - Kiểu mới: name, description, price(number), duration(number giờ), instructor, category, level
// - Kiểu cũ: name_courses, price("Miễn phí"), total_time("3h12p"), teacher

/**
 * Chuyển chuỗi total_time dạng "3h12p" => số giờ thập phân (ví dụ 3.2)
 * Trả về số với 1 chữ số thập phân, nếu không parse được thì trả 0
 */
function convertTotalTimeToHours(totalTimeString) {
  if (!totalTimeString || typeof totalTimeString !== 'string') return 0;
  // Hỗ trợ các dạng: "3h12p", "3h", "3h 12p"
  const match = totalTimeString.match(/(\d+)h(?:\s*(\d+)p)?/i);
  if (!match) return 0;
  const hours = parseInt(match[1], 10) || 0;
  const minutes = parseInt(match[2], 10) || 0;
  const total = hours + minutes / 60;
  return Math.round(total * 10) / 10; // 1 chữ số thập phân
}

/**
 * Chuẩn hoá 1 document khoá học về dạng dùng cho view
 * Luôn đảm bảo đầy đủ các field mà view cần
 */
function normalizeCourse(doc) {
  const name = doc.name || doc.name_courses || 'Khóa học';
  const image = doc.image || '/img/default-course.jpg';
  const description = doc.description || '';

  // Giá: nếu là số giữ nguyên; nếu là chuỗi "Miễn phí" => 0; nếu có số trong chuỗi => parse số
  let price = 0;
  if (typeof doc.price === 'number') {
    price = doc.price;
  } else if (typeof doc.price === 'string') {
    const digits = doc.price.replace(/\D/g, '');
    price = digits ? parseInt(digits, 10) : 0;
  }

  // Thời lượng: nếu là số (giờ) dùng trực tiếp; nếu có total_time => quy đổi
  let duration = 0;
  if (typeof doc.duration === 'number') {
    duration = doc.duration;
  } else if (doc.total_time) {
    duration = convertTotalTimeToHours(String(doc.total_time));
  }

  const instructor = doc.instructor || doc.teacher || 'Chưa có';
  const category = doc.category || 'other';
  const level = doc.level || 'beginner';
  const createdAt = doc.createdAt || (doc._id?.getTimestamp ? doc._id.getTimestamp() : new Date());

  return {
    _id: doc._id,
    name,
    image,
    description,
    price,
    duration,
    instructor,
    category,
    level,
    createdAt,
  };
}

module.exports = {
  normalizeCourse,
  convertTotalTimeToHours,
};


