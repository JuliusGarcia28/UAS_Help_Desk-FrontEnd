import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html',
  styleUrl: './../users/users.css'
})
export class Departments implements OnInit {

  departments: any[] = [];
  tree: any[] = [];

  searchTerm = '';
  filterStatus = '';
  filteredDepartments: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.getDepartments();
  }

  // Construir arbol de departamentos
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

  getDepartments() {
    this.adminService.getDepartments().subscribe({
      next: res => {
        this.departments = res;
        this.tree = this.buildTree(res);
        this.applyFilters();
      },
      error: () => this.errorAlert('Error al obtener departamentos')
    });
  }

  applyFilters() {
    this.filteredDepartments = this.departments.filter(dep => {

      const matchSearch =
        dep.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchStatus =
        this.filterStatus !== ''
          ? dep.status === Number(this.filterStatus)
          : true;

      return matchSearch && matchStatus;
    });
  }

  // helper para indentación
  getLevel(dep: any, level = 0): number {
    if (!dep.parent) return level;

    const parent = this.departments.find(d => d.id === dep.parent);
    if (!parent) return level;

    return this.getLevel(parent, level + 1);
  }

  successAlert(msg: string) {
    Swal.fire({ title: msg, icon: 'success', confirmButtonColor: '#0B2545' });
  }

  errorAlert(msg: string) {
    Swal.fire({ title: 'Error', text: msg, icon: 'error', confirmButtonColor: '#0B2545' });
  }

  createDepartment() {

    const options = this.departments
      .map(d => `<option value="${d.id}">${d.name}</option>`)
      .join('');

    Swal.fire({
      title: 'Nuevo departamento',
      html: `
        <input id="name" class="swal2-input" placeholder="Nombre">
        <input id="description" class="swal2-input" placeholder="Descripción">
        <select id="parent" class="swal2-select">
          <option value="">Sin dependencia</option>
          ${options}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => ({
        name: (document.getElementById('name') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value,
        parent: (document.getElementById('parent') as HTMLSelectElement).value || null,
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

    const options = this.departments
      .filter(d => d.id !== dep.id)
      .map(d => `
        <option value="${d.id}" ${dep.parent === d.id ? 'selected' : ''}>
          ${d.name}
        </option>
      `).join('');

    Swal.fire({
      title: 'Editar departamento',
      html: `
        <input id="name" class="swal2-input" value="${dep.name}">
        <input id="description" class="swal2-input" value="${dep.description}">
        <select id="parent" class="swal2-select">
          <option value="">Sin dependencia</option>
          ${options}
        </select>
      `,
      showCancelButton: true,
      confirmButtonColor: '#0B2545',
      preConfirm: () => ({
        name: (document.getElementById('name') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value,
        parent: (document.getElementById('parent') as HTMLSelectElement).value || null
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