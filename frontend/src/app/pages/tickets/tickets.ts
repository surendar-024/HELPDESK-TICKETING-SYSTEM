import {
  Component,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  Ticket,
  TicketService
} from '../../core/services/ticket';

import {
  User,
  UserService
} from '../../core/services/user';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets {

  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  tickets: Ticket[] = [];
  agents: User[] = [];

  loading = true;
  loadingAgents = false;

  errorMessage = '';
  assignmentMessage = '';
  assignmentError = '';

  assigningTicketId: number | null = null;

  userName =
    this.authService.getName() ?? 'User';

  userRole =
    this.authService.getRole() ?? '';

  ngOnInit(): void {

    console.log('Tickets page initialized');
    console.log('User:', this.userName);
    console.log('Role:', this.userRole);

    this.loadTickets();

    if (this.isAdmin) {
      this.loadAgents();
    }
  }

  get pageTitle(): string {

    if (this.userRole === 'AGENT') {
      return 'Assigned Tickets';
    }

    if (this.userRole === 'ADMIN') {
      return 'All Tickets';
    }

    return 'My Tickets';
  }

  get pageDescription(): string {

    if (this.userRole === 'AGENT') {
      return 'Tickets assigned to you for support and resolution.';
    }

    if (this.userRole === 'ADMIN') {
      return 'View and manage all support tickets.';
    }

    return 'View and manage the support tickets you created.';
  }

  get isEmployee(): boolean {
    return this.userRole === 'EMPLOYEE';
  }

  get isAgent(): boolean {
    return this.userRole === 'AGENT';
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  loadTickets(): void {

    console.log('Starting ticket request...');

    this.loading = true;
    this.errorMessage = '';

    this.ticketService.getTickets().subscribe({

      next: (tickets) => {

        console.log('Tickets received:', tickets);

        this.tickets = tickets ?? [];

        this.loading = false;
        this.errorMessage = '';

        console.log(
          'Ticket count:',
          this.tickets.length
        );

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {

        console.error(
          'Ticket request failed:',
          error
        );

        this.loading = false;

        if (error.status === 401) {

          this.errorMessage =
            'Your session has expired. Please log in again.';

        } else if (error.status === 403) {

          this.errorMessage =
            'You are not authorized to view tickets.';

        } else {

          this.errorMessage =
            'Unable to load tickets. Please try again.';
        }

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadAgents(): void {

    this.loadingAgents = true;

    this.userService.getAgents().subscribe({

      next: (agents) => {

        console.log('Agents received:', agents);

        this.agents = agents ?? [];
        this.loadingAgents = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load agents:',
          error
        );

        this.agents = [];
        this.loadingAgents = false;

        this.assignmentError =
          'Unable to load support agents.';

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  assignTicket(
    ticket: Ticket,
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    const agentId =
      Number(select.value);

    if (!agentId) {
      return;
    }

    this.assigningTicketId = ticket.id;
    this.assignmentMessage = '';
    this.assignmentError = '';

    this.ticketService
      .assignTicket(ticket.id, agentId)
      .subscribe({

        next: (updatedTicket) => {

          console.log(
            'Ticket assigned:',
            updatedTicket
          );

          const index =
            this.tickets.findIndex(
              t => t.id === ticket.id
            );

          if (index !== -1) {
            this.tickets[index] =
              updatedTicket;
          }

          this.assigningTicketId = null;

          this.assignmentMessage =
            `Ticket #${ticket.id} assigned successfully.`;

          this.changeDetectorRef.detectChanges();

          setTimeout(() => {

            this.assignmentMessage = '';

            this.changeDetectorRef.detectChanges();

          }, 3000);
        },

        error: (error) => {

          console.error(
            'Ticket assignment failed:',
            error
          );

          this.assigningTicketId = null;

          if (error.status === 403) {

            this.assignmentError =
              'You are not authorized to assign tickets.';

          } else if (error.status === 404) {

            this.assignmentError =
              'Ticket or agent was not found.';

          } else {

            this.assignmentError =
              'Unable to assign the ticket. Please try again.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }
}