import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TicketRequest,
  TicketService
} from '../../core/services/ticket';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.css'
})
export class TicketCreate {

  private ticketService = inject(TicketService);
  private router = inject(Router);

  title = '';
  description = '';
  category = 'SOFTWARE';
  priority = 'MEDIUM';

  loading = false;
  errorMessage = '';

  createTicket(): void {
    this.errorMessage = '';

    if (!this.title.trim() || !this.description.trim()) {
      this.errorMessage = 'Please enter a title and description.';
      return;
    }

    const request: TicketRequest = {
      title: this.title.trim(),
      description: this.description.trim(),
      category: this.category,
      priority: this.priority
    };

    this.loading = true;

    this.ticketService.createTicket(request).subscribe({
      next: (ticket) => {
        this.loading = false;
        this.router.navigate(['/tickets', ticket.id]);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
          this.errorMessage = 'You are not allowed to create tickets.';
        } else {
          this.errorMessage = 'Unable to create the ticket. Please try again.';
        }
      }
    });
  }
}