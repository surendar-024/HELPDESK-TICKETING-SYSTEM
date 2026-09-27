import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {

  private authService = inject(AuthService);
  private router = inject(Router);

  name = this.authService.getName() ?? 'User';
  role = this.authService.getRole() ?? '';

  get roleLabel(): string {
    switch (this.role) {
      case 'ADMIN':
        return 'Administrator';

      case 'AGENT':
        return 'Support Agent';

      case 'EMPLOYEE':
        return 'Employee';

      default:
        return 'User';
    }
  }

  get dashboardDescription(): string {
    switch (this.role) {
      case 'ADMIN':
        return 'Manage support tickets, assign agents, and monitor help desk activity.';

      case 'AGENT':
        return 'View your assigned support tickets and update their status.';

      case 'EMPLOYEE':
        return 'Create support requests and track the tickets you have submitted.';

      default:
        return 'Access your IT Help Desk workspace.';
    }
  }

  get ticketCardTitle(): string {
    if (this.role === 'ADMIN') {
      return 'All Tickets';
    }

    if (this.role === 'AGENT') {
      return 'Assigned Tickets';
    }

    return 'My Tickets';
  }

  get ticketCardDescription(): string {
    if (this.role === 'ADMIN') {
      return 'View and manage all support tickets.';
    }

    if (this.role === 'AGENT') {
      return 'View tickets assigned to you.';
    }

    return 'View and track your support requests.';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}