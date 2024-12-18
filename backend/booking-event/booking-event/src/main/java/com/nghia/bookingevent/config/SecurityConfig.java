package com.nghia.bookingevent.config;

import com.nghia.bookingevent.common.Constants;
import com.nghia.bookingevent.filters.AuthTokenFilter;
import com.nghia.bookingevent.security.jwt.JwtAuthenticationEntryPoint;
import com.nghia.bookingevent.security.oauth.CustomOAuth2UserService;
import com.nghia.bookingevent.security.oauth.handlers.Failure;
import com.nghia.bookingevent.security.oauth.handlers.Success;
import com.nghia.bookingevent.security.user.MyUserDetailsService;
import lombok.AllArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;



@EnableGlobalMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true
)
@Configuration
@EnableWebSecurity
@AllArgsConstructor

public class SecurityConfig {

    private final MyUserDetailsService customUserDetailService;


    private final JwtAuthenticationEntryPoint unauthorizedHandler;
    private final CustomOAuth2UserService oauthUserService;
    private final Success successHandler;

    private final String[] ALLOWED_LIST_URLS = {
            "/oauth2/authorization/**",
            "/login/oauth2/code/*",
            "/oauth2/**",
            "/api/auth/**",
            // System
            "/login/**",
            "/payment/**",
            "/api/payment/**",
            //"/api/form/organization",
            // SwaggerUI
            "/v2/api-docs",
            "/swagger-resources",
            "/swagger-resources/**",
            "/configuration/ui",
            "/configuration/security",
            "/swagger-ui.html",
            "/webjars/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/ws/**",
            "/users/feign",
            "/api/restTemplate/event/**",
            "/api/account/changePassword/**",
            "/api/customer/availability/order/**"
    };

    private final String[] ALLOWED_GET_LIST_URLS = {
            "/api/review/**",
            "/api/event/**",
            "/api/account/findAll",
            "/api/account/findAccount",
            "/api/customer/findAll",
            "/api/order/**",
            "/api/category/**",
            "/api/ticket/**",
            "/api/organization/findAll",
            //"/api/organization/test/**",
            "/api/organization",
            "/api/email/organization/**",
            "/api/admin/**"
    };
    private final String[] ALLOWED_POST_LIST_URLS = {
            "/api/form/organization"
    };
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeRequests().antMatchers(ALLOWED_LIST_URLS).permitAll()
                .and()
                .authorizeRequests().antMatchers( HttpMethod.GET,ALLOWED_GET_LIST_URLS).permitAll()
                .and()
                .authorizeRequests().antMatchers(HttpMethod.POST,ALLOWED_POST_LIST_URLS).permitAll()
                .and()
                .authorizeRequests().antMatchers("/api/admin/**").hasAuthority(Constants.ROLE_ADMIN)
                .and()
                .authorizeRequests().antMatchers("/api/customer/**").hasAuthority(Constants.ROLE_USER)
                .and()
                .authorizeRequests().antMatchers("/api/organization/**").hasAuthority(Constants.ROLE_ORGANIZATION)
                .and()
                .authorizeRequests().antMatchers("/api/account/**").hasAnyAuthority(Constants.ROLE_USER,Constants.ROLE_ORGANIZATION)
                .and()
                .authorizeRequests().antMatchers("/api/account/changePassword/**").authenticated()
                .anyRequest().authenticated()
                .and()
                .oauth2Login()
                    .authorizationEndpoint()
                        .baseUri("/oauth2/authorization")
                    .and()
                    .redirectionEndpoint()
                        .baseUri("/login/oauth2/code/*")
                    .and()
                    .userInfoEndpoint()
                        .userService(oauthUserService)
                    .and()
                    .successHandler(successHandler)
                    .failureHandler(authenticationFailureHandler())
                ;

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }


    @Bean
    public AuthenticationManager authenticationManager (
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean(name = "changePassword")
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        final DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        authProvider.setUserDetailsService(customUserDetailService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }
    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return new Failure();
    }


}


