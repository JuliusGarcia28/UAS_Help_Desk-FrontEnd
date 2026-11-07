import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal, { toastSuccess, toastError, esc } from '../../../core/utils/swal';
import { timelineHtml, badgeHtml } from '../../../core/utils/modal-html';
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

  getStatusClass(status: number): string {
    switch (status) {
      case 1: return 'active';
      case 0: return 'inactive';
      case 2: return 'maintenance';
      default: return '';
    }
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
    toastSuccess(msg);
  }

  error(msg: string) {
    toastError(msg);
  }

  confirm(msg: string, confirmText = 'Sí, continuar') {
    return Swal.fire({
      title: '¿Confirmar acción?',
      text: msg,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
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

 viewHistory(asset: any) {

  this.adminService.getAssetHistory(asset.id).subscribe({

    next: (history) => {

      if (!history.length) {
        this.error('No hay historial para este equipo');
        return;
      }

      // ORDENAR MÁS RECIENTE PRIMERO
      history.sort((a: any, b: any) =>
        new Date(b.snapshot_date).getTime() -
        new Date(a.snapshot_date).getTime()
      );

      Swal.fire({
        title: `Historial · ${asset.hostname}`,
        html: timelineHtml(history.map((h: any) => ({
          date: h.snapshot_date,
          badge: badgeHtml(this.getStatusText(h.status), this.getStatusClass(h.status)),
          note: h.change_reason || 'Actualización del sistema',
          rows: [
            { label: 'Equipo', value: h.hostname },
            { label: 'Serie', value: h.serial_number },
            { label: 'Hardware', value: `${h.cpu} · ${h.ram} GB` },
            { label: 'IP', value: h.ip_address },
            { label: 'Usuario', value: h.user_email || 'Sin asignar' },
            { label: 'Departamento', value: h.department_name || 'Sin asignar' }
          ]
        }))),
        width: 760,
        confirmButtonText: 'Cerrar'
      });

    },

    error: () => this.error('Error al obtener historial')

  });

}

  // ================= SELECT RESPONSABLE =================

  buildUserOptions(selectedId: any = null) {
    return this.users.map(user => `
      <option value="${esc(user.id)}" ${selectedId === user.id ? 'selected' : ''}>
        ${esc(user.email)}
      </option>
    `).join('');
  }

  // ================= EDIT =================

  editAsset(asset: any) {

    const userOptions = this.buildUserOptions(asset.responsible?.id);

    Swal.fire({
      title: 'Editar equipo',
      width: 680,
      confirmButtonText: 'Guardar',
      html: `
        <label class="swal-field"><span>Hostname *</span><input id="hostname" class="swal2-input" value="${esc(asset.hostname)}" placeholder="Hostname"></label>
        <label class="swal-field"><span>Tipo</span><input id="asset_type" class="swal2-input" value="${esc(asset.asset_type)}" placeholder="Tipo"></label>
        <label class="swal-field"><span>Número de serie</span><input id="serial_number" class="swal2-input" value="${esc(asset.serial_number)}" placeholder="Serie"></label>
        <label class="swal-field"><span>Sistema operativo</span><input id="operative_system" class="swal2-input" value="${esc(asset.operative_system)}" placeholder="Sistema operativo"></label>
        <label class="swal-field"><span>CPU</span><input id="cpu" class="swal2-input" value="${esc(asset.cpu)}" placeholder="CPU"></label>
        <label class="swal-field"><span>RAM (GB)</span><input id="ram" type="number" class="swal2-input" value="${esc(asset.ram)}" placeholder="RAM"></label>
        <label class="swal-field"><span>Dirección IP</span><input id="ip_address" class="swal2-input" value="${esc(asset.ip_address)}" placeholder="IP"></label>

        <label class="swal-field"><span>Responsable</span><select id="responsible" class="swal2-select">
          <option value="">Sin asignar</option>
          ${userOptions}
        </select></label>
      `,
      showCancelButton: true,

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
      width: 680,
      confirmButtonText: 'Crear equipo',
      html: `
        <label class="swal-field"><span>Hostname *</span><input id="hostname" class="swal2-input" placeholder="Hostname"></label>
        <label class="swal-field"><span>Tipo</span><input id="asset_type" class="swal2-input" placeholder="Tipo"></label>
        <label class="swal-field"><span>Número de serie</span><input id="serial_number" class="swal2-input" placeholder="Serie"></label>
        <label class="swal-field"><span>Sistema operativo</span><input id="operative_system" class="swal2-input" placeholder="Sistema operativo"></label>
        <label class="swal-field"><span>CPU</span><input id="cpu" class="swal2-input" placeholder="CPU"></label>
        <label class="swal-field"><span>RAM (GB)</span><input id="ram" type="number" class="swal2-input" placeholder="RAM"></label>
        <label class="swal-field"><span>Dirección IP</span><input id="ip_address" class="swal2-input" placeholder="IP"></label>

        <label class="swal-field"><span>Responsable</span><select id="responsible" class="swal2-select">
          <option value="">Sin asignar</option>
          ${userOptions}
        </select></label>
      `,
      showCancelButton: true,

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