package com.surendar.helpdesk.controller;

import com.surendar.helpdesk.dto.RegisterRequest;
import com.surendar.helpdesk.dto.UserResponse;
import com.surendar.helpdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
     * ADMIN ONLY
     *
     * Create employee, agent, or admin.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(
            @Valid @RequestBody RegisterRequest request) {

        return userService.createUser(request);
    }

    /*
     * ADMIN ONLY
     *
     * Get all users.
     */
    @GetMapping
    public List<UserResponse> getAllUsers() {

        return userService.getAllUsers();
    }

    /*
     * ADMIN ONLY
     *
     * Get user by ID.
     */
    @GetMapping("/{id}")
    public UserResponse getUserById(
            @PathVariable Long id) {

        return userService.getUserById(id);
    }
}