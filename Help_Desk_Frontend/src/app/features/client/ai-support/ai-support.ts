import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import Swal from 'sweetalert2';

import {
  retry,
  finalize
} from 'rxjs/operators';

import {
  AiSupportService
} from '../../../core/services/ai_support.service';

import {
  AssetService
} from '../../../core/services/asset.service';

import {
  Asset
} from '../../../core/models/asset.model';


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

  lastProblemDescription = '';

  currentTime = '';

  constructor(
    private aiService: AiSupportService,
    private assetService: AssetService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadAssets();

    this.updateTime();

  }

  updateTime() {

    const now = new Date();

    this.currentTime =
      now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

  }

  loadAssets() {

    const user = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    this.assetService
      .getAssets()
      .subscribe({

        next: (res) => {

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

    this.lastProblemDescription = message;

    this.loading = true;

    this.updateTime();

    /*
      MENSAJE USER
    */
    this.messages.push({

      role: 'user',

      content: message

    });

    this.scrollToBottom();

    this.aiService.sendMessage(
      message,
      assetId
    )
    .pipe(

      retry(3),

      finalize(() => {

        this.loading = false;

      })

    )
    .subscribe({

      next: (res) => {

        this.session = res;

        const assistantMessage =
          res.messages.find(
            (m: any) =>
              m.role === 'assistant'
          );

        if (assistantMessage) {

          this.updateTime();

          this.messages.push({

            role: 'assistant',

            content: assistantMessage.content

          });

        }

        textarea.value = '';

        this.scrollToBottom();

      },

      error: () => {

        this.showAiErrorOptions();

      }

    });

  }

  showAiErrorOptions() {

    Swal.fire({

      icon: 'error',

      title: 'La IA no está disponible',

      text: 'No se pudo procesar tu solicitud después de varios intentos.',

      showCancelButton: true,

      confirmButtonText: 'Crear ticket manual',

      cancelButtonText: 'Cerrar',

      reverseButtons: true

    }).then(result => {

      if (result.isConfirmed) {

        this.createManualTicket();

      }

    });

  }

  createManualTicket() {

    this.aiService
      .createManualTicket(
        this.lastProblemDescription
      )
      .subscribe({

        next: (ticket) => {

          Swal.fire({

            icon: 'success',

            title: 'Ticket creado',

            text: `Ticket ${ticket.id} generado correctamente`

          });

        },

        error: () => {

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'No se pudo crear el ticket manual'

          });

        }

      });

  }

  scrollToBottom() {

    setTimeout(() => {

      const chatBox = document.querySelector(
        '.chat-box'
      ) as HTMLElement;

      if (chatBox) {

        chatBox.scrollTop =
          chatBox.scrollHeight;

      }

    }, 100);

  }

  solved() {

    if (!this.session) return;

    this.aiService
      .solved(this.session.id)
      .subscribe({

        next: () => {

          Swal.fire({

            icon: 'success',

            title: 'Excelente',

            text: 'La incidencia fue solucionada'

          });

          this.router.navigate(['/client/dashboard']);

        }

      });

  }

  escalate() {

    if (!this.session) return;

    this.aiService
      .escalate(this.session.id)
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