import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DeviceListComponent } from './device-list';
import { DeviceService } from '../../services/device';
import { AuthService } from '../../services/auth';
import { Device, PaginatedResponse } from '../../models/device';
import { User } from '../../models/user';
import { of, throwError } from 'rxjs';

describe('DeviceListComponent', () => {
  let component: DeviceListComponent;
  let fixture: ComponentFixture<DeviceListComponent>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  };

  const mockDevices: Device[] = [
    {
      id: 1,
      name: 'iPhone 13',
      location: 'Escritório',
      purchase_date: '2023-01-15',
      in_use: false,
      user_id: 1,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    },
    {
      id: 2,
      name: 'Samsung Galaxy',
      location: 'Casa',
      purchase_date: '2023-02-15',
      in_use: true,
      user_id: 1,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    }
  ];

  const mockPaginatedResponse: PaginatedResponse<Device> = {
    data: mockDevices,
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 2,
    from: 1,
    to: 2,
    links: [],
    path: 'http://localhost:8000/api/devices',
    first_page_url: 'http://localhost:8000/api/devices?page=1',
    last_page_url: 'http://localhost:8000/api/devices?page=1',
    next_page_url: undefined,
    prev_page_url: undefined
  };

  beforeEach(async () => {
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', [
      'getDevices', 'deleteDevice', 'toggleDeviceUse'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser', 'logout'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        DeviceListComponent,
        ReactiveFormsModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceListComponent);
    component = fixture.componentInstance;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    authService.getCurrentUser.and.returnValue(mockUser);
    deviceService.getDevices.and.returnValue(of(mockPaginatedResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    component.ngOnInit();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should load devices on init', () => {
    component.ngOnInit();
    expect(deviceService.getDevices).toHaveBeenCalled();
    expect(component.devices).toEqual(mockDevices);
    expect(component.paginatedResponse).toEqual(mockPaginatedResponse);
  });

  it('should handle device loading error', () => {
    deviceService.getDevices.and.returnValue(throwError(() => new Error('API Error')));

    component.ngOnInit();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Erro ao carregar dispositivos',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should apply filters', () => {
    component.locationFilter.setValue('Escritório');
    component.statusFilter.setValue('false');
    component.dateFromFilter.setValue('2023-01-01');
    component.dateToFilter.setValue('2023-12-31');

    component.applyFilters();

    expect(deviceService.getDevices).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      location: 'Escritório',
      in_use: false,
      purchase_date_from: '2023-01-01',
      purchase_date_to: '2023-12-31'
    });
  });

  it('should handle page change', () => {
    const pageEvent = { pageIndex: 1, pageSize: 10 } as any;
    
    component.onPageChange(pageEvent);

    expect(deviceService.getDevices).toHaveBeenCalledWith({
      page: 2,
      per_page: 10,
      location: undefined,
      purchase_date_from: undefined,
      purchase_date_to: undefined,
      in_use: undefined
    });
  });

  it('should navigate to add device', () => {
    component.addDevice();
    expect(router.navigate).toHaveBeenCalledWith(['/devices/new']);
  });

  it('should navigate to edit device', () => {
    const device = mockDevices[0];
    component.editDevice(device);
    expect(router.navigate).toHaveBeenCalledWith(['/devices', device.id, 'edit']);
  });

  it('should toggle device use', () => {
    const device = mockDevices[0];
    const updatedDevice = { ...device, in_use: true };
    
    deviceService.toggleDeviceUse.and.returnValue(of(updatedDevice));

    component.toggleDeviceUse(device);

    expect(deviceService.toggleDeviceUse).toHaveBeenCalledWith(device.id);
    expect(component.devices[0]).toEqual(updatedDevice);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Dispositivo marcado como em uso',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should handle toggle device use error', () => {
    const device = mockDevices[0];
    deviceService.toggleDeviceUse.and.returnValue(throwError(() => new Error('API Error')));

    component.toggleDeviceUse(device);

    expect(snackBar.open).toHaveBeenCalledWith(
      'Erro ao atualizar status do dispositivo',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should delete device with confirmation', () => {
    const device = mockDevices[0];
    spyOn(window, 'confirm').and.returnValue(true);
    deviceService.deleteDevice.and.returnValue(of({ message: 'Dispositivo excluído com sucesso' }));

    component.deleteDevice(device);

    expect(deviceService.deleteDevice).toHaveBeenCalledWith(device.id);
    expect(deviceService.getDevices).toHaveBeenCalledWith(1);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Dispositivo excluído com sucesso',
      'Fechar',
      jasmine.any(Object)
    );
  });

  it('should not delete device without confirmation', () => {
    const device = mockDevices[0];
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteDevice(device);

    expect(deviceService.deleteDevice).not.toHaveBeenCalled();
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

  it('should clear filters', () => {
    component.locationFilter.setValue('Escritório');
    component.statusFilter.setValue('true');
    component.dateFromFilter.setValue('2023-01-01');
    component.dateToFilter.setValue('2023-12-31');

    component.clearFilters();

    expect(component.locationFilter.value).toBe('');
    expect(component.statusFilter.value).toBe('');
    expect(component.dateFromFilter.value).toBe('');
    expect(component.dateToFilter.value).toBe('');
    expect(deviceService.getDevices).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      location: undefined,
      purchase_date_from: undefined,
      purchase_date_to: undefined,
      in_use: undefined
    });
  });

  it('should get status chip color', () => {
    expect(component.getStatusChipColor(true)).toBe('warn');
    expect(component.getStatusChipColor(false)).toBe('primary');
  });

  it('should get status text', () => {
    expect(component.getStatusText(true)).toBe('Em Uso');
    expect(component.getStatusText(false)).toBe('Disponível');
  });
});