package com.helpdesk.controller;

import java.util.List;
import com.helpdesk.dto.CriarChamadoRequest;
import com.helpdesk.model.Chamado;
import com.helpdesk.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {
    private final ChamadoService service;
    public ChamadoController(ChamadoService service) { this.service = service; }

    @GetMapping
    public List<Chamado> listar() { return service.listar(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Chamado criar(@Valid @RequestBody CriarChamadoRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}/assumir")
    public Chamado assumir(@PathVariable Long id, @RequestParam Long tecnicoId) {
        return service.assumir(id, tecnicoId);
    }

    @PutMapping("/{id}/concluir")
    public Chamado concluir(@PathVariable Long id) { return service.concluir(id); }
}
