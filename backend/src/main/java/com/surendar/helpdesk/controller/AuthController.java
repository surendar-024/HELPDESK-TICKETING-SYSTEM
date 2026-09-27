package com.surendar.helpdesk.controller;

import com.surendar.helpdesk.dto.LoginRequest;
import com.surendar.helpdesk.dto.LoginResponse;
import com.surendar.helpdesk.dto.RegisterRequest;
import com.surendar.helpdesk.dto.UserResponse;
import com.surendar.helpdesk.service.AuthService;
import com.surendar.helpdesk.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(
            AuthService authService,
            UserService userService) {

        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    @PostMapping("/register")
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return userService.registerEmployee(request);
    }
}