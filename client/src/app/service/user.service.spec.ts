import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService, User, CreateUserPayload } from './user.service';
import { ApiConfigService } from './api-config.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let mockApiConfig: any;

  const mockUser: User = {
    id: 'test-id',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    address: '123 Test St',
    phone: '555-0123',
    coin: 100,
  };

  beforeEach(() => {
    mockApiConfig = {
      domain: 'http://localhost:3000',
      headers: {},
    };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiConfigService, useValue: mockApiConfig },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const payload: CreateUserPayload = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        address: '456 New St',
        phone: '555-0456',
      };

      const result = service.createUser(payload);

      const req = httpMock.expectOne('http://localhost:3000/api/user');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'User created', data: mockUser });

      const user = await result;
      expect(user).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      const result = service.getAllUsers();

      const req = httpMock.expectOne('http://localhost:3000/api/user');
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'Users retrieved', data: users });

      const data = await result;
      expect(data).toEqual(users);
    });

    it('should return empty array if no data', async () => {
      const result = service.getAllUsers();

      const req = httpMock.expectOne('http://localhost:3000/api/user');
      req.flush({ message: 'Users retrieved', data: null });

      const data = await result;
      expect(data).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const result = service.getUserById('test-id');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/user/test-id',
      );
      expect(req.request.method).toBe('GET');
      req.flush({ message: 'User retrieved', data: mockUser });

      const user = await result;
      expect(user).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updatedUser: User = {
        ...mockUser,
        email: 'updated@example.com',
      };

      const result = service.updateUser('test-id', {
        email: 'updated@example.com',
        password: mockUser.password,
        name: mockUser.name,
        address: mockUser.address,
        phone: mockUser.phone,
        coin: mockUser.coin,
      });

      const req = httpMock.expectOne('http://localhost:3000/api/user/test-id');
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'User updated', data: updatedUser });

      const user = await result;
      expect(user).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = service.deleteUser('test-id');

      const req = httpMock.expectOne('http://localhost:3000/api/user/test-id');
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'User deleted' });

      const response = await result;
      expect(response.message).toBe('User deleted');
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const result = service.login('test@example.com', 'password123');

      const req = httpMock.expectOne(
        'http://localhost:3000/api/user/login',
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        identifier: 'test@example.com',
        password: 'password123',
      });
      req.flush({ message: 'User logged in', data: mockUser });

      const response = await result;
      expect(response.data).toEqual(mockUser);
    });
  });

  describe('localStorage operations', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save user id to localStorage', () => {
      service.saveUserId('test-id');
      expect(localStorage.getItem('userId')).toBe('test-id');
    });

    it('should get user id from localStorage', () => {
      localStorage.setItem('userId', 'test-id');
      expect(service.getUserId()).toBe('test-id');
    });

    it('should return null if user id not in localStorage', () => {
      expect(service.getUserId()).toBeNull();
    });

    it('should clear user id from localStorage', () => {
      localStorage.setItem('userId', 'test-id');
      service.clearUserId();
      expect(localStorage.getItem('userId')).toBeNull();
    });

    it('should check if user is logged in', () => {
      expect(service.isLoggedIn()).toBe(false);
      localStorage.setItem('userId', 'test-id');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should save coin balance to localStorage', () => {
      service.saveCoin(100);
      expect(localStorage.getItem('userCoin')).toBe('100');
    });

    it('should get coin balance from localStorage', () => {
      localStorage.setItem('userCoin', '100');
      expect(service.getCoin()).toBe(100);
    });

    it('should return null if coin not in localStorage', () => {
      expect(service.getCoin()).toBeNull();
    });

    it('should clear coin balance from localStorage', () => {
      localStorage.setItem('userCoin', '100');
      service.clearCoin();
      expect(localStorage.getItem('userCoin')).toBeNull();
    });
  });
});
