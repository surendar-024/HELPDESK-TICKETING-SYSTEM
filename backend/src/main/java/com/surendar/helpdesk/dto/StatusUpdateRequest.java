package com.surendar.helpdesk.dto;

import com.surendar.helpdesk.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    public StatusUpdateRequest() {
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}