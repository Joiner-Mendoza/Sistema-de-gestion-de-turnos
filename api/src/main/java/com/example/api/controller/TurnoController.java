package com.example.api.controller;

import com.example.api.model.Turno;
import com.example.api.repository.TurnoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/turno")
public class TurnoController {

    @Autowired
    private TurnoRepository turnoRepository;

    // ==========================================
    // OBTENER TODOS LOS TURNOS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Turno>> getAllTurnos() {
        List<Turno> listaTurnos = turnoRepository.findAll();
        System.out.println(">>> TURNOS ENCONTRADOS EN BD: "+ listaTurnos.size());
        return ResponseEntity.ok(listaTurnos);
    }
    // ==========================================
    // POST PARA NUEVO TURNO
    // ==========================================
    @PostMapping
    public ResponseEntity <Turno> registrarNuevoTurno(@RequestBody Turno nuevoTurno){
     Turno turnoGuardado = turnoRepository.save(nuevoTurno);
     return new ResponseEntity<>(turnoGuardado, HttpStatus.CREATED);
    }


    // ==========================================
    // ACTUALIZAR ESTADO DEL TURNO
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<Turno> actualizarTurno(
            @PathVariable Long id,
            @RequestBody Turno datosActualizados
    ) {

        return turnoRepository.findById(id).map(turno -> {
            // Actualizamos estado
            turno.setState(datosActualizados.getState());
            // Actualizamos observación
            turno.setObservation(datosActualizados.getObservation());
            // Si es ACEPTADO => asistencia true
            turno.setConfirm("ACEPTADO".equals(datosActualizados.getState())
            );
            Turno actualizado = turnoRepository.save(turno);
            return ResponseEntity.ok(actualizado);
        }).orElse(ResponseEntity.notFound().build());
    }
}