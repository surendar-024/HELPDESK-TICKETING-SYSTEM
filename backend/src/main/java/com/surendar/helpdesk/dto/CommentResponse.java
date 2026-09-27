package com.surendar.helpdesk.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String message;
    private Long userId;
    private String userName;
    private Long ticketId;
    private LocalDateTime createdAt;

    public CommentResponse() {
    }

    public CommentResponse(
            Long id,
            String message,
            Long userId,
            String userName,
            Long ticketId,
            LocalDateTime createdAt) {

        this.id = id;
        this.message = message;
        this.userId = userId;
        this.userName = userName;
        this.ticketId = ticketId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}