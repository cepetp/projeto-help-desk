package com.helpdesk.service;

import java.time.LocalDateTime;
import java.util.List;
import com.helpdesk.dto.CriarChamadoRequest;
import com.helpdesk.model.*;
import com.helpdesk.repository.ChamadoRepository;
import com.helpdesk.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChamadoService {
    private final ChamadoRepository chamados;
    private final UsuarioRepository usuarios;

    public ChamadoService(ChamadoRepository chamados, UsuarioRepository usuarios) {
        this.chamados = chamados;
        this.usuarios = usuarios;
    }

    public List<Chamado> listar() {
        return chamados.findAllByOrderByDataCriacaoDesc();
    }

    public Chamado criar(CriarChamadoRequest request) {
        Usuario cliente = usuarios.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente não encontrado"));
        if (cliente.getPerfil() != Perfil.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário selecionado não é cliente");
        }
        Chamado chamado = new Chamado();
        chamado.setTitulo(request.titulo().trim());
        chamado.setDescricao(request.descricao().trim());
        chamado.setClienteId(cliente.getId());
        chamado.setStatus(StatusChamado.ABERTO);
        chamado.setDataCriacao(LocalDateTime.now());
        return chamados.save(chamado);
    }

    public Chamado assumir(Long id, Long tecnicoId) {
        Chamado chamado = buscar(id);
        Usuario tecnico = usuarios.findById(tecnicoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Técnico não encontrado"));
        if (tecnico.getPerfil() != Perfil.TECNICO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O usuário selecionado não é técnico");
        }
        if (chamado.getStatus() != StatusChamado.ABERTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Somente chamados abertos podem ser assumidos");
        }
        chamado.setTecnicoId(tecnicoId);
        chamado.setStatus(StatusChamado.EM_ATENDIMENTO);
        return chamados.save(chamado);
    }

    public Chamado concluir(Long id) {
        Chamado chamado = buscar(id);
        if (chamado.getStatus() != StatusChamado.EM_ATENDIMENTO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Somente chamados em atendimento podem ser concluídos");
        }
        chamado.setStatus(StatusChamado.CONCLUIDO);
        return chamados.save(chamado);
    }

    private Chamado buscar(Long id) {
        return chamados.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chamado não encontrado"));
    }
}
