package com.example.demo.proto.constant;

import java.io.Serializable;

/**
 * @author duynt on 10/8/21
 */
public class DemoGrpcPrincipal implements Serializable {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private Long schoolId;
    private boolean authenticated;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Long getSchoolId() {
        return schoolId;
    }

    public void setSchoolId(Long schoolId) {
        this.schoolId = schoolId;
    }

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();

        sb.append("\n=================================\n");

        sb.append("User ID: ").append(userId).append("\n");
        sb.append("Role: ").append(role).append("\n");

        sb.append("=================================");

        return sb.toString();
    }
}