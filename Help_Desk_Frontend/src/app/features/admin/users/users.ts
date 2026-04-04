import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html'
})
export class Users implements OnInit {

  users: any[] = [];
  currentUser: any;

  API = 'http://127.0.0.1:8000/users/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.getUsers();
  }

  getUsers() {
    this.http.get<any>(this.API)
      .subscribe(res => this.users = res);
  }

  // VALIDACIÓN
  isSelf(user: any): boolean {
    return user.id === this.currentUser.id;
  }

  // VER DETALLE
  viewUser(user: any) {
    Swal.fire({
      title: `${user.first_name} ${user.last_name}`,
      html: `
        <b>Username:</b> ${user.username}<br>
        <b>Email:</b> ${user.email}<br>
        <b>Rol:</b> ${user.role}<br>
        <b>Estado:</b> ${user.status === 1 ? 'Activo' : 'Inactivo'}
      `,
      confirmButtonColor: '#0B2545'
    });
  }

  // EDITAR
  editUser(user: any) {

    if (this.isSelf(user)) {
      Swal.fire('No permitido', 'No puedes editar tu propio usuario', 'warning');
      return;
    }

    Swal.fire({
      title: 'Editar usuario',
      html: `
        <input id="name" class="swal2-input" placeholder="Nombre" value="${user.first_name}">
        <input id="last" class="swal2-input" placeholder="Apellido" value="${user.last_name}">
        <input id="email" class="swal2-input" placeholder="Email" value="${user.email}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#0B2545',

      preConfirm: () => {
        return {
          first_name: (document.getElementById('name') as HTMLInputElement).value,
          last_name: (document.getElementById('last') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value
        };
      }
    }).then(result => {

      if (result.isConfirmed) {

        this.http.patch(`${this.API}${user.id}/`, result.value)
          .subscribe(() => {
            Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
            this.getUsers();
          });
      }
    });
  }

  // CREAR
  createUser() {
    Swal.fire({
      title: 'Nuevo usuario',
      html: `
        <input id="username" class="swal2-input" placeholder="Username">
        <input id="email" class="swal2-input" placeholder="Email">
        <input id="password" type="password" class="swal2-input" placeholder="Password">
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      confirmButtonColor: '#0B2545',

      preConfirm: () => {
        return {
          username: (document.getElementById('username') as HTMLInputElement).value,
          email: (document.getElementById('email') as HTMLInputElement).value,
          password: (document.getElementById('password') as HTMLInputElement).value,
          role: 'client',
          status: 1
        };
      }
    }).then(result => {

      if (result.isConfirmed) {

        this.http.post(this.API, result.value)
          .subscribe(() => {
            Swal.fire('Creado', 'Usuario registrado', 'success');
            this.getUsers();
          });
      }
    });
  }

  // DESACTIVAR (NO ELIMINAR)
  deactivateUser(user: any) {

    if (this.isSelf(user)) {
      Swal.fire('No permitido', 'No puedes desactivar tu propio usuario', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Desactivar usuario?',
      text: 'El usuario no podrá iniciar sesión',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      confirmButtonColor: '#0B2545'
    }).then(result => {

      if (result.isConfirmed) {

        this.http.patch(`${this.API}${user.id}/`, { status: 0 })
          .subscribe(() => {
            Swal.fire('Desactivado', 'Usuario desactivado', 'success');
            this.getUsers();
          });
      }
    });
  }
}