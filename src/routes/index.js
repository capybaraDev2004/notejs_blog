const newsRouter = require('./news');
const siteController = require('../app/controllers/SiteController');
const courseRouter = require('./courses');

function route(app) {
    // Route cho news
    app.use('/news', newsRouter);
    
    // Route cho courses
    app.use('/courses', courseRouter);
    
    // Route cho trang chủ - sử dụng SiteController
    app.get('/', siteController.index);
    
    // Route cho search - trả về JSON
    app.get('/search', siteController.search);
    
    // Route cho news detail
    app.get('/news/:slug', (req, res) => {
        res.send('News detail');
    });
}

module.exports = route;