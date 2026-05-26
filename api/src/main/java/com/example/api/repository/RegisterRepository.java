package com.example.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.api.model.Register;

// para el login
import  java.util.Optional;



public interface RegisterRepository extends JpaRepository<Register, Long> {
    Optional<Register> findByNumIdentificacion(String numIdentificacion);

}