package com.nghia.bookingevent.payload.request;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class RegisterReq {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Password is required")
    @Size( min = 6, max = 100)
    private String password;
    @NotBlank
    @Email(message = "Email invalidate")
    private String email;
    @NotBlank(message = "Role is required")
    private String role;
}
