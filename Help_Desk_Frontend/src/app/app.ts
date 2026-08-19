import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { LoadingOverlay } from './core/components/loading-overlay/loading-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Help_Desk_Frontend';

  constructor(private themeService: ThemeService, private authService: AuthService) {}

  ngOnInit() {

    const access =
    localStorage.getItem('access');

    if(access){

      this.authService
        .loadUser()
        .subscribe({

        next:(user)=>{

         localStorage.setItem(
              'user',
              JSON.stringify(user)
            );
          }
        });
    }
  }
}
