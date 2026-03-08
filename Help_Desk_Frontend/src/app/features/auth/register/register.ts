import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../login/login.css'
})
export class Register {

  name:string = '';
  email:string = '';
  password:string = '';
  confirmPassword:string = '';

  register(){
    console.log("Registro:", this.name, this.email);
  }

}