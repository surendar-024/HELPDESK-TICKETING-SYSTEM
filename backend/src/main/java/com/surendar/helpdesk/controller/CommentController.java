package com.surendar.helpdesk.controller;

import com.surendar.helpdesk.dto.CommentRequest;
import com.surendar.helpdesk.dto.CommentResponse;
import com.surendar.helpdesk.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {

        return commentService.addComment(
                ticketId,
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<CommentResponse> getComments(
            @PathVariable Long ticketId,
            Authentication authentication) {

        return commentService.getCommentsByTicket(
                ticketId,
                authentication.getName()
        );
    }
}