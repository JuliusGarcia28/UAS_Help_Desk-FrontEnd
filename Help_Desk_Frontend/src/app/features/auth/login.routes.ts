import { routes } from "../../app.routes";
import { Login } from "./login/login";
import { Register } from "./register/register";
import { ChangePassword } from "./change-password/change-password";

export const loginRoutes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'change-password',
        component: ChangePassword
    },
];