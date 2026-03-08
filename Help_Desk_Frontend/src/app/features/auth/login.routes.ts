import { routes } from "../../app.routes";
import { Login } from "./login/login";
import { Register } from "./register/register";

export const loginRoutes = [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
];