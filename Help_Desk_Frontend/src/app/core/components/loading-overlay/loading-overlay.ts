import { Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.css'
})
export class LoadingOverlay {

  loadingService = inject(LoadingService);

}