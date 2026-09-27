package com.surendar.helpdesk.service;

import com.surendar.helpdesk.dto.CommentRequest;
import com.surendar.helpdesk.dto.CommentResponse;
import com.surendar.helpdesk.entity.Comment;
import com.surendar.helpdesk.entity.Role;
import com.surendar.helpdesk.entity.Ticket;
import com.surendar.helpdesk.entity.User;
import com.surendar.helpdesk.repository.CommentRepository;
import com.surendar.helpdesk.repository.TicketRepository;
import com.surendar.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(
            CommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse addComment(
            Long ticketId,
            CommentRequest request,
            String userEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateTicketAccess(ticket, user);

        Comment comment = new Comment();
        comment.setMessage(request.getMessage());
        comment.setTicket(ticket);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);

        return convertToResponse(savedComment);
    }

    public List<CommentResponse> getCommentsByTicket(
            Long ticketId,
            String userEmail) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateTicketAccess(ticket, user);

        return commentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private void validateTicketAccess(Ticket ticket, User user) {

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (user.getRole() == Role.AGENT) {

            if (ticket.getAssignedTo() == null ||
                    !ticket.getAssignedTo().getId().equals(user.getId())) {

                throw new RuntimeException(
                        "You are not allowed to access this ticket"
                );
            }

            return;
        }

        if (user.getRole() == Role.EMPLOYEE) {

            if (ticket.getCreatedBy() == null ||
                    !ticket.getCreatedBy().getId().equals(user.getId())) {

                throw new RuntimeException(
                        "You are not allowed to access this ticket"
                );
            }

            return;
        }

        throw new RuntimeException(
                "You are not allowed to access this ticket"
        );
    }

    private CommentResponse convertToResponse(Comment comment) {

        return new CommentResponse(
                comment.getId(),
                comment.getMessage(),
                comment.getUser().getId(),
                comment.getUser().getName(),
                comment.getTicket().getId(),
                comment.getCreatedAt()
        );
    }
}