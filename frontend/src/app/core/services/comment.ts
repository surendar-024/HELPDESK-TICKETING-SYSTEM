import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: number;
  message: string;
  userId: number;
  userName: string;
  ticketId: number;
  createdAt: string;
}

export interface CommentRequest {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = 'http://localhost:8080/api/tickets';

  constructor(private http: HttpClient) {}

  getComments(ticketId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiUrl}/${ticketId}/comments`
    );
  }

  addComment(
    ticketId: number,
    request: CommentRequest
  ): Observable<Comment> {

    return this.http.post<Comment>(
      `${this.apiUrl}/${ticketId}/comments`,
      request
    );
  }
}