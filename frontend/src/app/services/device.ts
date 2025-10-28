import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device, DeviceRequest, DeviceFilters, PaginatedResponse } from '../models/device';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private readonly API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getDevices(filters: DeviceFilters = {}): Observable<PaginatedResponse<Device>> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof DeviceFilters];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginatedResponse<Device>>(`${this.API_URL}/devices`, { params });
  }

  getDevice(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.API_URL}/devices/${id}`);
  }

  createDevice(device: DeviceRequest): Observable<Device> {
    return this.http.post<Device>(`${this.API_URL}/devices`, device);
  }

  updateDevice(id: number, device: Partial<DeviceRequest>): Observable<Device> {
    return this.http.put<Device>(`${this.API_URL}/devices/${id}`, device);
  }

  deleteDevice(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/devices/${id}`);
  }

  toggleDeviceUse(id: number): Observable<Device> {
    return this.http.patch<Device>(`${this.API_URL}/devices/${id}/use`, {});
  }
}
