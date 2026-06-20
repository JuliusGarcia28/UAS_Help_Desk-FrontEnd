import { routes } from "../../app.routes";
import { Login } from "./login/login";
import { ActivateAccountComponent } from "./activate-account/activate-account";
import { ResetPasswordComponent } from "./reset-password/reset-password";
import { ForgotPassword } from "./forgot-password/forgot-password";

export const loginRoutes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'activate-account',
        component: ActivateAccountComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'forgot-password',
        component: ForgotPassword
    }
];