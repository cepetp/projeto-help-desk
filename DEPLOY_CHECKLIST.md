# Checklist de publicação — um por grupo

## Banco
- [ ] Instância criada
- [ ] Script SQL executado
- [ ] Usuário e senha guardados fora do GitHub
- [ ] URL JDBC com TLS conferida

## GitHub
- [ ] Repositório do grupo criado
- [ ] Pastas `backend`, `frontend` e `banco` enviadas
- [ ] Nenhum segredo enviado

## Koyeb
- [ ] Serviço Web conectado ao repositório
- [ ] Root directory = `backend`
- [ ] `DB_URL` configurada
- [ ] `DB_USERNAME` configurada
- [ ] `DB_PASSWORD` configurada
- [ ] `CORS_ALLOWED_ORIGINS` configurada com o domínio do Pages
- [ ] `/api/health` retorna `API Help Desk OK`

## Cloudflare Pages
- [ ] `frontend/js/config.js` aponta para a API pública
- [ ] Pages conectado ao repositório
- [ ] Output directory = `frontend`
- [ ] Site publicado
- [ ] Cadastro, listagem, assumir e concluir testados
