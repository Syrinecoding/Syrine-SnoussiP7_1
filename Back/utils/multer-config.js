const multer = require('multer');
//const app = require('../app');

const MIME_TYPES = {
    'image/jeg': 'jpg',
    'image/jpeg' : 'jpg',
    'image/png': 'png',
    'image/gif': 'gif'
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('-');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
        console.log(req.file);
    },
});


module.exports = multer({storage: storage}).single("image");