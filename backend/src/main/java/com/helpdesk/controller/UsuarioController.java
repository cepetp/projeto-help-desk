package com.helpdesk.controller;

import java.util.List;
import com.helpdesk.model.Perfil;
import com.helpdesk.model.Usuario;
import com.helpdesk.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioRepository repository;
    public UsuarioController(UsuarioRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Usuario> listar(@RequestParam(required = false) Perfil perfil) {
        return perfil == null ? repository.findAll() : repository.findByPerfilOrderByNomeAsc(perfil);
    }
}
