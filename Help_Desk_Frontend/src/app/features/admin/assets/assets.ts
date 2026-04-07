import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assets.html',
  styleUrl: './../users/users.css'
})
export class Assets implements OnInit {

  assets: any[] = [];
  API = 'http://127.0.0.1:8000/inventory/';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAssets();
  }

  getAssets() {
    this.http.get<any>(this.API)
      .subscribe(res => this.assets = res);
  }

  // 👁 VER DETALLE
  viewAsset(asset: any) {
    Swal.fire({
      title: asset.hostname,
      html: `
        <b>Modelo:</b> ${asset.model}<br>
        <b>Serie:</b> ${asset.serial_number}<br>
        <b>IP:</b> ${asset.ip_address || 'N/A'}<br>
        <b>Sistema:</b> ${asset.operative_system || 'N/A'}<br>
        <b>CPU:</b> ${asset.cpu || 'N/A'}<br>
        <b>RAM:</b> ${asset.ram || 'N/A'} GB
      `,
      confirmButtonColor: '#0B2545'
    });
  }

  // ✏ EDITAR
  editAsset(asset: any) {
    Swal.fire({
      title: 'Editar equipo',
      html: `
        <input id="hostname" class="swal2-input" placeholder="Hostname" value="${asset.hostname}">
        <input id="model" class="swal2-input" placeholder="Modelo" value="${asset.model}">
        <input id="ip" class="swal2-input" placeholder="IP" value="${asset.ip_address || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      confirmButtonColor: '#0B2545',

      preConfirm: () => {
        return {
          hostname: (document.getElementById('hostname') as HTMLInputElement).value,
          model: (document.getElementById('model') as HTMLInputElement).value,
          ip_address: (document.getElementById('ip') as HTMLInputElement).value
        };
      }
    }).then(result => {

      if (result.isConfirmed) {

        this.http.patch(`${this.API}${asset.id}/`, result.value)
          .subscribe(() => {
            Swal.fire('Actualizado', 'Equipo actualizado', 'success');
            this.getAssets();
          });
      }
    });
  }

  // ➕ CREAR
  createAsset() {
    Swal.fire({
      title: 'Nuevo equipo',
      html: `
        <input id="hostname" class="swal2-input" placeholder="Hostname">
        <input id="model" class="swal2-input" placeholder="Modelo">
        <input id="serial" class="swal2-input" placeholder="Número de serie">
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      confirmButtonColor: '#0B2545',

      preConfirm: () => {
        return {
          hostname: (document.getElementById('hostname') as HTMLInputElement).value,
          model: (document.getElementById('model') as HTMLInputElement).value,
          serial_number: (document.getElementById('serial') as HTMLInputElement).value,
          asset_type: 'PC',
          status: 1
        };
      }
    }).then(result => {

      if (result.isConfirmed) {

        this.http.post(this.API, result.value)
          .subscribe(() => {
            Swal.fire('Creado', 'Equipo registrado', 'success');
            this.getAssets();
          });
      }
    });
  }

  // ACTIVAR / DESACTIVAR
  toggleAsset(asset: any) {

    const isActive = asset.status === 1;

    Swal.fire({
      title: isActive ? '¿Enviar a mantenimiento?' : '¿Activar equipo?',
      text: isActive
        ? 'El equipo pasará a estado inactivo/mantenimiento'
        : 'El equipo estará disponible nuevamente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isActive ? 'Sí, desactivar' : 'Sí, activar',
      confirmButtonColor: '#0B2545'
    }).then(result => {

      if (result.isConfirmed) {

        this.http.patch(`${this.API}${asset.id}/`, {
          status: isActive ? 0 : 1
        }).subscribe(() => {

          Swal.fire(
            isActive ? 'Desactivado' : 'Activado',
            `El equipo ha sido ${isActive ? 'desactivado' : 'activado'}`,
            'success'
          );

          this.getAssets();
        });

      }
    });
  }
}