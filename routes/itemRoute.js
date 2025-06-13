const { Router } = require('express');
const router = Router();
const {
  createItem,
  getAllItems,
  getOneItem,
  updateItem,
  deleteItem,
  exportItems,
  importItems,
} = require('../controllers/itemController');

const { auth, restrictTo } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(auth);

router.get('/', restrictTo('super_admin', 'manager', 'waiter'), getAllItems);

router.use(restrictTo('super_admin', 'manager'));

router.post('/import', upload.single('file'), importItems);

router.get('/export', exportItems);

router.post('/', createItem);

router.get('/:id', getOneItem);

router.patch('/:id', updateItem);

router.delete('/:id', deleteItem);

module.exports = router;