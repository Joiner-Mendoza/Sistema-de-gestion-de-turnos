package com.example.api.controller;
import com.example.api.model.Register;
import com.example.api.repository.RegisterRepository;
import com.example.api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")

public class LoginController {

    @Autowired
    private RegisterRepository registerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")  //Creamos el mapping para la ruta de inicio de secion
    public ResponseEntity<?> login(@RequestBody Register loginData) {

        Optional<Register> userOptional =
                registerRepository.findByNumIdentificacion(loginData.getNumIdentificacion());

        //  usuario no existe
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }

        Register user = userOptional.get();
        //  contraseña incorrecta
        if (!passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Credenciales incorrectas");
        }

        //  generar token
        String token = jwtUtil.generateToken(user.getNumIdentificacion());

        //  respuesta
        return ResponseEntity.ok(
                java.util.Map.of("token", token, "user",user )// pasamos el usuario y el token
        );
    }
}