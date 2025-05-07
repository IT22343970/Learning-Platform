package com.example.backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.backend.service.CustomUserDetailsService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public UserDetailsService userDetailsService() {
                return new CustomUserDetailsService();
        }

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(userDetailsService());
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .httpBasic(Customizer.withDefaults())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**").permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers("/error").permitAll()
                                                .requestMatchers("/api/auth/register").permitAll() // Explicitly permit
                                                                                                   // registration
                                                .requestMatchers("/api/auth/login").permitAll() // Explicitly permit
                                                                                                // login
                                                .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") // Secure
                                                                                                             // admin
                                                                                                             // endpoints
                                                .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/**",
                                                                "/api/media/**")
                                                .permitAll()
                                                .requestMatchers("/api/reactions", "/api/reactions/**").permitAll() // Changed
                                                                                                                    // this
                                                                                                                    // line
                                                                                                                    // to
                                                                                                                    // allow
                                                                                                                    // all
                                                                                                                    // reaction
                                                                                                                    // endpoints
                                                .requestMatchers(HttpMethod.GET, "/api/reactions/post/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/reactions/user").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/reactions").permitAll()
                                                .requestMatchers(HttpMethod.DELETE, "/api/reactions").permitAll()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setContentType("application/json");
                                                        response.setStatus(403);
                                                        response.getWriter().write(
                                                                        "{\"error\":\"Access denied\",\"message\":\"" +
                                                                                        authException.getMessage()
                                                                                                        .replace("\"", "'")
                                                                                        + "\"}");
                                                }));

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "http://localhost:3002"));
                configuration.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "Origin",
                                "X-Requested-With",
                                "Access-Control-Request-Method",
                                "Access-Control-Request-Headers",
                                "Cache-Control",
                                "Pragma",
                                "If-Modified-Since",
                                "If-None-Match"));
                configuration.setExposedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Disposition",
                                "Access-Control-Allow-Origin",
                                "Access-Control-Allow-Methods",
                                "Access-Control-Allow-Headers",
                                "Access-Control-Allow-Credentials",
                                "Access-Control-Expose-Headers",
                                "Content-Type",
                                "Content-Length",
                                "Cache-Control",
                                "ETag",
                                "X-Total-Count", // Add these headers for reaction counts
                                "X-Response-Time",
                                "Access-Control-Expose-Headers"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}