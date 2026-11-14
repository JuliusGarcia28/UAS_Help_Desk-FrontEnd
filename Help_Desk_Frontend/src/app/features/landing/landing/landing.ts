import { Component, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ThemeService } from '../../../core/services/theme.service';
import { RevealDirective } from '../../../core/directives/reveal.directive';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, RevealDirective],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

  readonly themeService = inject(ThemeService);

  readonly downloadUrl =
    'https://github.com/JuliusGarcia28/UAS_Help_Desk-FrontEnd/releases/download/Release/HelpDesk.Setup.1.0.1.exe';

  readonly year = new Date().getFullYear();

  scrolled = false;

  features = [
    {
      icon: 'confirmation_number',
      title: 'Gestión de Tickets',
      text: 'Registro estructurado de incidencias técnicas para facilitar la comunicación entre docentes y personal de soporte.'
    },
    {
      icon: 'update',
      title: 'Seguimiento en Tiempo Real',
      text: 'Los usuarios pueden consultar el estado de sus solicitudes y conocer el progreso de la resolución.'
    },
    {
      icon: 'inventory_2',
      title: 'Inventario Tecnológico',
      text: 'Administración centralizada de hardware y software para mejorar la planificación del mantenimiento.'
    },
    {
      icon: 'smart_toy',
      title: 'Diagnóstico Inteligente',
      text: 'Un agente inteligente proporciona un diagnóstico inicial que facilita la identificación del problema.'
    }
  ];

  steps = [
    { title: 'Registrar incidencia', text: 'El docente reporta el problema mediante un ticket estructurado.' },
    { title: 'Análisis inicial', text: 'El sistema analiza la información y genera un diagnóstico preliminar.' },
    { title: 'Asignación técnica', text: 'El personal de soporte recibe la incidencia y planifica su solución.' },
    { title: 'Resolución', text: 'Se atiende el problema y se registra la solución aplicada.' }
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 12;
  }

  /**
   * Desplazamiento interno. No se usan href="#id" porque con <base href="./">
   * (necesario en Electron) recargarían el documento.
   */
  scrollTo(id: string, event?: Event): void {
    event?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isDark(): boolean {
    return this.themeService.isDark();
  }
}
