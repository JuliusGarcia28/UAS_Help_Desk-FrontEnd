import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
