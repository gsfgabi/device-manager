import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DeviceFormComponent } from './device-form';
import { DeviceService } from '../../services/device';
import { AuthService } from '../../services/auth';
import { DeviceRequest, Device } from '../../models/device';
import { User } from '../../models/user';
import { of, throwError } from 'rxjs';

describe('DeviceFormComponent', () => {
  let component: DeviceFormComponent;
  let fixture: ComponentFixture<DeviceFormComponent>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  };

  const mockDevice: Device = {
    id: 1,
    name: 'iPhone 13',
    location: 'Escritório',
    purchase_date: '2023-01-15',
    in_use: false,
    user_id: 1,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', [
      'getDevice', 'createDevice', 'updateDevice'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser', 'logout'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({})
    });

    await TestBed.configureTestingModule({
      imports: [
        DeviceFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceFormComponent);
    component = fixture.componentInstance;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    authService.getCurrentUser.and.returnValue(mockUser);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.deviceForm.get('name')?.value).toBe('');
    expect(component.deviceForm.get('location')?.value).toBe('');
    expect(component.deviceForm.get('purchase_date')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const nameControl = component.deviceForm.get('name');
    const locationControl = component.deviceForm.get('location');
    const purchaseDateControl = component.deviceForm.get('purchase_date');

    expect(nameControl?.hasError('required')).toBeTruthy();
    expect(locationControl?.hasError('required')).toBeTruthy();
    expect(purchaseDateControl?.hasError('required')).toBeTruthy();
  });

  it('should validate max length', () => {
    const nameControl = component.deviceForm.get('name');
    const locationControl = component.deviceForm.get('location');

    nameControl?.setValue('a'.repeat(256));
    locationControl?.setValue('a'.repeat(256));

    expect(nameControl?.hasError('maxlength')).toBeTruthy();
    expect(locationControl?.hasError('maxlength')).toBeTruthy();
  });

  it('should initialize in create mode', () => {
    component.ngOnInit();
    expect(component.isEditMode).toBeFalse();
    expect(component.deviceId).toBeNull();
  });

  it('should initialize in edit mode when route has id', () => {
    activatedRoute.params = of({ id: '1' });
    deviceService.getDevice.and.returnValue(of(mockDevice));

    component.ngOnInit();

    expect(component.isEditMode).toBeTrue();
    expect(component.deviceId).toBe(1);
    expect(deviceService.getDevice).toHaveBeenCalledWith(1);
    expect(component.deviceForm.value).toEqual({
      name: mockDevice.name,
      location: mockDevice.location,
      purchase_date: mockDevice.purchase_date
    });
  });

  it('should handle device loading error in edit mode', () => {
    activatedRoute.params = of({ id: '1' });
    deviceService.getDevice.and.returnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Erro ao carregar dispositivo',
      'Fechar',
      jasmine.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/devices']);
  });

  it('should create device successfully', () => {
    const deviceRequest: DeviceRequest = {
      name: 'iPhone 14',
      location: 'Escritório Central',
      purchase_date: '2023-01-15'
    };

    deviceService.createDevice.and.returnValue(of(mockDevice));

    component.deviceForm.patchValue(deviceRequest);
    component.onSubmit();

    expect(deviceService.createDevice).toHaveBeenCalledWith(deviceRequest);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Dispositivo criado com sucesso!',
      'Fechar',
      jasmine.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/devices']);
  });

  it('should update device successfully', () => {
    component.isEditMode = true;
    component.deviceId = 1;

    const updateData: DeviceRequest = {
      name: 'iPhone 14 Pro',
      location: 'Sala de Reuniões',
      purchase_date: '2023-01-15'
    };

    deviceService.updateDevice.and.returnValue(of(mockDevice));

    component.deviceForm.patchValue(updateData);
    component.onSubmit();

    expect(deviceService.updateDevice).toHaveBeenCalledWith(1, updateData);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Dispositivo atualizado com sucesso!',
      'Fechar',
      jasmine.any(Object)
    );
    expect(router.navigate).toHaveBeenCalledWith(['/devices']);
  });

  it('should handle create device error', () => {
    const deviceRequest: DeviceRequest = {
      name: 'iPhone 14',
      location: 'Escritório Central',
      purchase_date: '2023-01-15'
    };

    const mockError = {
      error: { message: 'Erro ao criar dispositivo' }
    };

    deviceService.createDevice.and.returnValue(throwError(() => mockError));

    component.deviceForm.patchValue(deviceRequest);
    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Erro ao criar dispositivo',
      'Fechar',
      jasmine.any(Object)
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.deviceForm.patchValue({
      name: '',
      location: '',
      purchase_date: ''
    });

    component.onSubmit();

    expect(deviceService.createDevice).not.toHaveBeenCalled();
    expect(deviceService.updateDevice).not.toHaveBeenCalled();
  });

  it('should cancel and navigate back', () => {
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/devices']);
  });

  it('should logout successfully', () => {
    authService.logout.and.returnValue(of({}));

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Logout realizado com sucesso',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should get field error messages', () => {
    const nameControl = component.deviceForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(component.getFieldError('name')).toBe('Nome é obrigatório');

    nameControl?.setValue('a'.repeat(256));
    expect(component.getFieldError('name')).toBe('Nome deve ter no máximo 255 caracteres');
  });

  it('should check if field is invalid', () => {
    const nameControl = component.deviceForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();

    expect(component.isFieldInvalid('name')).toBeTrue();

    nameControl?.setValue('Valid Name');
    expect(component.isFieldInvalid('name')).toBeFalse();
  });
});