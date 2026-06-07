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

import Swal from 'sweetalert2';

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

          Swal.fire({

            icon: 'error',

            title: 'Error',

            text: 'No se pudo cargar el historial'

          });

        }

      });

  }

  viewChat(session: any) {

    const html = session.messages
      .map((m: any) => `

        <div style="
          margin-bottom:20px;
          padding:12px;
          border-radius:10px;
          color: var(--text-primary);
          background:${
            m.role === 'user'
              ? 'var(--primary)'
              : '#e9e3e3'
          };
          color:${
            m.role === 'user'
              ? 'white'
              : 'black'
          };
          text-align:${
            m.role === 'user'
              ? 'right'
              : 'left'
          };
        ">

          <b>
            ${
              m.role === 'user'
                ? 'Tú'
                : 'Asistente IA'
            }
          </b>

          <br><br>

          ${m.content}

        </div>

      `)
      .join('');

    Swal.fire({

      title: 'Conversación',

      width: '900px',

      html: `

        <div style="
          max-height:500px;
          overflow-y:auto;
          text-align:left;
          background: var(--surface);
          color: var(--text-primary);
        ">

          ${html}

        </div>

      `

    });

  }

}