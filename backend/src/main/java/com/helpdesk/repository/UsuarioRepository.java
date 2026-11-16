package com.helpdesk.repository;

import java.util.List;
import com.helpdesk.model.Perfil;
import com.helpdesk.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findByPerfilOrderByNomeAsc(Perfil perfil);
}
