import { esc } from './swal';

/**
 * Constructores de HTML para modales (SweetAlert2).
 * Todo texto dinámico pasa por `esc()` para evitar inyección de HTML
 * (descripciones de tickets, correos, nombres de equipos, etc.).
 * Los estilos viven en styles.css (.timeline-*, .detail-*).
 */

/* ----------------------------------------------------------
   Etiquetas y clases de badge compartidas
---------------------------------------------------------- */

export const STATUS_LABEL: Record<number, string> = {
  0: 'Cerrado',
  1: 'Abierto',
  2: 'En proceso',
  3: 'Resuelto',
  4: 'Escalado'
};

export const PRIORITY_LABEL: Record<number, string> = {
  1: 'Baja',
  2: 'Media',
  3: 'Alta',
  4: 'Crítica'
};

export const statusClass = (status: number): string =>
  ({ 0: 'client', 1: 'open', 2: 'progress', 3: 'closed', 4: 'escalated' } as Record<number, string>)[status] ?? '';

export const priorityClass = (priority: number): string =>
  ({ 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' } as Record<number, string>)[priority] ?? '';

export const badgeHtml = (text: string, cssClass = ''): string =>
  `<span class="badge ${esc(cssClass)}">${esc(text)}</span>`;

export const statusBadge = (status: number): string =>
  badgeHtml(STATUS_LABEL[status] ?? 'Desconocido', statusClass(status));

export const priorityBadge = (priority: number): string =>
  badgeHtml(PRIORITY_LABEL[priority] ?? 'Sin prioridad', priorityClass(priority));

export const formatDate = (value?: string | Date | null, fallback = '—'): string => {
  if (!value) return fallback;
  const d = new Date(value);
  return isNaN(d.getTime())
    ? fallback
    : d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
};

/* ----------------------------------------------------------
   Línea de tiempo (historiales)
---------------------------------------------------------- */

export interface TimelineRow {
  label: string;
  /** Texto plano (se escapa) o HTML ya construido con los helpers de badge. */
  value: string;
  html?: boolean;
  wide?: boolean;
}

export interface TimelineEntry {
  date?: string | Date | null;
  /** HTML de un badge opcional junto a la fecha. */
  badge?: string;
  /** Texto destacado, p. ej. el motivo del cambio. */
  note?: string;
  rows: TimelineRow[];
}

export function timelineHtml(entries: TimelineEntry[], emptyText = 'No hay historial registrado.'): string {

  if (!entries.length) {
    return `
      <div class="history-container">
        <div class="timeline-empty">
          <span class="material-icons">history_toggle_off</span>
          <p>${esc(emptyText)}</p>
        </div>
      </div>`;
  }

  const items = entries.map(entry => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-card">

        <div class="timeline-header">
          <span class="timeline-date">
            <span class="material-icons">schedule</span>
            ${esc(formatDate(entry.date))}
          </span>
          ${entry.badge ?? ''}
        </div>

        <div class="timeline-body">
          ${entry.rows.map(row => `
            <div class="timeline-row${row.wide ? ' wide' : ''}">
              <span class="timeline-label">${esc(row.label)}</span>
              <span class="timeline-value">${row.html ? row.value : esc(row.value)}</span>
            </div>
          `).join('')}

          ${entry.note ? `<div class="timeline-reason">${esc(entry.note)}</div>` : ''}
        </div>

      </div>
    </div>
  `).join('');

  return `
    <div class="history-container">
      <div class="history-timeline">${items}</div>
    </div>`;
}

/* ----------------------------------------------------------
   Ficha de detalle (ver ticket, etc.)
---------------------------------------------------------- */

export interface DetailField {
  label: string;
  value: string;
  html?: boolean;
  wide?: boolean;
}

export interface DetailSection {
  title: string;
  icon: string;
  fields: DetailField[];
}

export function detailHtml(sections: DetailSection[]): string {

  return `
    <div class="detail-view">
      ${sections.map(section => `
        <section class="detail-section">
          <h3><span class="material-icons">${esc(section.icon)}</span>${esc(section.title)}</h3>
          <div class="detail-grid">
            ${section.fields.map(field => `
              <div class="detail-field${field.wide ? ' wide' : ''}">
                <span class="detail-label">${esc(field.label)}</span>
                <span class="detail-value">${field.html ? field.value : esc(field.value || '—')}</span>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>`;
}
