package com.example.api.model;

import jakarta.persistence.*;


@Entity
public class Register {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String lastName;
    private String numIdentificacion;
    private String email;
    private String cellphone;
    private String password;
    //asignamos al rol al nuevo usuario
    @Enumerated (EnumType.STRING)
    private Role role;



    // constructor vacío
    public Register() {}

    // constructor
    public Register(String name, String lastName, String numIdentificacion,
                    String email, String cellphone, String password,Role role) {
        this.name = name;
        this.lastName = lastName;
        this.numIdentificacion = numIdentificacion;
        this.email = email;
        this.cellphone = cellphone;
        this.password = password;
        this.role = role;
    }
    // getters
    public String getName() { return name; }
    public String getLastName() { return lastName; }
    public String getNumIdentificacion() { return numIdentificacion; }
    public String getEmail() { return email; }
    public String getCellphone() { return cellphone; }
    public String getPassword() { return password; }
    public Role getRole() {
        return role;
    }
    // setters
    public void setName(String name) { this.name = name; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setNumIdentificacion(String numIdentificacion) { this.numIdentificacion = numIdentificacion; }
    public void setEmail(String email) { this.email = email; }
    public void setCellphone(String cellphone) { this.cellphone = cellphone; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(Role role) {
        this.role = role;
    }
}