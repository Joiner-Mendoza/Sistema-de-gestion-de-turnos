package com.example.api.controller;

import com.example.api.model.SolicitudCambio;
import com.example.api.repository.SolicitudCambioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/solicitud-cambio")
public class SolicitudCambioController {

    @Autowired
    private SolicitudCambioRepository solicitudCambioRepository;

    // ==========================================
    // OBTENER TODAS LAS SOLICITUDES
    // ==========================================
    @GetMapping
    public ResponseEntity<List<SolicitudCambio>> getAllSolicitudes() {

        List<SolicitudCambio> solicitudes =
                solicitudCambioRepository.findAll();

        return ResponseEntity.ok(solicitudes);
    }

    // ==========================================
    // CREAR SOLICITUD
    // ==========================================
    @PostMapping
    public ResponseEntity<SolicitudCambio> crearSolicitud(
            @RequestBody SolicitudCambio solicitud
    ) {
        SolicitudCambio nuevaSolicitud =
                solicitudCambioRepository.save(solicitud);
        return ResponseEntity.ok(nuevaSolicitud);
    }
    // ==========================================
    // ACTUALIZAR ESTADO
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<SolicitudCambio> actualizarSolicitud(
            @PathVariable Long id,
            @RequestBody SolicitudCambio datosActualizados
    ) {
        return solicitudCambioRepository.findById(id).map(solicitud -> {
            solicitud.setEstado(
                    datosActualizados.getEstado()
            );
            solicitud.setObservacionRrhh(
                    datosActualizados.getObservacionRrhh()
            );
            solicitud.setObservacionGerente(
                    datosActualizados.getObservacionGerente()
            );
            SolicitudCambio actualizada =
                    solicitudCambioRepository.save(solicitud);
            return ResponseEntity.ok(actualizada);
        }).orElse(ResponseEntity.notFound().build());
    }
}