import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  Ticket,
  TicketRequest,
  TicketService
} from '../../core/services/ticket';

import {
  Comment,
  CommentService
} from '../../core/services/comment';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketDetail {

  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  ticket: Ticket | null = null;
  comments: Comment[] = [];

  commentMessage = '';

  loadingTicket = true;
  loadingComments = true;

  addingComment = false;

  editing = false;
  updating = false;
  cancelling = false;

  changingStatus = false;

  editTitle = '';
  editDescription = '';
  editCategory = 'SOFTWARE';
  editPriority = 'MEDIUM';

  selectedStatus = '';

  errorMessage = '';
  commentError = '';
  updateError = '';
  statusError = '';

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.errorMessage = 'Invalid ticket ID.';
      this.loadingTicket = false;
      this.loadingComments = false;
      return;
    }

    this.loadTicket(id);
    this.loadComments(id);
  }

  get isEmployee(): boolean {
    return this.authService.getRole() === 'EMPLOYEE';
  }

  get isAgentOrAdmin(): boolean {
    const role = this.authService.getRole();

    return role === 'AGENT' || role === 'ADMIN';
  }

  get canEditOrCancel(): boolean {

    return !!this.ticket &&
      this.isEmployee &&
      this.ticket.status === 'OPEN';
  }

  loadTicket(id: number): void {

    this.loadingTicket = true;
    this.errorMessage = '';

    this.ticketService.getTicket(id).subscribe({

      next: ticket => {

        this.ticket = ticket;
        this.loadingTicket = false;

        this.changeDetectorRef.detectChanges();
      },

      error: error => {

        this.loadingTicket = false;

        if (error.status === 403) {
          this.errorMessage =
            'You are not allowed to access this ticket.';
        } else if (error.status === 404) {
          this.errorMessage =
            'Ticket not found.';
        } else {
          this.errorMessage =
            'Unable to load ticket.';
        }

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  loadComments(id: number): void {

    this.loadingComments = true;
    this.commentError = '';

    this.commentService.getComments(id).subscribe({

      next: comments => {

        this.comments = comments;
        this.loadingComments = false;

        this.changeDetectorRef.detectChanges();
      },

      error: error => {

        this.loadingComments = false;

        if (error.status === 403) {
          this.commentError =
            'You are not allowed to view comments for this ticket.';
        } else if (error.status === 404) {
          this.commentError =
            'Ticket not found.';
        } else {
          this.commentError =
            'Unable to load comments.';
        }

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  startEditing(): void {

    if (!this.ticket || !this.canEditOrCancel) {
      return;
    }

    this.editTitle = this.ticket.title;
    this.editDescription = this.ticket.description;
    this.editCategory = this.ticket.category;
    this.editPriority = this.ticket.priority;

    this.updateError = '';
    this.editing = true;
  }

  cancelEditing(): void {

    this.editing = false;
    this.updateError = '';
  }

  updateTicket(): void {

    if (!this.ticket) {
      return;
    }

    this.updateError = '';

    if (!this.editTitle.trim()) {
      this.updateError = 'Please enter a ticket title.';
      return;
    }

    if (!this.editDescription.trim()) {
      this.updateError = 'Please enter a ticket description.';
      return;
    }

    const request: TicketRequest = {

      title: this.editTitle.trim(),

      description: this.editDescription.trim(),

      category: this.editCategory,

      priority: this.editPriority
    };

    this.updating = true;

    this.ticketService
      .updateTicket(this.ticket.id, request)
      .subscribe({

        next: updatedTicket => {

          this.ticket = updatedTicket;

          this.editing = false;
          this.updating = false;
          this.updateError = '';

          this.changeDetectorRef.detectChanges();
        },

        error: error => {

          this.updating = false;

          if (error.status === 403) {

            this.updateError =
              'You are not allowed to update this ticket.';

          } else if (error.status === 400) {

            this.updateError =
              'Please check the ticket details.';

          } else {

            this.updateError =
              'Unable to update the ticket.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  cancelTicket(): void {

    if (!this.ticket || !this.canEditOrCancel) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel this ticket?'
    );

    if (!confirmed) {
      return;
    }

    this.updateError = '';
    this.cancelling = true;

    this.ticketService
      .cancelTicket(this.ticket.id)
      .subscribe({

        next: cancelledTicket => {

          this.ticket = cancelledTicket;

          this.cancelling = false;
          this.updateError = '';

          this.changeDetectorRef.detectChanges();
        },

        error: error => {

          this.cancelling = false;

          if (error.status === 403) {

            this.updateError =
              'You are not allowed to cancel this ticket.';

          } else if (error.status === 400) {

            this.updateError =
              'This ticket cannot be cancelled.';

          } else {

            this.updateError =
              'Unable to cancel the ticket.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  changeStatus(): void {

    if (!this.ticket || !this.selectedStatus) {
      return;
    }

    this.statusError = '';
    this.changingStatus = true;

    this.ticketService
      .updateStatus(this.ticket.id, this.selectedStatus)
      .subscribe({

        next: updatedTicket => {

          this.ticket = updatedTicket;

          this.changingStatus = false;
          this.selectedStatus = '';
          this.statusError = '';

          this.changeDetectorRef.detectChanges();
        },

        error: error => {

          this.changingStatus = false;

          if (error.status === 403) {

            this.statusError =
              'You are not allowed to change this ticket status.';

          } else if (error.status === 400) {

            this.statusError =
              'Invalid status change.';

          } else {

            this.statusError =
              'Unable to update ticket status.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  addComment(): void {

    if (!this.ticket) {
      return;
    }

    this.commentError = '';

    if (!this.commentMessage.trim()) {

      this.commentError =
        'Please enter a comment.';

      return;
    }

    this.addingComment = true;

    this.commentService
      .addComment(
        this.ticket.id,
        {
          message: this.commentMessage.trim()
        }
      )
      .subscribe({

        next: comment => {

          this.comments.push(comment);

          this.commentMessage = '';

          this.addingComment = false;
          this.commentError = '';

          this.changeDetectorRef.detectChanges();
        },

        error: error => {

          this.addingComment = false;

          if (error.status === 403) {

            this.commentError =
              'You are not allowed to comment on this ticket.';

          } else if (error.status === 400) {

            this.commentError =
              'Please enter a valid comment.';

          } else {

            this.commentError =
              'Unable to add comment.';
          }

          this.changeDetectorRef.detectChanges();
        }
      });
  }
}