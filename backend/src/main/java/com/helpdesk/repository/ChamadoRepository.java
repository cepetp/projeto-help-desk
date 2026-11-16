package com.helpdesk.repository;

import java.util.List;
import com.helpdesk.model.Chamado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChamadoRepository extends JpaRepository<Chamado, Long> {
    List<Chamado> findAllByOrderByDataCriacaoDesc();
}
