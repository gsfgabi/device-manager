import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DeviceService } from '../../services/device';
import { AuthService } from '../../services/auth';
import { DeviceRequest } from '../../models/device';
import { User } from '../../models/user';

@Component({
  selector: 'app-device-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule
  ],
  templateUrl: './device-form.html',
  styleUrl: './device-form.scss',
})
export class DeviceFormComponent implements OnInit {
  deviceForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  deviceId: number | null = null;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private deviceService: DeviceService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.deviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      purchase_date: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Verificar se é modo de edição
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.deviceId = +params['id'];
        this.loadDevice();
      }
    });
  }

  loadDevice(): void {
    if (this.deviceId) {
      this.isLoading = true;
      this.deviceService.getDevice(this.deviceId).subscribe({
        next: (device) => {
          this.deviceForm.patchValue({
            name: device.name,
            location: device.location,
            purchase_date: device.purchase_date
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Erro ao carregar dispositivo', 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/devices']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.deviceForm.valid) {
      this.isLoading = true;
      const deviceData: DeviceRequest = this.deviceForm.value;

      if (this.isEditMode && this.deviceId) {
        this.updateDevice(deviceData);
      } else {
        this.createDevice(deviceData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createDevice(deviceData: DeviceRequest): void {
    this.deviceService.createDevice(deviceData).subscribe({
      next: (device) => {
        this.snackBar.open('Dispositivo criado com sucesso!', 'Fechar', {
          duration: 3000
        });
        this.router.navigate(['/devices']);
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Erro ao criar dispositivo';
        this.snackBar.open(message, 'Fechar', {
          duration: 5000
        });
      }
    });
  }

  updateDevice(deviceData: DeviceRequest): void {
    if (this.deviceId) {
      this.deviceService.updateDevice(this.deviceId, deviceData).subscribe({
        next: (device) => {
          this.snackBar.open('Dispositivo atualizado com sucesso!', 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/devices']);
        },
        error: (error) => {
          this.isLoading = false;
          const message = error.error?.message || 'Erro ao atualizar dispositivo';
          this.snackBar.open(message, 'Fechar', {
            duration: 5000
          });
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/devices']);
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

  private markFormGroupTouched(): void {
    Object.keys(this.deviceForm.controls).forEach(key => {
      const control = this.deviceForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.deviceForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field?.hasError('maxlength')) {
      return `${this.getFieldLabel(fieldName)} deve ter no máximo 255 caracteres`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      location: 'Localização',
      purchase_date: 'Data de compra'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.deviceForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
