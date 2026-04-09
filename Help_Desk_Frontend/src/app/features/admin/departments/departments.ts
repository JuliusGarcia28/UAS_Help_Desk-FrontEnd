import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departments.html',
  styleUrl: './../users/users.css'
})
export class Departments implements OnInit {

  departments: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.getDepartments();
  }

  getDepartments() {
    this.adminService.getDepartments().subscribe({
      next: res => this.departments = res,
      error: () => this.errorAlert('Error al obtener departamentos')
    });
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

  createDepartment() {
    Swal.fire({
      title: 'Nuevo departamento',
      html: `
        <input id="name" class="swal2-input" placeholder="Nombre">
        <input id="description" class="swal2-input" placeholder="Descripción">
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => ({
        name: (document.getElementById('name') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value,
        status: 1
      })
    }).then(result => {

      if (result.isConfirmed) {
        this.adminService.createDepartment(result.value).subscribe({
          next: () => {
            this.successAlert('Departamento creado');
            this.getDepartments();
          },
          error: () => this.errorAlert('Error al crear departamento')
        });
      }

    });
  }

  editDepartment(dep: any) {

    Swal.fire({
      title: 'Editar departamento',
      html: `
        <input id="name" class="swal2-input" value="${dep.name}">
        <input id="description" class="swal2-input" value="${dep.description}">
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => ({
        name: (document.getElementById('name') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value
      })
    }).then(result => {

      if (result.isConfirmed) {
        this.adminService.updateDepartment(dep.id, result.value).subscribe({
          next: () => {
            this.successAlert('Departamento actualizado');
            this.getDepartments();
          },
          error: () => this.errorAlert('Error al actualizar')
        });
      }

    });
  }

  toggleDepartment(dep: any) {

    const newStatus = dep.status === 1 ? 0 : 1;

    Swal.fire({
      title: '¿Confirmar?',
      text: `El departamento será ${newStatus === 1 ? 'activado' : 'desactivado'}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      cancelButtonColor: '#E4E7EB'
    }).then(result => {

      if (result.isConfirmed) {
        this.adminService.toggleDepartment(dep.id, newStatus).subscribe({
          next: () => {
            this.successAlert('Estado actualizado');
            this.getDepartments();
          },
          error: () => this.errorAlert('Error al actualizar')
        });
      }

    });
  }
}