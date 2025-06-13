const userService = require('../services/userService');
const AppError = require('../utils/appError');

// Mock the dependencies
jest.mock('../services/userService');

// Mock catchAsync to return the function as-is for testing
jest.mock('../utils/catchAsync', () => {
  return (fn) => fn;
});

const userController = require('../controllers/userController');

describe('User Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup mock request
    mockReq = {
      user: { id: '123' },
      params: { id: '123' },
      query: {},
      body: {
        role: 'admin',
        email: 'admin@example.com'
      }
    };

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Setup mock next function
    mockNext = jest.fn();
  });

  describe('getOneUser', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getOneUser(mockReq, mockRes, mockNext);

      expect(userService.getUserById).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle user not found error', async () => {
      const error = new AppError('User not found', 404);
      userService.getUserById.mockRejectedValue(error);

      try {
        await userController.getOneUser(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('User not found');
        expect(err.statusCode).toBe(404);
      }

      expect(userService.getUserById).toHaveBeenCalledWith('123');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        { _id: '123', name: 'User 1', role: 'user' },
        { _id: '456', name: 'User 2', role: 'admin' }
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalledWith(undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { users: mockUsers }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should filter users by role', async () => {
      mockReq.query.role = 'admin';
      const mockUsers = [{ _id: '456', name: 'User 2', role: 'admin' }];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(mockReq, mockRes, mockNext);

      expect(userService.getAllUsers).toHaveBeenCalledWith('admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: { users: mockUsers }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle no users found error', async () => {
      const error = new AppError('No users found', 404);
      userService.getAllUsers.mockRejectedValue(error);

      try {
        await userController.getAllUsers(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('No users found');
        expect(err.statusCode).toBe(404);
      }

      expect(userService.getAllUsers).toHaveBeenCalledWith(undefined);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        _id: '123',
        name: 'Test User',
        email: 'admin@example.com',
        role: 'admin'
      };

      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(mockReq, mockRes, mockNext);

      expect(userService.updateUser).toHaveBeenCalledWith('123', {
        role: 'admin',
        email: 'admin@example.com'
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUpdatedUser }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      const error = new AppError('No user found', 404);
      userService.updateUser.mockRejectedValue(error);

      try {
        await userController.updateUser(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('No user found');
        expect(err.statusCode).toBe(404);
      }

      expect(userService.updateUser).toHaveBeenCalledWith('123', {
        role: 'admin',
        email: 'admin@example.com'
      });
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockDeletedUser = { _id: '123', name: 'Test User' };
      userService.deleteUser.mockResolvedValue(mockDeletedUser);

      await userController.deleteUser(mockReq, mockRes, mockNext);

      expect(userService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: null
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const error = new AppError('No user found', 404);
      userService.deleteUser.mockRejectedValue(error);

      try {
        await userController.deleteUser(mockReq, mockRes, mockNext);
      } catch (err) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('No user found');
        expect(err.statusCode).toBe(404);
      }

      expect(userService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});