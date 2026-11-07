import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal, { toastSuccess, toastError, esc } from '../../../core/utils/swal';
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

  /** Nodos colapsados (por id). Todo inicia expandido. */
  collapsed = new Set<number>();

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
        this.applyFilters();
      },
      error: () => this.errorAlert('Error al obtener departamentos')
    });
  }

  applyFilters() {

    const term = this.searchTerm.trim().toLowerCase();

    this.filteredDepartments = this.departments.filter(dep => {

      const matchSearch = dep.name.toLowerCase().includes(term);

      const matchStatus =
        this.filterStatus !== ''
          ? dep.status === Number(this.filterStatus)
          : true;

      return matchSearch && matchStatus;
    });

    // Se conservan los ancestros de cada coincidencia para no romper el árbol.
    const keep = new Set<number>();

    this.filteredDepartments.forEach(dep => {
      let current: any = dep;
      while (current && !keep.has(current.id)) {
        keep.add(current.id);
        current = this.departments.find(d => d.id === current.parent);
      }
    });

    this.tree = this.buildTree(this.departments.filter(d => keep.has(d.id)));
  }

  get activeCount(): number {
    return this.departments.filter(d => d.status === 1).length;
  }

  get rootCount(): number {
    return this.departments.filter(d => !d.parent).length;
  }

  isFiltering(): boolean {
    return !!this.searchTerm.trim() || this.filterStatus !== '';
  }

  isCollapsed(dep: any): boolean {
    // Con filtros activos todo se muestra abierto para ver las coincidencias.
    return !this.isFiltering() && this.collapsed.has(dep.id);
  }

  toggleNode(dep: any): void {
    this.collapsed.has(dep.id)
      ? this.collapsed.delete(dep.id)
      : this.collapsed.add(dep.id);
  }

  expandAll(): void {
    this.collapsed.clear();
  }

  collapseAll(): void {
    this.departments
      .filter(d => this.departments.some(c => c.parent === d.id))
      .forEach(d => this.collapsed.add(d.id));
  }

  // helper para indentación
  getLevel(dep: any, level = 0): number {
    if (!dep.parent) return level;

    const parent = this.departments.find(d => d.id === dep.parent);
    if (!parent) return level;

    return this.getLevel(parent, level + 1);
  }

  successAlert(msg: string) {
    toastSuccess(msg);
  }

  errorAlert(msg: string) {
    toastError(msg);
  }

  createDepartment() {

    const options = this.departments
      .map(d => `<option value="${esc(d.id)}">${d.name}</option>`)
      .join('');

    Swal.fire({
      title: 'Nuevo departamento',
      confirmButtonText: 'Crear',
      html: `
        <label class="swal-field"><span>Nombre</span><input id="name" class="swal2-input" placeholder="Nombre"></label>
        <label class="swal-field"><span>Descripción</span><input id="description" class="swal2-input" placeholder="Descripción"></label>
        <label class="swal-field"><span>Departamento padre</span><select id="parent" class="swal2-select">
          <option value="">Sin dependencia</option>
          ${options}
        </select></label>
      `,
      showCancelButton: true,
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
        <option value="${esc(d.id)}" ${dep.parent === d.id ? 'selected' : ''}>
          ${esc(d.name)}
        </option>
      `).join('');

    Swal.fire({
      title: 'Editar departamento',
      confirmButtonText: 'Guardar',
      html: `
        <label class="swal-field"><span>Nombre</span><input id="name" class="swal2-input" value="${esc(dep.name)}"></label>
        <label class="swal-field"><span>Descripción</span><input id="description" class="swal2-input" value="${esc(dep.description)}"></label>
        <label class="swal-field"><span>Departamento padre</span><select id="parent" class="swal2-select">
          <option value="">Sin dependencia</option>
          ${options}
        </select></label>
      `,
      showCancelButton: true,
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