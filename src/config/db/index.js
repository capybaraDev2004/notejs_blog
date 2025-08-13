const mongoose = require('mongoose');

async function connect() {
  try {
    // Cấu hình kết nối MongoDB với options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout 5 giây
      socketTimeoutMS: 45000, // Socket timeout 45 giây
    };

    await mongoose.connect('mongodb://localhost:27017/f8_education_dev', options);
    console.log('✅ Database connected successfully');
    
    // Xử lý sự kiện khi kết nối bị mất
    mongoose.connection.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Database disconnected');
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error; // Ném lỗi để xử lý ở nơi khác
  }
}

module.exports = { connect };
