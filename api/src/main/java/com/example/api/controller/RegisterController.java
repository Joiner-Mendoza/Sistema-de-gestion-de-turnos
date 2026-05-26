package com.example.api.controller;

import com.example.api.model.Register;
import com.example.api.model.Role;
import com.example.api.repository.RegisterRepository;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RegisterController {

    @Autowired
    private RegisterRepository registerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Register user) {
        System.out.println("ROL RECIBIDO: " + user.getRole());
        // encriptar password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        //asignamos un rol de empleado a los registros por defecto
        if(user.getRole() == null){
            user.setRole(Role.ROLE_EMPLEADO);
        }
        // guardar
        registerRepository.save(user);

        return ResponseEntity.ok("Usuario registrado correctamente");
    }

}