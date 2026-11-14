import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal, { toastSuccess, toastError, esc } from '../../../core/utils/swal';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  departments: any[] = [];

  searchTerm = '';
  filterRole = '';
  filterStatus = '';
  filterDepartment = '';

  currentUser: any;

  roleMap: any = {
    client: 'Cliente',
    technician: 'Técnico',
    admin: 'Admin'
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUser() ?? {};
    this.getUsers();
    this.getDepartments();
  }

  // funciones para construir el arbol de departamentos y las opciones del select
  buildTree(departments: any[]) {
    const map: any = {};
    const roots: any[] = [];

    departments.forEach(dep => {
      map[dep.id] = { ...dep, children: [] };
    });

    departments.forEach(dep => {
      if (dep.parent) {
        map[dep.parent]?.children.push(map[dep.id]);
      } else {
        roots.push(map[dep.id]);
      }
    });

    return roots;
  }

  buildDepartmentOptionsTree(departments: any[]): string {

    const tree = this.buildTree(departments);

    const buildOptions = (nodes: any[], level = 0): string => {
      return nodes.map(node => {

        const indent = '&nbsp;'.repeat(level * 4);
        const prefix = level > 0 ? '↳ ' : '';

        const option = `
          <option value="${esc(node.id)}">
            ${indent}${prefix}${node.name}
          </option>
        `;

        const children = node.children?.length
          ? buildOptions(node.children, level + 1)
          : '';

        return option + children;

      }).join('');
    };

    return buildOptions(tree);
  }

  buildDepartmentOptionsTreeWithSelected(departments: any[], selectedId: any): string {

    const tree = this.buildTree(departments);

    const buildOptions = (nodes: any[], level = 0): string => {
      return nodes.map(node => {

        const indent = '&nbsp;'.repeat(level * 4);
        const prefix = level > 0 ? '| ' : '';

        const selected = String(node.id) === String(selectedId) ? 'selected' : '';

        const option = `
          <option value="${esc(node.id)}" ${selected}>
            ${indent}${prefix}${node.name}
          </option>
        `;

        const children = node.children?.length
          ? buildOptions(node.children, level + 1)
          : '';

        return option + children;

      }).join('');
    };

    return buildOptions(tree);
  }

  // funciones para obtener datos
  getUsers() {
    this.adminService.getUsers().subscribe({
      next: res => {
        this.users = res;
        this.applyFilters();
      },
      error: () => this.errorAlert('Error al obtener usuarios')
    });
  }

  getDepartments() {
    this.adminService.getDepartments().subscribe({
      next: res => {
        this.departments = res.filter((d: any) => d.status === 1);
      },
      error: () => this.errorAlert('Error al obtener departamentos')
    });
  }

  // funciones para aplicar filtros
  applyFilters() {
    this.filteredUsers = this.users.filter(user => {

      const fullText = `${user.first_name || ''} ${user.last_name || ''} ${user.email || ''}`.toLowerCase();

      const matchSearch = fullText.includes(this.searchTerm.toLowerCase());

      const matchRole =
        this.filterRole ? user.role === this.filterRole : true;

      const matchStatus =
        this.filterStatus !== ''
          ? user.status === Number(this.filterStatus)
          : true;

      const matchDepartment =
        this.filterDepartment === ''
          ? true
          : this.filterDepartment === 'null'
            ? !user.department
            : String(user.department?.id) === String(this.filterDepartment);

      return matchSearch && matchRole && matchStatus && matchDepartment;
    });
  }

  // funciones utilitarias
  isSelf(user: any): boolean {
    return user.id === this.currentUser?.id;
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  successAlert(msg: string) {
    toastSuccess(msg);
  }

  errorAlert(msg: string) {
    toastError(msg);
  }

  // ========================
  // ACTIONS
  // ========================

  toggleUser(user: any) {

    if (this.isSelf(user)) return;

    const newStatus = user.status === 1 ? 0 : 1;

    Swal.fire({
      title: newStatus === 1 ? '¿Activar usuario?' : '¿Desactivar usuario?',
      text: `El usuario será ${newStatus === 1 ? 'activado' : 'desactivado'}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: newStatus === 1 ? 'Activar' : 'Desactivar',
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.toggleUser(user.id, newStatus).subscribe({
          next: () => {
            this.successAlert('Estado actualizado');
            this.getUsers();
          },
          error: () => this.errorAlert('No se pudo actualizar')
        });
      }
    });
  }

  viewUser(user: any) {
    Swal.fire({
      title: esc(`${user.first_name} ${user.last_name}`),
      html: `
        <div class="detail-view">
          <div class="detail-grid">
            <div class="detail-field wide"><span class="detail-label">Correo</span><span class="detail-value">${esc(user.email)}</span></div>
            <div class="detail-field"><span class="detail-label">Rol</span><span class="detail-value">${esc(this.roleMap[user.role])}</span></div>
            <div class="detail-field"><span class="detail-label">Departamento</span><span class="detail-value">${esc(user.department?.name || 'Sin asignar')}</span></div>
          </div>
        </div>
      `,
      confirmButtonText: 'Cerrar'
    });
  }

  editUser(user: any) {

    const departmentOptions = this.buildDepartmentOptionsTreeWithSelected(
      this.departments,
      user.department?.id
    );

    Swal.fire({
      title: 'Editar usuario',
      width: 620,
      confirmButtonText: 'Guardar',
      html: `
        <label class="swal-field"><span>Nombre(s)</span><input id="first_name" class="swal2-input" value="${esc(user.first_name || '')}" placeholder="Nombre(s)"></label>
        <label class="swal-field"><span>Apellido(s)</span><input id="last_name" class="swal2-input" value="${esc(user.last_name || '')}" placeholder="Apellido(s)"></label>
        <label class="swal-field"><span>Correo</span><input id="email" class="swal2-input" value="${esc(user.email || '')}" placeholder="Correo"></label>
        <label class="swal-field"><span>Departamento</span><select id="department" class="swal2-select">
          <option value="">Sin departamento</option>
          ${departmentOptions}
        </select></label>
      `,
      showCancelButton: true,
      preConfirm: () => {

        const first_name = (document.getElementById('first_name') as HTMLInputElement).value.trim();
        const last_name = (document.getElementById('last_name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();

        if (!first_name || !last_name || !email) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return;
        }

        if (!this.isValidEmail(email)) {
          Swal.showValidationMessage('Correo en formato inválido');
          return;
        }

        return {
          first_name,
          last_name,
          email,
          department_id: (document.getElementById('department') as HTMLSelectElement).value || null
        };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.updateUser(user.id, result.value).subscribe({
          next: () => {
            this.successAlert('Usuario actualizado');
            this.getUsers();
          },
          error: () => this.errorAlert('Error al actualizar')
        });
      }
    });
  }

  createUser() {

    const roleOptions = Object.entries(this.roleMap)
      .map(([value, label]) => `<option value="${esc(value)}">${label}</option>`)
      .join('');

    const departmentOptions = this.buildDepartmentOptionsTree(this.departments);

    Swal.fire({
      title: 'Nuevo usuario',
      width: 620,
      confirmButtonText: 'Crear usuario',
      html: `
        <div class="swal-form">
          <label class="swal-field"><span>Nombre(s)</span><input id="first_name" class="swal2-input" placeholder="Nombre(s)"></label>
          <label class="swal-field"><span>Apellido(s)</span><input id="last_name" class="swal2-input" placeholder="Apellido(s)"></label>
          <label class="swal-field"><span>Correo</span><input id="email" class="swal2-input" placeholder="Correo"></label>
          <label class="swal-field"><span>Rol</span><select id="role" class="swal2-select">${roleOptions}</select></label>
          <label class="swal-field"><span>Departamento</span><select id="department" class="swal2-select">
            <option value="">Sin departamento</option>
              ${departmentOptions}
          </select></label>
        </div>
      `,
      showCancelButton: true,
      preConfirm: () => {

        const first_name = (document.getElementById('first_name') as HTMLInputElement).value.trim();
        const last_name = (document.getElementById('last_name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();

        if (!first_name || !last_name || !email) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return;
        }

        if (!this.isValidEmail(email)) {
          Swal.showValidationMessage('Correo en formato inválido');
          return;
        }

        return {
          username: email,
          first_name,
          last_name,
          email,
          role: (document.getElementById('role') as HTMLSelectElement).value,
          department_id: (document.getElementById('department') as HTMLSelectElement).value || null,
          status: 1
        };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.adminService.createUser(result.value).subscribe({
          next: () => {
            this.successAlert('Usuario creado');
            this.getUsers();
          },
          error: () => this.errorAlert('Error al crear usuario')
        });
      }
    });
  }
}