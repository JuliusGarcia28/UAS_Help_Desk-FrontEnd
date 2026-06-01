import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../../../core/services/admin.service';

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

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
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
          <option value="${node.id}">
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
          <option value="${node.id}" ${selected}>
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
    Swal.fire({
      title: msg,
      icon: 'success',
      confirmButtonColor: '#0B2545'
    });
  }

  errorAlert(msg: string) {
    Swal.fire({
      title: 'Error',
      text: msg,
      icon: 'error',
      confirmButtonColor: '#0B2545'
    });
  }

  // ========================
  // ACTIONS
  // ========================

  toggleUser(user: any) {

    if (this.isSelf(user)) return;

    const newStatus = user.status === 1 ? 0 : 1;

    Swal.fire({
      title: '¿Confirmar acción?',
      text: `El usuario será ${newStatus === 1 ? 'activado' : 'desactivado'}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      cancelButtonColor: '#E4E7EB'
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
      title: `${user.first_name} ${user.last_name}`,
      html: `
        <b>Email:</b> ${user.email}<br>
        <b>Rol:</b> ${this.roleMap[user.role]}<br>
        <b>Departamento:</b> ${user.department?.name || 'Sin asignar'}
      `,
      confirmButtonColor: '#0B2545'
    });
  }

  editUser(user: any) {

    const departmentOptions = this.buildDepartmentOptionsTreeWithSelected(
      this.departments,
      user.department?.id
    );

    Swal.fire({
      title: 'Editar usuario',
      html: `
        <input id="first_name" class="swal2-input" value="${user.first_name || ''}" placeholder="Nombre(s)">
        <input id="last_name" class="swal2-input" value="${user.last_name || ''}" placeholder="Apellido(s)">
        <input id="email" class="swal2-input" value="${user.email || ''}" placeholder="Correo">
        <select id="department" class="swal2-select">
          <option value="">Sin departamento</option>
          ${departmentOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
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
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join('');

    const departmentOptions = this.buildDepartmentOptionsTree(this.departments);

    Swal.fire({
      title: 'Nuevo usuario',
      html: `
        <div class="swal-form">
          <input id="first_name" class="swal2-input" placeholder="Nombre(s)">
          <input id="last_name" class="swal2-input" placeholder="Apellido(s)">
          <input id="email" class="swal2-input" placeholder="Correo">
          <select id="role" class="swal2-select">${roleOptions}</select>
          <select id="department" class="swal2-select">
            <option value="">Sin departamento</option>
              ${departmentOptions}
          </select>
          <input id="password" type="password" class="swal2-input" placeholder="Contraseña">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => {

        const first_name = (document.getElementById('first_name') as HTMLInputElement).value.trim();
        const last_name = (document.getElementById('last_name') as HTMLInputElement).value.trim();
        const email = (document.getElementById('email') as HTMLInputElement).value.trim();
        const password = (document.getElementById('password') as HTMLInputElement).value;

        if (!first_name || !last_name || !email || !password) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return;
        }

        if (!this.isValidEmail(email)) {
          Swal.showValidationMessage('Correo en formato inválido');
          return;
        }

        if (password.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        return {
          username: email,
          first_name,
          last_name,
          email,
          password,
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