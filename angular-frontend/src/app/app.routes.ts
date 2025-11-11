import { Routes } from '@angular/router';
import { LandingComponent } from './modules/landing/landing.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';

export const routes: Routes = [
    {path: "", component: LandingComponent},
    {path: "register", component: RegisterComponent},
    {path: "login", component: LoginComponent}
];
