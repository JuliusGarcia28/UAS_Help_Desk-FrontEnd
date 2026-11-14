import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';
import { LoadingOverlay } from './core/components/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  // Se inyecta para que el tema guardado se aplique al arrancar.
  private readonly themeService = inject(ThemeService);

}
