import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DeviceService } from './device';
import { Device, DeviceRequest, DeviceFilters, PaginatedResponse } from '../models/device';

describe('DeviceService', () => {
  let service: DeviceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DeviceService]
    });
    service = TestBed.inject(DeviceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get devices with pagination', () => {
    const mockResponse: PaginatedResponse<Device> = {
      data: [
        {
          id: 1,
          name: 'iPhone 13',
          location: 'Escritório',
          purchase_date: '2023-01-15',
          in_use: false,
          user_id: 1,
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z'
        }
      ],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 1,
      from: 1,
      to: 1,
      links: [],
      path: 'http://localhost:8000/api/devices',
      first_page_url: 'http://localhost:8000/api/devices?page=1',
      last_page_url: 'http://localhost:8000/api/devices?page=1',
      next_page_url: undefined,
      prev_page_url: undefined
    };

    service.getDevices().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/devices');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get devices with filters', () => {
    const filters: DeviceFilters = {
      page: 1,
      per_page: 5,
      in_use: true,
      location: 'Escritório',
      purchase_date_from: '2023-01-01',
      purchase_date_to: '2023-12-31'
    };

    const mockResponse: PaginatedResponse<Device> = {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 5,
      total: 0,
      from: 0,
      to: 0,
      links: [],
      path: 'http://localhost:8000/api/devices',
      first_page_url: 'http://localhost:8000/api/devices?page=1',
      last_page_url: 'http://localhost:8000/api/devices?page=1',
      next_page_url: undefined,
      prev_page_url: undefined
    };

    service.getDevices(filters).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(req => {
      return req.url === 'http://localhost:8000/api/devices' &&
             req.params.has('page') &&
             req.params.has('per_page') &&
             req.params.has('in_use') &&
             req.params.has('location') &&
             req.params.has('purchase_date_from') &&
             req.params.has('purchase_date_to');
    });
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get single device', () => {
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

    service.getDevice(1).subscribe(device => {
      expect(device).toEqual(mockDevice);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/devices/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockDevice);
  });

  it('should create device', () => {
    const deviceRequest: DeviceRequest = {
      name: 'iPhone 14',
      location: 'Escritório Central',
      purchase_date: '2023-01-15'
    };

    const mockDevice: Device = {
      id: 2,
      name: 'iPhone 14',
      location: 'Escritório Central',
      purchase_date: '2023-01-15',
      in_use: false,
      user_id: 1,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    };

    service.createDevice(deviceRequest).subscribe(device => {
      expect(device).toEqual(mockDevice);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/devices');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(deviceRequest);
    req.flush(mockDevice);
  });

  it('should update device', () => {
    const updateData: Partial<DeviceRequest> = {
      name: 'iPhone 14 Pro',
      location: 'Sala de Reuniões'
    };

    const mockDevice: Device = {
      id: 1,
      name: 'iPhone 14 Pro',
      location: 'Sala de Reuniões',
      purchase_date: '2023-01-15',
      in_use: false,
      user_id: 1,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    };

    service.updateDevice(1, updateData).subscribe(device => {
      expect(device).toEqual(mockDevice);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/devices/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(mockDevice);
  });

  it('should delete device', () => {
    const mockResponse = { message: 'Dispositivo excluído com sucesso' };

    service.deleteDevice(1).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/devices/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should toggle device use', () => {
    const mockDevice: Device = {
      id: 1,
      name: 'iPhone 13',
      location: 'Escritório',
      purchase_date: '2023-01-15',
      in_use: true,
      user_id: 1,
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    };

    service.toggleDeviceUse(1).subscribe(device => {
      expect(device).toEqual(mockDevice);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/devices/1/use');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockDevice);
  });
});