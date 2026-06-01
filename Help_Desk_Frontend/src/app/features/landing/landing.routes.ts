import { Routes } from "@angular/router";
import { Landing } from "./landing/landing";
import { LandingGuard } from "../../core/guards/landing.guard";

export const LandingRoutes: Routes = [
    {
        path: '',
        component: Landing,
        //canActivate: [LandingGuard]
    },
];