package com.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CriarChamadoRequest(
        @NotBlank @Size(max = 150) String titulo,
        @NotBlank String descricao,
        @NotNull Long clienteId) {
}
