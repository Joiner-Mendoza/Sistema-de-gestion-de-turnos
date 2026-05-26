package com.example.api.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(name = "employee_cc")
    private String employeeCc;
    @Column(name = "date_in")
    private LocalDateTime dateIn;
    @Column(name = "date_out")
    private LocalDateTime dateOut;
    private String state;
    private Boolean confirm;
    private String observation;
    @Column(name = "employe_id") // Coincide con tu BD "employe_id"
    private String employeId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructor vacío
    public Turno() {}

    // Constructor con argumentos
    public Turno(String user, LocalDateTime dateIn, LocalDateTime dateOut, String state, Boolean confirm,
                 String observation, String employeId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.employeeCc = employeeCc;
        this.dateIn = dateIn;
        this.dateOut = dateOut;
        this.state = state;
        this.confirm = confirm;
        this.observation = observation;
        this.employeId = employeId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters

    public long getId() { return id; }
    public String getEmployeeCc() {return employeeCc;}
    public LocalDateTime getDateIn() { return dateIn; }
    public LocalDateTime getDateOut() { return dateOut; }
    public String getState() { return state; }
    public Boolean getConfirm() { return confirm; }
    public String getObservation() { return observation; }
    public String getEmployeId() { return employeId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(long id) { this.id = id; }
    public void setEmployeeCc(String employeeCc) {this.employeeCc = employeeCc;}
    public void setDateIn(LocalDateTime dateIn) { this.dateIn = dateIn; }
    public void setDateOut(LocalDateTime dateOut) { this.dateOut = dateOut; }
    public void setState(String state) { this.state = state; }
    public void setConfirm(Boolean confirm) { this.confirm = confirm; }
    public void setObservation(String observation) { this.observation = observation; }
    public void setEmployeId(String employeId) { this.employeId = employeId; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}