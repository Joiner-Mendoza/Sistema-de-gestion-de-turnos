package com.example.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_cambio")
public class SolicitudCambio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID del turno que se desea cambiar
    private Long turnoId;

    // ID del empleado que solicita el cambio
    private Long empleadoId;

    // 🆕 Tipo de solicitud (Mapeado desde React: "CAMBIO_TURNO", "REPROGRAMACION", "PERMISO")
    private String tipoSolicitud;

    // Motivo de la solicitud (Obligatorio en tu formulario)
    @Column(length = 500, nullable = false)
    private String motivo;

    // 🆕 Fecha propuesta por el empleado (Mapeado desde React input type="date")
    private LocalDate fechaPropuesta;

    // 🆕 Comentario adicional opcional (Mapeado desde React)
    @Column(length = 500)
    private String comentario;

    // Estado de la solicitud: PENDIENTE, APROBADA (o ACEPTADO), RECHAZADA
    private String estado;

    // Recomendación de RRHH
    @Column(length = 500)
    private String observacionRrhh;

    // Observación final del gerente
    @Column(length = 500)
    private String observacionGerente;

    // Fecha en la que se creó la solicitud
    private LocalDateTime createdAt;

    // Fecha de última actualización
    private LocalDateTime updatedAt;

    // ==========================================
    // MÉTODOS AUTOMÁTICOS DE FECHA Y ESTADO
    // ==========================================
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estado == null || estado.isEmpty()) {
            estado = "PENDIENTE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==========================================
    // GETTERS Y SETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTurnoId() {
        return turnoId;
    }

    public void setTurnoId(Long turnoId) {
        this.turnoId = turnoId;
    }

    public Long getEmpleadoId() {
        return empleadoId;
    }

    public void setEmpleadoId(Long empleadoId) {
        this.empleadoId = empleadoId;
    }

    public String getTipoSolicitud() {
        return tipoSolicitud;
    }

    public void setTipoSolicitud(String tipoSolicitud) {
        this.tipoSolicitud = tipoSolicitud;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDate getFechaPropuesta() {
        return fechaPropuesta;
    }

    public void setFechaPropuesta(LocalDate fechaPropuesta) {
        this.fechaPropuesta = fechaPropuesta;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservacionRrhh() {
        return observacionRrhh;
    }

    public void setObservacionRrhh(String observacionRrhh) {
        this.observacionRrhh = observacionRrhh;
    }

    public String getObservacionGerente() {
        return observacionGerente;
    }

    public void setObservacionGerente(String observacionGerente) {
        this.observacionGerente = observacionGerente;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}