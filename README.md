# Projeto Integrador — Help Desk Didático

Aplicação web para estudo do fluxo de atendimento de TI: cliente abre chamado, técnico assume e conclui. O projeto mantém a proposta didática do material original (usuários, chamados, API REST, HTML/CSS/JavaScript, Java e Spring Boot), mas organiza o código para execução local e implantação em nuvem.

## Tecnologias
- Java 21 LTS e Spring Boot 3.5.6
- Maven, Spring Web, Spring Data JPA e Bean Validation
- MySQL 8 local ou serviço compatível com protocolo MySQL (ex.: TiDB Cloud Starter)
- HTML5, CSS3 e JavaScript puro
- Hospedagem sugerida: Koyeb (API) + Cloudflare Pages (frontend)

## Estrutura
```text
helpdesk-nuvem/
├── backend/                 # API Spring Boot
├── banco/script_banco.sql   # tabelas e usuários fictícios
├── frontend/                # site estático
└── README.md                # este roteiro
```

## 1. Executar localmente

### Pré-requisitos
- JDK 21 instalado (`java -version`)
- Maven 3.9 ou superior (`mvn -version`)
- MySQL 8 instalado e em execução
- VS Code ou outra IDE

### Banco de dados
No MySQL Workbench, abra e execute `banco/script_banco.sql`. O script cria `helpdesk_db`, as tabelas `usuarios` e `chamados` e dois usuários fictícios:
- Maria Cliente (`CLIENTE`)
- Ana Técnica (`TECNICO`)

O script é compatível com MySQL. Em um serviço compatível, confirme previamente as particularidades de SQL e conexão do provedor.

### Backend
No terminal:
```bash
cd backend
mvn clean package
mvn spring-boot:run
```
API: `http://localhost:8080`
- `GET http://localhost:8080/api/health`
- `GET http://localhost:8080/api/usuarios`
- `GET http://localhost:8080/api/chamados`

Por padrão, a configuração local usa usuário `root` e senha `root123`, conforme o roteiro didático de origem. Altere esses valores para os que você configurou no MySQL, usando variáveis de ambiente `DB_USERNAME` e `DB_PASSWORD`. Não reutilize essa senha em ambientes públicos.

### Frontend
Abra `frontend/js/config.js` e confirme:
```javascript
window.HELPDESK_API_URL = "http://localhost:8080/api";
```
Abra `frontend/index.html` com a extensão Live Server do VS Code. Normalmente o endereço será `http://127.0.0.1:5500` ou `http://localhost:5500`.

## 2. Implantar individualmente para cada aluno/grupo

Cada grupo deve usar seu próprio repositório GitHub, seu próprio serviço de backend, sua própria instância/banco e seu próprio projeto Cloudflare Pages. Isso evita misturar os dados dos grupos. Atenção: as cotas gratuitas variam e podem limitar a quantidade de implantações.

### Etapa A — banco TiDB Cloud
1. Crie uma conta no TiDB Cloud e crie uma instância Starter compatível com MySQL.
2. Selecione uma região e crie as credenciais de conexão.
3. Execute o conteúdo de `banco/script_banco.sql` no editor SQL da instância, se o provedor permitir criação do banco. Se a instância já fornecer um banco pré-criado, ajuste o `USE helpdesk_db` e a URL para o nome disponibilizado.
4. Guarde host, porta, nome do banco, usuário e senha. Não publique esses dados no GitHub.
5. Copie a URL JDBC fornecida/documentada pelo provedor, incluindo parâmetros TLS exigidos. Exemplo apenas ilustrativo:
   `jdbc:mysql://HOST:4000/helpdesk_db?sslMode=VERIFY_IDENTITY`

### Etapa B — repositório GitHub
1. Crie um repositório privado ou público para o grupo.
2. Envie todo o conteúdo desta pasta, mantendo a estrutura.
3. Não envie senhas reais nem arquivos `.env` com segredos.

### Etapa C — backend na Koyeb
1. Crie uma conta Koyeb e conecte o GitHub.
2. Crie um serviço Web a partir do repositório do grupo.
3. Configure a pasta raiz (Root directory) como `backend`.
4. Use o build Maven (`./mvnw` se o wrapper estiver no repositório; caso contrário, a plataforma deve disponibilizar Maven para executar `mvn`). Configure o comando de build `mvn clean package` e o comando de execução `java -jar target/helpdesk-1.0.0.jar`, caso a interface solicite comandos separados.
5. Configure as variáveis de ambiente:
   - `DB_URL` = URL JDBC completa da instância
   - `DB_USERNAME` = usuário do banco
   - `DB_PASSWORD` = senha do banco
   - `CORS_ALLOWED_ORIGINS` = domínio do frontend, por exemplo `https://grupo01.pages.dev`
   - `PORT` = use a porta indicada pela plataforma; a aplicação aceita `PORT` e usa 8080 localmente
6. Faça o deploy e copie a URL pública da API.
7. Teste `https://SEU-BACKEND/api/health` e `https://SEU-BACKEND/api/chamados`.

**Nota operacional:** os planos gratuitos de hospedagem podem suspender/hibernar serviços sem tráfego. A primeira requisição após inatividade pode demorar. Confira sempre os limites atuais do plano antes de iniciar a atividade.

### Etapa D — frontend no Cloudflare Pages
1. Edite `frontend/js/config.js` e troque a URL local pela API pública:
   ```javascript
   window.HELPDESK_API_URL = "https://SEU-BACKEND.koyeb.app/api";
   ```
2. Envie a alteração ao GitHub.
3. No Cloudflare, abra Workers & Pages e crie uma aplicação Pages conectada ao repositório.
4. Configure a branch `main`, diretório de saída `frontend` e comando de build vazio/sem build (site estático). Se a interface exigir comando, use `exit 0`.
5. Publique e copie o domínio `https://SEU-PROJETO.pages.dev`.
6. Volte à Koyeb e ajuste `CORS_ALLOWED_ORIGINS` para o domínio exato do Pages (sem barra final). Faça novo deploy do backend.
7. Abra o site e teste cadastro, listagem, assumir e concluir chamados.

## 3. Endpoints da API

| Método | Rota | Função |
|---|---|---|
| GET | `/api/health` | Verifica se a API está ativa |
| GET | `/api/usuarios` | Lista usuários |
| GET | `/api/usuarios?perfil=CLIENTE` | Lista clientes |
| GET | `/api/usuarios?perfil=TECNICO` | Lista técnicos |
| GET | `/api/chamados` | Lista chamados |
| POST | `/api/chamados` | Abre chamado |
| PUT | `/api/chamados/{id}/assumir?tecnicoId={id}` | Técnico assume chamado |
| PUT | `/api/chamados/{id}/concluir` | Conclui chamado |

Exemplo de corpo para abrir chamado:
```json
{
  "titulo": "Computador não liga",
  "descricao": "O equipamento não inicia ao pressionar o botão.",
  "clienteId": 1
}
```

## 4. Fluxo didático de validação
1. Abra o site público.
2. Selecione Maria Cliente e registre um chamado.
3. Confira o novo chamado na tabela.
4. Selecione Ana Técnica no campo de técnico.
5. Clique em **Assumir**.
6. Clique em **Concluir**.
7. Confira o status final no site e no banco.

## 5. Segurança e limites desta versão
Esta versão é **didática e sem autenticação**. O seletor de cliente/técnico não é login e os endpoints da API são públicos. Qualquer pessoa que descubra o endereço da API poderá consultar e tentar alterar dados. Portanto:
- use apenas informações fictícias e dados de teste;
- não use dados pessoais, senhas ou informações reais de usuários;
- não utilize este código como sistema de produção;
- para uso real, implemente autenticação/autorização (por exemplo, Spring Security), validação de permissões no servidor, limitação de requisições, logs e política de backup;
- não coloque credenciais do banco no frontend ou no repositório;
- restrinja CORS ao domínio correto, lembrando que CORS não substitui autenticação.

## 6. Solução de problemas
- **Erro de conexão com banco:** revise `DB_URL`, host, porta, usuário, senha e parâmetros TLS.
- **Erro 500 ao iniciar:** consulte os logs do backend; confira se as tabelas/usuários foram criados.
- **Erro CORS no navegador:** confira `CORS_ALLOWED_ORIGINS` e use exatamente o domínio do Pages.
- **Site abre, mas não lista dados:** confira `frontend/js/config.js` e teste `/api/health` diretamente.
- **Primeiro acesso lento:** o serviço gratuito pode estar acordando após período sem uso.

