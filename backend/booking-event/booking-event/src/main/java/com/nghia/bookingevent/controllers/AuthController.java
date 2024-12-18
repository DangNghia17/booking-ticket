package com.nghia.bookingevent.controllers;

import com.nghia.bookingevent.Implement.IAuthService;
import com.nghia.bookingevent.exception.AppException;
import com.nghia.bookingevent.models.account.Account;
import com.nghia.bookingevent.payload.request.*;
import com.nghia.bookingevent.payload.response.ResponseObject;

import com.nghia.bookingevent.security.jwt.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@RestController
@AllArgsConstructor
@RequestMapping(path = "/api")
public class AuthController {
    private final JwtTokenProvider jwtUtils;
    private  final IAuthService iAuthService;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginReq loginReq) {
        return iAuthService.login(loginReq);
    }
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterReq registerReq) {
        return iAuthService.registerUser(registerReq);
    }
    @PostMapping("/auth/forget")
    public ResponseEntity<?> forgetPassword(@Valid @RequestBody EmailReq emailReq) {
        return iAuthService.forgetPassword(emailReq);
    }
    @PostMapping("/auth/verifyOTP")
    public ResponseEntity<?> verifyOTP(@Valid @RequestBody VerifyOTPReq verifyOTPReq) {
        return iAuthService.verifyOTP(verifyOTPReq);
    }
    @PostMapping("/auth/verifyChangePassword")
    public ResponseEntity<?> verifyChangePassword(@Valid @RequestBody LoginReq loginReq) {
        return iAuthService.verifyChangePassword(loginReq);
    }
    @PostMapping("/auth/generateNewPassword")
    public ResponseEntity<?> generateNewPassword(@Valid @RequestBody EmailReq emailReq) {
        return iAuthService.generateNewPassword(emailReq.getEmail());
    }
    @PostMapping("/account/changePassword/{id}")
    public ResponseEntity<?> changePassword(@PathVariable String id, 
                                          @Valid @RequestBody ChangePasswordReq changePasswordReq, 
                                          HttpServletRequest request) {
        try {
            Account account = jwtUtils.getGmailFromJWT(jwtUtils.getJwtFromHeader(request));
            
            if(account.getId().equals(id)) {
                return iAuthService.changePassword(changePasswordReq);
            }
            throw new AppException(HttpStatus.FORBIDDEN.value(), "You don't have permission! Token is invalid");
        } catch (Exception e) {
            log.error("Error changing password: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ResponseObject(false, "Error changing password: " + e.getMessage(), null, 500));
        }
    }

}
