import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  AiSupportService
} from '../../../core/services/ai_support.service';

import Swal, { toastError, esc } from '../../../core/utils/swal';
import { formatDate } from '../../../core/utils/modal-html';

@Component({
  selector: 'app-ai-history',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './ai-history.html',
  styleUrl: './ai-history.css'
})
export class AiHistory implements OnInit {

  sessions: any[] = [];

  loading = true;

  constructor(
    private aiService: AiSupportService
  ) {}

  ngOnInit(): void {

    this.loadSessions();

  }

  loadSessions() {

    this.loading = true;

    this.aiService
      .getSessions()
      .subscribe({

        next: (res) => {

          this.sessions = res;

          this.loading = false;

        },

        error: () => {

          this.loading = false;

          toastError('No se pudo cargar el historial');

        }

      });

  }

  viewChat(session: any) {

    const messages: any[] = session.messages ?? [];

    const bubbles = messages.map(m => {

      const isUser = m.role === 'user';

      return `
        <div class="chat-modal-msg ${isUser ? 'user' : 'assistant'}">
          <div class="chat-modal-avatar">
            <span class="material-icons">${isUser ? 'person' : 'smart_toy'}</span>
          </div>
          <div class="chat-modal-bubble">
            <span class="chat-modal-sender">${isUser ? 'Tú' : 'Asistente IA'}</span>
            <div class="chat-modal-text">${esc(m.content)}</div>
          </div>
        </div>`;

    }).join('');

    Swal.fire({
      title: 'Conversación',
      width: 760,
      confirmButtonText: 'Cerrar',
      html: `
        <div class="chat-modal-meta">
          <span class="material-icons">schedule</span>
          ${esc(formatDate(session.created_at))}
        </div>
        <div class="chat-modal">
          ${bubbles || '<p class="timeline-empty">Sin mensajes.</p>'}
        </div>
      `
    });

  }

}
