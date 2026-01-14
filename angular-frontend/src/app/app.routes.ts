import { Routes } from '@angular/router';
import { LandingComponent } from './modules/landing/landing.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { AdminpanelComponent } from './modules/adminpanel/adminpanel.component';
import { UserpanelComponent } from './modules/userpanel/userpanel.component';
import { AuthGuard, AdminGuard } from './auth.guard';

export const routes: Routes = [
    {path: "", component: LandingComponent},
    {path: "register", component: RegisterComponent},
    {path: "login", component: LoginComponent},
    {path: "admin-dashboard", component: AdminpanelComponent, canActivate: [AdminGuard] },
    {path: "user-dashboard", component: UserpanelComponent, canActivate: [AuthGuard] }
];
