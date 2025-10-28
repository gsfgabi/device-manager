import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { DeviceService } from '../../services/device';
import { AuthService } from '../../services/auth';
import { Device, DeviceFilters, PaginatedResponse } from '../../models/device';
import { User } from '../../models/user';

@Component({
  selector: 'app-device-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatChipsModule
  ],
  templateUrl: './device-list.html',
  styleUrl: './device-list.scss',
})
export class DeviceListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'location', 'purchase_date', 'in_use', 'actions'];
  devices: Device[] = [];
  paginatedResponse: PaginatedResponse<Device> | null = null;
  isLoading = false;
  currentUser: User | null = null;

  // Filtros
  nameFilter = new FormControl('');
  locationFilter = new FormControl('');
  statusFilter = new FormControl('');
  dateFromFilter = new FormControl('');
  dateToFilter = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private deviceService: DeviceService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadFiltersFromStorage();
    this.loadDevices();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters(): void {
    // Aplicar filtros com debounce
    this.nameFilter.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    this.locationFilter.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.dateFromFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.dateToFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  loadDevices(page = 1): void {
    this.isLoading = true;
    const filters: DeviceFilters = {
      page,
      per_page: 10,
      location: this.locationFilter.value || undefined,
      purchase_date_from: this.dateFromFilter.value || undefined,
      purchase_date_to: this.dateToFilter.value || undefined,
      in_use: this.statusFilter.value !== '' ? this.statusFilter.value === 'true' : undefined
    };

    this.deviceService.getDevices(filters).subscribe({
      next: (response) => {
        this.devices = response.data;
        this.paginatedResponse = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar dispositivos', 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  applyFilters(): void {
    this.saveFiltersToStorage();
    this.loadDevices(1);
  }

  onPageChange(event: PageEvent): void {
    this.loadDevices(event.pageIndex + 1);
  }

  addDevice(): void {
    this.router.navigate(['/devices/new']);
  }

  editDevice(device: Device): void {
    this.router.navigate(['/devices', device.id, 'edit']);
  }

  toggleDeviceUse(device: Device): void {
    this.deviceService.toggleDeviceUse(device.id).subscribe({
      next: (updatedDevice) => {
        const index = this.devices.findIndex(d => d.id === device.id);
        if (index !== -1) {
          this.devices[index] = updatedDevice;
        }
        this.snackBar.open(
          updatedDevice.in_use ? 'Dispositivo marcado como em uso' : 'Dispositivo desmarcado como em uso',
          'Fechar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Erro ao atualizar status do dispositivo', 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  deleteDevice(device: Device): void {
    if (confirm(`Tem certeza que deseja excluir o dispositivo "${device.name}"?`)) {
      this.deviceService.deleteDevice(device.id).subscribe({
        next: () => {
          this.loadDevices(this.paginatedResponse?.current_page || 1);
          this.snackBar.open('Dispositivo excluído com sucesso', 'Fechar', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir dispositivo', 'Fechar', {
            duration: 3000
          });
        }
      });
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.snackBar.open('Logout realizado com sucesso', 'Fechar', {
          duration: 3000
        });
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  clearFilters(): void {
    this.nameFilter.setValue('');
    this.locationFilter.setValue('');
    this.statusFilter.setValue('');
    this.dateFromFilter.setValue('');
    this.dateToFilter.setValue('');
    this.saveFiltersToStorage();
    this.loadDevices(1);
  }

  private saveFiltersToStorage(): void {
    const filters = {
      name: this.nameFilter.value || '',
      location: this.locationFilter.value || '',
      status: this.statusFilter.value || '',
      dateFrom: this.dateFromFilter.value || '',
      dateTo: this.dateToFilter.value || ''
    };
    localStorage.setItem('deviceFilters', JSON.stringify(filters));
  }

  private loadFiltersFromStorage(): void {
    const filtersStr = localStorage.getItem('deviceFilters');
    if (filtersStr) {
      try {
        const filters = JSON.parse(filtersStr);
        this.nameFilter.setValue(filters.name || '');
        this.locationFilter.setValue(filters.location || '');
        this.statusFilter.setValue(filters.status || '');
        this.dateFromFilter.setValue(filters.dateFrom || '');
        this.dateToFilter.setValue(filters.dateTo || '');
      } catch (error) {
        console.error('Erro ao carregar filtros do localStorage:', error);
      }
    }
  }

  getStatusChipColor(inUse: boolean): string {
    return inUse ? 'warn' : 'primary';
  }

  getStatusText(inUse: boolean): string {
    return inUse ? 'Em Uso' : 'Disponível';
  }
}
