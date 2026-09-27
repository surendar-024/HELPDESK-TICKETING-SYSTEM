package com.surendar.helpdesk.repository;

import com.surendar.helpdesk.entity.Ticket;
import com.surendar.helpdesk.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedById(Long userId);

    List<Ticket> findByAssignedToId(Long agentId);

    List<Ticket> findByStatus(TicketStatus status);
}