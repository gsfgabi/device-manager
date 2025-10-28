import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login successfully', () => {
    const loginRequest: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse: AuthResponse = {
      message: 'Login realizado com sucesso',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      token: 'mock-token'
    };

    service.login(loginRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.getToken()).toBe('mock-token');
      expect(service.getCurrentUser()).toEqual(mockResponse.user);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginRequest);
    req.flush(mockResponse);
  });

  it('should register successfully', () => {
    const registerRequest: RegisterRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    };

    const mockResponse: AuthResponse = {
      message: 'Usuário criado com sucesso',
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z'
      },
      token: 'mock-token'
    };

    service.register(registerRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.getToken()).toBe('mock-token');
      expect(service.getCurrentUser()).toEqual(mockResponse.user);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerRequest);
    req.flush(mockResponse);
  });

  it('should logout successfully', () => {
    // Simular usuário logado
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));

    service.logout().subscribe(response => {
      expect(response).toEqual({ message: 'Logout realizado com sucesso' });
      expect(service.getToken()).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Logout realizado com sucesso' });
  });

  it('should get current user', () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    };

    service.me().subscribe(response => {
      expect(response.user).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({ user: mockUser });
  });

  it('should check if user is authenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();

    localStorage.setItem('token', 'mock-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should load user from storage on initialization', () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    };

    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Criar nova instância do serviço para testar a inicialização
    const newService = new AuthService(TestBed.inject(HttpClientTestingModule));
    
    expect(newService.getToken()).toBe('mock-token');
    expect(newService.getCurrentUser()).toEqual(mockUser);
  });
});