import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdById: number;
  createdByName: string;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(
      `${this.apiUrl}/${id}`
    );
  }

  createTicket(
    request: TicketRequest
  ): Observable<Ticket> {
    return this.http.post<Ticket>(
      this.apiUrl,
      request
    );
  }

  updateTicket(
    id: number,
    request: TicketRequest
  ): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  cancelTicket(
    id: number
  ): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    );
  }

  updateStatus(
    id: number,
    status: string
  ): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }

  assignTicket(
    id: number,
    agentId: number
  ): Observable<Ticket> {
    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}/assign/${agentId}`,
      {}
    );
  }
}