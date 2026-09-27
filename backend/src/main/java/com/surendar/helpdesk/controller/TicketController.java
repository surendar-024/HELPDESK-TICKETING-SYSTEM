package com.surendar.helpdesk.controller;

import com.surendar.helpdesk.dto.StatusUpdateRequest;
import com.surendar.helpdesk.dto.TicketRequest;
import com.surendar.helpdesk.dto.TicketResponse;
import com.surendar.helpdesk.dto.TicketUpdateRequest;
import com.surendar.helpdesk.entity.TicketStatus;
import com.surendar.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(
            @Valid @RequestBody TicketRequest request,
            Authentication authentication) {

        return ticketService.createTicket(
                request,
                authentication.getName()
        );
    }

    @GetMapping
    public List<TicketResponse> getTickets(
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_EMPLOYEE");

        role = role.replace("ROLE_", "");

        return ticketService.getTicketsForUser(
                authentication.getName(),
                role
        );
    }

    @GetMapping("/{id}")
    public TicketResponse getTicketById(
            @PathVariable Long id,
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_EMPLOYEE");

        role = role.replace("ROLE_", "");

        return ticketService.getTicketByIdForUser(
                id,
                authentication.getName(),
                role
        );
    }

    @GetMapping("/user/{userId}")
    public List<TicketResponse> getTicketsByUser(
            @PathVariable Long userId) {

        return ticketService.getTicketsByUser(userId);
    }

    @GetMapping("/status/{status}")
    public List<TicketResponse> getTicketsByStatus(
            @PathVariable TicketStatus status) {

        return ticketService.getTicketsByStatus(status);
    }

    @PutMapping("/{id}")
    public TicketResponse updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketUpdateRequest request,
            Authentication authentication) {

        return ticketService.updateTicket(
                id,
                request,
                authentication.getName()
        );
    }

    @PutMapping("/{id}/cancel")
    public TicketResponse cancelTicket(
            @PathVariable Long id,
            Authentication authentication) {

        return ticketService.cancelTicket(
                id,
                authentication.getName()
        );
    }

    @PutMapping("/{id}/assign/{agentId}")
    public TicketResponse assignTicket(
            @PathVariable Long id,
            @PathVariable Long agentId) {

        return ticketService.assignTicket(id, agentId);
    }

    @PutMapping("/{id}/status")
    public TicketResponse updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {

        return ticketService.updateTicketStatus(id, request);
    }
}