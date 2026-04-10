import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.html',
  styleUrl: './../users/users.css'
})
export class Assets implements OnInit {

  assets: any[] = [];
  users: any[] = []; // usuarios activos
  departments: any[] = [];

  searchTerm = '';
  filterStatus = '';
  filterDepartment = '';
  filteredAssets: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.getAssets();
    this.getUsers();
    this.getDepartments();
  }

  getDepartments() {
    this.adminService.getDepartments().subscribe({
      next: res => {
        this.departments = res.filter((d: any) => d.status === 1);
      },
      error: () => this.error('Error al obtener departamentos')
    });
  }

  applyFilters() {
    this.filteredAssets = this.assets.filter(asset => {

      const matchSearch =
        `${asset.hostname} ${asset.serial_number} ${asset.ip_address}`
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchStatus =
        this.filterStatus !== ''
          ? asset.status === Number(this.filterStatus)
          : true;

      const matchDepartment =
        this.filterDepartment === ''
          ? true
          : this.filterDepartment === 'null'
            ? !asset.responsible
            : String(asset.responsible?.department?.id) === String(this.filterDepartment);

        return matchSearch && matchStatus && matchDepartment;
      });
    }

  // ================= ALERTAS =================

  success(msg: string) {
    Swal.fire({
      title: msg,
      icon: 'success',
      confirmButtonColor: '#0B2545'
    });
  }

  error(msg: string) {
    Swal.fire({
      title: 'Error',
      text: msg,
      icon: 'error',
      confirmButtonColor: '#0B2545'
    });
  }

  confirm(msg: string) {
    return Swal.fire({
      title: '¿Confirmar?',
      text: msg,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      cancelButtonColor: '#E4E7EB',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    });
  }

  // ================= HELPERS =================

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Activo';
      case 0: return 'Inactivo';
      case 2: return 'Mantenimiento';
      default: return 'Desconocido';
    }
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'green';
      case 0: return 'red';
      case 2: return 'orange';
      default: return 'gray';
    }
  }

  // ================= GET =================

  getAssets() {
    this.adminService.getAssets().subscribe({
      next: res => {
        this.assets = res;
        this.applyFilters();
      },
      error: () => this.error('Error al obtener inventario')
    });
  }

  getUsers() {
    this.adminService.getUsers().subscribe({
      next: res => {
        // solo usuarios activos
        this.users = res.filter((u: any) => u.status === 1);
      },
      error: () => this.error('Error al obtener usuarios')
    });
  }

  // ================= VIEW =================

  viewAsset(asset: any) {
    Swal.fire({
      title: asset.hostname,
      html: `
        <b>Tipo:</b> ${asset.asset_type}<br>
        <b>Serie:</b> ${asset.serial_number}<br>
        <b>SO:</b> ${asset.operative_system}<br>
        <b>CPU:</b> ${asset.cpu}<br>
        <b>RAM:</b> ${asset.ram}<br>
        <b>IP:</b> ${asset.ip_address}<br>
        <b>Responsable:</b> ${asset.responsible?.email || 'Sin asignar'}
      `,
      confirmButtonColor: '#0B2545'
    });
  }

  // ================= SELECT RESPONSABLE =================

  buildUserOptions(selectedId: any = null) {
    return this.users.map(user => `
      <option value="${user.id}" ${selectedId === user.id ? 'selected' : ''}>
        ${user.email}
      </option>
    `).join('');
  }

  // ================= EDIT =================

  editAsset(asset: any) {

    const userOptions = this.buildUserOptions(asset.responsible?.id);

    Swal.fire({
      title: 'Editar equipo',
      html: `
        <input id="hostname" class="swal2-input" value="${asset.hostname}" placeholder="Hostname">
        <input id="asset_type" class="swal2-input" value="${asset.asset_type}" placeholder="Tipo">
        <input id="serial_number" class="swal2-input" value="${asset.serial_number}" placeholder="Serie">
        <input id="operative_system" class="swal2-input" value="${asset.operative_system}" placeholder="Sistema operativo">
        <input id="cpu" class="swal2-input" value="${asset.cpu}" placeholder="CPU">
        <input id="ram" type="number" class="swal2-input" value="${asset.ram}" placeholder="RAM">
        <input id="ip_address" class="swal2-input" value="${asset.ip_address}" placeholder="IP">

        <select id="responsible" class="swal2-select" style="min-width: 61%;">
          <option value="">Sin asignar</option>
          ${userOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',

      preConfirm: () => {

        const hostname = (document.getElementById('hostname') as HTMLInputElement).value;

        if (!hostname) {
          Swal.showValidationMessage('Hostname obligatorio');
          return;
        }

        return {
          hostname,
          asset_type: (document.getElementById('asset_type') as HTMLInputElement).value,
          serial_number: (document.getElementById('serial_number') as HTMLInputElement).value,
          operative_system: (document.getElementById('operative_system') as HTMLInputElement).value,
          cpu: (document.getElementById('cpu') as HTMLInputElement).value,
          ram: (document.getElementById('ram') as HTMLInputElement).value,
          ip_address: (document.getElementById('ip_address') as HTMLInputElement).value,
          responsible_id: (document.getElementById('responsible') as HTMLSelectElement).value || null
        };
      }

    }).then(result => {

      if (result.isConfirmed) {

        this.confirm('Se actualizará el equipo').then(confirm => {

          if (confirm.isConfirmed) {

            this.adminService.updateAsset(asset.id, result.value).subscribe({
              next: () => {
                this.success('Equipo actualizado');
                this.getAssets();
              },
              error: () => this.error('No se pudo actualizar')
            });

          }

        });

      }

    });
  }

  // ================= CREATE =================

  createAsset() {

    const userOptions = this.buildUserOptions();

    Swal.fire({
      title: 'Nuevo equipo',
      html: `
        <input id="hostname" class="swal2-input" placeholder="Hostname">
        <input id="asset_type" class="swal2-input" placeholder="Tipo">
        <input id="serial_number" class="swal2-input" placeholder="Serie">
        <input id="operative_system" class="swal2-input" placeholder="Sistema operativo">
        <input id="cpu" class="swal2-input" placeholder="CPU">
        <input id="ram" type="number" class="swal2-input" placeholder="RAM">
        <input id="ip_address" class="swal2-input" placeholder="IP">

        <select id="responsible" class="swal2-select" style="min-width: 61%;">
          <option value="">Sin asignar</option>
          ${userOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',

      preConfirm: () => {

        const hostname = (document.getElementById('hostname') as HTMLInputElement).value;

        if (!hostname) {
          Swal.showValidationMessage('Hostname obligatorio');
          return;
        }

        return {
          hostname,
          asset_type: (document.getElementById('asset_type') as HTMLInputElement).value || 'PC',
          serial_number: (document.getElementById('serial_number') as HTMLInputElement).value,
          operative_system: (document.getElementById('operative_system') as HTMLInputElement).value,
          cpu: (document.getElementById('cpu') as HTMLInputElement).value,
          ram: (document.getElementById('ram') as HTMLInputElement).value,
          ip_address: (document.getElementById('ip_address') as HTMLInputElement).value,
          responsible_id: (document.getElementById('responsible') as HTMLSelectElement).value || null,
          status: 1
        };
      }

    }).then(result => {

      if (result.isConfirmed) {

        this.confirm('Se creará el equipo').then(confirm => {

          if (confirm.isConfirmed) {

            this.adminService.createAsset(result.value).subscribe({
              next: () => {
                this.success('Equipo creado');
                this.getAssets();
              },
              error: () => this.error('Error al crear equipo')
            });

          }

        });

      }

    });
  }

  // ================= TOGGLE =================

  toggleAsset(asset: any) {

    let newStatus = asset.status === 1 ? 0 : 1;

    if (asset.status === 2) {
      newStatus = 1;
    }

    this.confirm(`El equipo será ${newStatus === 1 ? 'activado' : 'desactivado'}`)
      .then(result => {

        if (result.isConfirmed) {

          this.adminService.toggleAsset(asset.id, newStatus).subscribe({
            next: () => {
              this.success('Estado actualizado');
              this.getAssets();
            },
            error: () => this.error('No se pudo actualizar estado')
          });

        }

      });
  }

  // ================= MANTENIMIENTO =================

  setMaintenance(asset: any) {

    if (asset.status === 2) return;

    this.confirm('El equipo pasará a mantenimiento')
      .then(result => {

        if (result.isConfirmed) {

          this.adminService.toggleAsset(asset.id, 2).subscribe({
            next: () => {
              this.success('Equipo en mantenimiento');
              this.getAssets();
            },
            error: () => this.error('No se pudo actualizar')
          });

        }

      });
  }
}