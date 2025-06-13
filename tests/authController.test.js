const authController = require('../controllers/authController');
const authService = require('../services/authService');
const Email = require('../utils/email');
const AppError = require('../utils/appError');

// Mock the dependencies
jest.mock('../services/authService');
jest.mock('../utils/email');
jest.mock('../utils/jwt');

// Mock catchAsync to return the function as-is for testing
jest.mock('../utils/catchAsync', () => {
  return (fn) => fn;
});

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request
    mockReq = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      },
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
      params: { token: 'valid-token' }
    };

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      send: jest.fn()
    };

    // Setup mock next function
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Mock the service response
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };
      const mockActivationToken = 'activation-token';

      authService.registerUser.mockResolvedValue({
        user: mockUser,
        activationToken: mockActivationToken
      });

      // Mock Email.send
      Email.prototype.send = jest.fn().mockResolvedValue();

      await authController.register(mockReq, mockRes, mockNext);

      // Assertions
      expect(authService.registerUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      const error = new AppError('Email already exists', 409);
      authService.registerUser.mockRejectedValue(error);

      await authController.register(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      authService.loginUser.mockResolvedValue(mockUser);

      await authController.login(mockReq, mockRes, mockNext);

      expect(authService.loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      const error = new AppError('Invalid credentials', 401);
      authService.loginUser.mockRejectedValue(error);

      await authController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('activateAccount', () => {
    it('should activate account successfully', async () => {
      await authController.activateAccount(mockReq, mockRes, mockNext);

      expect(authService.activateUserAccount).toHaveBeenCalledWith('valid-token');
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle activation errors', async () => {
      const error = new AppError('Invalid token', 400);
      authService.activateUserAccount.mockRejectedValue(error);

      await authController.activateAccount(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 