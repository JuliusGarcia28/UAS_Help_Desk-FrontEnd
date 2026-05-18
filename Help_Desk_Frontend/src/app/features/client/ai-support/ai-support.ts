import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

import { AiSupportService } from '../../../core/services/ai_support.service';

import { AssetService } from '../../../core/services/asset.service';

import { Asset } from '../../../core/models/asset.model';


@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-support.html',
  styleUrl: './ai-support.css'
})
export class AiSupport implements OnInit {

  loading = false;

  session: any = null;

  messages: any[] = [];

  assets: Asset[] = [];

  constructor(
    private aiService: AiSupportService,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {

    this.loadAssets();

  }

  loadAssets() {

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    this.assetService.getAssets()
      .subscribe({

        next: (res) => {

          /*
            SOLO EQUIPOS DEL USUARIO
          */

          this.assets = res.filter(
            (asset: Asset) =>
              asset.responsible?.id === user.id
          );

        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los equipos'
          });

        }

      });

  }

  sendProblem(
    textarea: HTMLTextAreaElement,
    assetSelect: HTMLSelectElement
  ) {

    const message = textarea.value.trim();

    const assetId = assetSelect.value;

    if (!assetId) {

      Swal.fire({
        icon: 'warning',
        title: 'Equipo requerido',
        text: 'Selecciona un equipo'
      });

      return;
    }

    if (!message) {

      Swal.fire({
        icon: 'warning',
        title: 'Mensaje requerido',
        text: 'Describe el problema'
      });

      return;
    }

    this.loading = true;

    /*
      MOSTRAR MENSAJE USUARIO
    */

    this.messages.push({
      role: 'user',
      content: message
    });

    this.aiService.sendMessage(
      message,
      assetId
    ).subscribe({

      next: (res) => {

        this.session = res;

        /*
          RESPUESTA IA ABAJO
        */

        const assistantMessage = res.messages.find(
          (m: any) => m.role === 'assistant'
        );

        if (assistantMessage) {

          this.messages.push({
            role: 'assistant',
            content: assistantMessage.content
          });

        }

        textarea.value = '';

        this.loading = false;

        this.scrollToBottom();

      },

      error: () => {

        this.loading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo conectar con la IA'
        });

      }

    });

  }

  scrollToBottom() {

    setTimeout(() => {

      const chatBox = document.querySelector(
        '.chat-box'
      );

      if (chatBox) {

        chatBox.scrollTop = chatBox.scrollHeight;

      }

    }, 100);

  }

  solved() {

    if (!this.session) return;

    this.aiService.solved(this.session.id)
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Excelente',
            text: 'La incidencia fue solucionada'
          });

        }

      });

  }

  escalate() {

    if (!this.session) return;

    this.aiService.escalate(this.session.id)
      .subscribe({

        next: (res: any) => {

          Swal.fire({
            icon: 'info',
            title: 'Ticket generado',
            text: `Ticket ${res.ticket_id} creado`
          });

        }

      });

  }

}