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
  filteredDepartments: any[] =[];
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
        // SOLO ACTIVOS
        this.departments = res.filter((d: any) => d.status === 1);
      },
      error: () => this.errorAlert('Error al obtener departamentos')
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {

      const matchSearch =
        `${user.first_name} ${user.last_name} ${user.email}`
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());

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

  isSelf(user: any): boolean {
    return user.id === this.currentUser.id;
  }

  isValidEmail(email: string): boolean {
    return email.endsWith('@uas.edu.mx');
  }

  successAlert(msg: string) {
    Swal.fire({ title: msg, icon: 'success', confirmButtonColor: '#0B2545' });
  }

  errorAlert(msg: string) {
    Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#0B2545' });
  }

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

    const departmentOptions = this.departments
      .map(dep => `<option value="${dep.id}" ${user.department?.id === dep.id ? 'selected' : ''}>${dep.name}</option>`).join('');

    Swal.fire({
      title: 'Editar usuario',
      html: `
        <input id="first_name" class="swal2-input" value="${user.first_name}">
        <input id="last_name" class="swal2-input" value="${user.last_name}">
        <input id="email" class="swal2-input" value="${user.email}">
        <select id="department" class="swal2-select">
          <option value="" class="swal2-select" style="min-width: 60%;">Sin departamento</option>
          ${departmentOptions}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => {

        const email = (document.getElementById('email') as HTMLInputElement).value;

        if (!this.isValidEmail(email)) {
          Swal.showValidationMessage('Correo inválido');
          return;
        }

        return {
          first_name: (document.getElementById('first_name') as HTMLInputElement).value,
          last_name: (document.getElementById('last_name') as HTMLInputElement).value,
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
      .map(([v, l]) => `<option value="${v}">${l}</option>`).join('');

    const departmentOptions = this.departments
      .map(dep => `<option value="${dep.id}">${dep.name}</option>`).join('');

    Swal.fire({
      title: 'Nuevo usuario',
      html: `
        <input id="first_name" class="swal2-input" placeholder="Nombre(s)">
        <input id="last_name" class="swal2-input" placeholder="Apellido(s)">
        <input id="email" class="swal2-input" placeholder="Correo">
        <select id="role" class="swal2-select" style="min-width: 61%;">${roleOptions}</select>
        <select id="department" class="swal2-select" style="min-width: 61%;">
          <option value="">Sin departamento</option>
          ${departmentOptions}
        </select>
        <input id="password" type="password" class="swal2-input" placeholder="Contraseña">
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => {

        const email = (document.getElementById('email') as HTMLInputElement).value;

        if (!this.isValidEmail(email)) {
          Swal.showValidationMessage('Correo inválido');
          return;
        }

        return {
          username: email,
          first_name: (document.getElementById('first_name') as HTMLInputElement).value,
          last_name: (document.getElementById('last_name') as HTMLInputElement).value,
          email,
          password: (document.getElementById('password') as HTMLInputElement).value,
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