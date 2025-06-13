const { Router } = require('express');
const router = Router();
const { auth, restrictTo } = require('../middlewares/authMiddleware');
const {
  register,
  activateAccount,
  login,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { getOneUser, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');
const { registerSchema, loginSchema } = require('../validation/userValidate');
const { validate } = require('../validation/errValidate');

router.post(
  '/register',
  auth,
  restrictTo('super_admin', 'manager'),
  validate(registerSchema),
  register
);
router.post('/login', validate(loginSchema), login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/activate-account/:token', activateAccount);

router.use(auth);

router.get('/me', getOneUser);

router.use(restrictTo('super_admin', 'manager'));

router.get('/', getAllUsers);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
