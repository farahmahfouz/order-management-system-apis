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
  getDiscountItems,
  getBestSeller,
} = require('../controllers/itemController');

const { auth, restrictTo } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { uploadImages, handleImages } = require('../middlewares/multer');
const upload = multer({ dest: 'uploads/' });

router.use(auth);

router.get('/best-sellers', getBestSeller);

router.get('/', restrictTo('super_admin', 'manager', 'waiter'), getAllItems);

router.get('/discounted', getDiscountItems);

router.use(restrictTo('super_admin', 'manager'));

router.post('/import', upload.single('file'), importItems);

router.get('/export', exportItems);

router.post(
  '/',
  uploadImages([{ name: 'image', count: 1 }]),
  handleImages('image'),
  createItem
);

router.get('/:id', getOneItem);

router.patch(
  '/:id',
  uploadImages([{ name: 'image', count: 1 }]),
  handleImages('image'),
  updateItem
);

router.delete('/:id', deleteItem);

module.exports = router;
