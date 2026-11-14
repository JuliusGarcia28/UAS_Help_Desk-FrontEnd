import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { retry, finalize } from 'rxjs/operators';

import Swal, { toastError, toastSuccess, toastInfo, esc } from '../../../core/utils/swal';

import { AiSupportService } from '../../../core/services/ai_support.service';
import { AssetService } from '../../../core/services/asset.service';
import { Asset } from '../../../core/models/asset.model';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-support.html',
  styleUrl: './ai-support.css'
})
export class AiSupport implements OnInit {

  @ViewChild('chatBox') chatBox?: ElementRef<HTMLElement>;

  loading = false;

  session: any = null;

  messages: ChatMessage[] = [];

  assets: Asset[] = [];

  selectedAssetId = '';

  draft = '';

  lastProblemDescription = '';

  /** Atajos para empezar la conversación con un clic. */
  readonly suggestions = [
    { icon: 'power_settings_new', text: 'Mi equipo no enciende' },
    { icon: 'wifi_off', text: 'No tengo conexión a internet' },
    { icon: 'speed', text: 'Mi equipo funciona muy lento' },
    { icon: 'print', text: 'La impresora no responde' }
  ];

  constructor(
    private aiService: AiSupportService,
    private assetService: AssetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  // =========================
  // HELPERS
  // =========================

  private now(): string {
    return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  get selectedAsset(): Asset | undefined {
    return this.assets.find(a => String(a.id) === String(this.selectedAssetId));
  }

  get canSend(): boolean {
    return !this.loading && !!this.selectedAssetId && !!this.draft.trim();
  }

  /**
   * Convierte el texto de la IA (estilo markdown ligero) en HTML seguro:
   * primero se escapa todo y luego se aplican solo negritas, código y listas.
   */
  format(content: string): string {

    const lines = esc(content).split('\n');
    const out: string[] = [];
    let list: 'ul' | 'ol' | null = null;

    const inline = (t: string) =>
      t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
       .replace(/`([^`]+)`/g, '<code>$1</code>');

    const closeList = () => {
      if (list) { out.push(`</${list}>`); list = null; }
    };

    for (const raw of lines) {

      const line = raw.trim();
      const bullet = line.match(/^[-*•]\s+(.*)$/);
      const number = line.match(/^\d+[.)]\s+(.*)$/);

      if (bullet || number) {
        const kind = bullet ? 'ul' : 'ol';
        if (list !== kind) { closeList(); out.push(`<${kind}>`); list = kind; }
        out.push(`<li>${inline((bullet ?? number)![1])}</li>`);
        continue;
      }

      closeList();
      if (line) out.push(`<p>${inline(line)}</p>`);
    }

    closeList();
    return out.join('');
  }

  // =========================
  // ENTRADA
  // =========================

  onAssetChange(value: string): void {
    this.selectedAssetId = value;
  }

  useSuggestion(text: string): void {
    this.draft = text;
  }

  onKey(event: KeyboardEvent): void {
    // Enter envía; Shift+Enter inserta salto de línea.
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendProblem();
    }
  }

  // =========================
  // CARGAR EQUIPOS
  // =========================

  loadAssets(): void {

    this.assetService.getAssets().subscribe({

      next: (res: Asset[]) => {
        this.assets = res;

        // Con un solo equipo no hace falta pedir que lo seleccione.
        if (res.length === 1) {
          this.selectedAssetId = String(res[0].id);
        }
      },

      error: () => toastError('No se pudieron cargar los equipos')

    });

  }

  // =========================
  // ENVIAR MENSAJE
  // =========================

  sendProblem(): void {

    const message = this.draft.trim();
    const assetId = this.selectedAssetId;

    if (this.loading) return;

    if (!assetId) {
      toastInfo('Selecciona primero el equipo afectado');
      return;
    }

    if (!message) {
      return;
    }

    this.lastProblemDescription = message;
    this.loading = true;
    this.draft = '';

    this.messages.push({ role: 'user', content: message, time: this.now() });
    this.scrollToBottom();

    this.aiService.sendMessage(message, assetId)
      .pipe(
        retry(3),
        finalize(() => {
          this.loading = false;
          this.scrollToBottom();
        })
      )
      .subscribe({

        next: (res) => {

          this.session = res;

          const assistantMessage =
            res.messages.find((m: any) => m.role === 'assistant');

          if (assistantMessage) {
            this.messages.push({
              role: 'assistant',
              content: assistantMessage.content,
              time: this.now()
            });
          }

        },

        error: () => {
          // Se devuelve el texto al cuadro para no perder lo escrito.
          this.draft = message;
          this.showAiErrorOptions();
        }

      });

  }

  // =========================
  // ERROR DE LA IA
  // =========================

  showAiErrorOptions(): void {

    Swal.fire({
      icon: 'error',
      title: 'La IA no está disponible',
      text: 'No se pudo procesar tu solicitud después de varios intentos. Puedes crear un ticket manual para que un técnico te ayude.',
      showCancelButton: true,
      confirmButtonText: 'Crear ticket manual',
      cancelButtonText: 'Cerrar'
    }).then(result => {

      if (result.isConfirmed) {
        this.createManualTicket();
      }

    });

  }

  createManualTicket(): void {

    this.aiService
      .createManualTicket(this.lastProblemDescription)
      .subscribe({

        next: (ticket) => {

          Swal.fire({
            icon: 'success',
            title: 'Ticket creado',
            text: `Tu ticket ${ticket.code} fue generado correctamente.`,
            confirmButtonText: 'Ver mis tickets'
          }).then(() => this.router.navigate(['/client/tickets']));

        },

        error: () => toastError('No se pudo crear el ticket manual')

      });

  }

  // =========================
  // CHAT
  // =========================

  scrollToBottom(): void {

    setTimeout(() => {
      const el = this.chatBox?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    }, 60);

  }

  // =========================
  // RESOLVER / ESCALAR
  // =========================

  solved(): void {

    if (!this.session) return;

    Swal.fire({
      icon: 'question',
      title: '¿Se solucionó tu problema?',
      text: 'Cerraremos esta conversación como resuelta.',
      showCancelButton: true,
      confirmButtonText: 'Sí, se solucionó'
    }).then(result => {

      if (!result.isConfirmed) return;

      this.aiService.solved(this.session.id).subscribe({

        next: () => {
          toastSuccess('¡Excelente! Incidencia solucionada');
          this.router.navigate(['/client/dashboard']);
        },

        error: () => toastError('No se pudo marcar como solucionada')

      });

    });

  }

  escalate(): void {

    if (!this.session) return;

    Swal.fire({
      icon: 'warning',
      title: '¿Escalar a un técnico?',
      text: 'Se creará un ticket con esta conversación para que el equipo de soporte te atienda.',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear ticket'
    }).then(result => {

      if (!result.isConfirmed) return;

      this.aiService.escalate(this.session.id).subscribe({

        next: (res: any) => {

          Swal.fire({
            icon: 'success',
            title: 'Ticket generado',
            text: `Se creó el ticket ${res.code}. Un técnico te atenderá pronto.`,
            confirmButtonText: 'Ir a mi panel'
          }).then(() => this.router.navigate(['/client/dashboard']));

        },

        error: () => toastError('No se pudo escalar la conversación')

      });

    });

  }

}
