package com.surendar.helpdesk.service;

import com.surendar.helpdesk.dto.StatusUpdateRequest;
import com.surendar.helpdesk.dto.TicketRequest;
import com.surendar.helpdesk.dto.TicketResponse;
import com.surendar.helpdesk.dto.TicketUpdateRequest;
import com.surendar.helpdesk.entity.Role;
import com.surendar.helpdesk.entity.Ticket;
import com.surendar.helpdesk.entity.TicketStatus;
import com.surendar.helpdesk.entity.User;
import com.surendar.helpdesk.repository.TicketRepository;
import com.surendar.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(
            TicketRepository ticketRepository,
            UserRepository userRepository) {

        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public TicketResponse createTicket(
            TicketRequest request,
            String userEmail) {

        User createdBy = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = new Ticket();

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setCreatedBy(createdBy);
        ticket.setStatus(TicketStatus.OPEN);

        Ticket savedTicket = ticketRepository.save(ticket);

        return convertToResponse(savedTicket);
    }

    public List<TicketResponse> getAllTickets() {

        return ticketRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public TicketResponse getTicketByIdForUser(
            Long ticketId,
            String email,
            String role) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        validateTicketAccess(ticket, user, role);

        return convertToResponse(ticket);
    }

    public List<TicketResponse> getTicketsByUser(Long userId) {

        return ticketRepository.findByCreatedById(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {

        return ticketRepository.findByStatus(status)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public TicketResponse updateTicket(
            Long id,
            TicketUpdateRequest request,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Employees can update only their own OPEN tickets.
        // Admins can update any ticket.
        if (user.getRole() == Role.EMPLOYEE) {

            if (ticket.getCreatedBy() == null ||
                    !ticket.getCreatedBy().getId().equals(user.getId())) {

                throw new RuntimeException(
                        "You are not allowed to update this ticket"
                );
            }

            if (ticket.getStatus() != TicketStatus.OPEN) {
                throw new RuntimeException(
                        "Only OPEN tickets can be updated"
                );
            }

        } else if (user.getRole() != Role.ADMIN) {

            throw new RuntimeException(
                    "You are not allowed to update this ticket"
            );
        }

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());

        Ticket updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    public TicketResponse cancelTicket(
            Long id,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Only the employee who created the ticket can cancel it.
        if (user.getRole() != Role.EMPLOYEE ||
                ticket.getCreatedBy() == null ||
                !ticket.getCreatedBy().getId().equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to cancel this ticket"
            );
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new RuntimeException(
                    "Only OPEN tickets can be cancelled"
            );
        }

        ticket.setStatus(TicketStatus.CANCELLED);

        Ticket cancelledTicket = ticketRepository.save(ticket);

        return convertToResponse(cancelledTicket);
    }

    public TicketResponse assignTicket(
            Long ticketId,
            Long agentId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (agent.getRole() != Role.AGENT) {
            throw new RuntimeException("User is not an agent");
        }

        ticket.setAssignedTo(agent);
        ticket.setStatus(TicketStatus.ASSIGNED);

        Ticket updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    public TicketResponse updateTicketStatus(
            Long ticketId,
            StatusUpdateRequest request) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(request.getStatus());

        Ticket updatedTicket = ticketRepository.save(ticket);

        return convertToResponse(updatedTicket);
    }

    public List<TicketResponse> getTicketsForUser(
            String email,
            String role) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Ticket> tickets;

        if ("ADMIN".equals(role)) {

            tickets = ticketRepository.findAll();

        } else if ("AGENT".equals(role)) {

            tickets = ticketRepository.findByAssignedToId(user.getId());

        } else {

            tickets = ticketRepository.findByCreatedById(user.getId());
        }

        return tickets.stream()
                .map(this::convertToResponse)
                .toList();
    }

    private void validateTicketAccess(
            Ticket ticket,
            User user,
            String role) {

        boolean allowed;

        if ("ADMIN".equals(role)) {

            allowed = true;

        } else if ("AGENT".equals(role)) {

            allowed = ticket.getAssignedTo() != null &&
                    ticket.getAssignedTo().getId().equals(user.getId());

        } else {

            allowed = ticket.getCreatedBy() != null &&
                    ticket.getCreatedBy().getId().equals(user.getId());
        }

        if (!allowed) {
            throw new RuntimeException(
                    "You are not allowed to access this ticket"
            );
        }
    }

    private TicketResponse convertToResponse(Ticket ticket) {

        User createdBy = ticket.getCreatedBy();
        User assignedTo = ticket.getAssignedTo();

        return new TicketResponse(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),

                createdBy.getId(),
                createdBy.getName(),

                assignedTo != null ? assignedTo.getId() : null,
                assignedTo != null ? assignedTo.getName() : null,

                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }
}