CREATE DATABASE IF NOT EXISTS helpdesk_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helpdesk_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  perfil VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS chamados (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ABERTO',
  data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cliente_id BIGINT NOT NULL,
  tecnico_id BIGINT NULL,
  CONSTRAINT fk_chamado_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  CONSTRAINT fk_chamado_tecnico FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

-- Usuários fictícios para demonstração. Os INSERTs evitam duplicar os e-mails.
INSERT INTO usuarios (nome, email, perfil)
VALUES ('Maria Cliente', 'maria@exemplo.com', 'CLIENTE')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO usuarios (nome, email, perfil)
VALUES ('Ana Técnica', 'ana@exemplo.com', 'TECNICO')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
