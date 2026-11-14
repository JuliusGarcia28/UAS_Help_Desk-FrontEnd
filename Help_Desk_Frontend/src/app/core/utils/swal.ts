import Swal from 'sweetalert2';

/**
 * SweetAlert2 con la configuración del proyecto.
 *
 * Todos los componentes importan ESTE módulo en lugar de 'sweetalert2'
 * para que cada modal comparta estilo (ver estilos .swal-* en styles.css),
 * animaciones y comportamiento, y respete el tema claro/oscuro.
 *
 * Los colores de botones se controlan por CSS (buttonsStyling: false),
 * por lo que `confirmButtonColor` / `cancelButtonColor` ya no son necesarios.
 */
const AppSwal = Swal.mixin({
  buttonsStyling: false,
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  reverseButtons: true,
  heightAuto: false,
  returnFocus: false,
  customClass: {
    popup: 'swal-popup',
    title: 'swal-title',
    htmlContainer: 'swal-html',
    actions: 'swal-actions',
    confirmButton: 'swal-confirm-btn',
    cancelButton: 'swal-cancel-btn',
    denyButton: 'swal-deny-btn',
    validationMessage: 'swal-validation'
  },
  showClass: {
    popup: 'swal-show',
    backdrop: 'swal-backdrop-show'
  },
  hideClass: {
    popup: 'swal-hide',
    backdrop: 'swal-backdrop-hide'
  }
});

export default AppSwal;

/* ----------------------------------------------------------
   Atajos comunes
---------------------------------------------------------- */

/** Notificación breve en la esquina (no bloquea la interfaz). */
const Toast = AppSwal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  customClass: {
    popup: 'swal-toast'
  },
  didOpen: toast => {
    toast.addEventListener('mouseenter', AppSwal.stopTimer);
    toast.addEventListener('mouseleave', AppSwal.resumeTimer);
  }
});

export const toastSuccess = (title: string) =>
  Toast.fire({ icon: 'success', title });

export const toastError = (title: string) =>
  Toast.fire({ icon: 'error', title, timer: 4200 });

export const toastInfo = (title: string) =>
  Toast.fire({ icon: 'info', title });

/** Escapa texto del usuario antes de insertarlo en HTML de un modal. */
export const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
