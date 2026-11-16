const API_URL = `${(window.HELPDESK_API_URL || "http://localhost:8080/api").replace(/\/$/, "")}`;
const elementos = {
  form: document.getElementById("form-chamado"), cliente: document.getElementById("cliente"),
  tecnico: document.getElementById("tecnico"), titulo: document.getElementById("titulo"),
  descricao: document.getElementById("descricao"), tabela: document.getElementById("tabela-corpo"),
  mensagemForm: document.getElementById("mensagem-form"), mensagemLista: document.getElementById("mensagem-lista"),
  apiStatus: document.getElementById("api-status"), btnSalvar: document.getElementById("btn-salvar")
};
let usuarios = [];

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);
  if (!resposta.ok) {
    let detalhe = `Erro HTTP ${resposta.status}`;
    try { const corpo = await resposta.json(); detalhe = corpo.detail || corpo.message || corpo.error || detalhe; } catch (_) {}
    throw new Error(detalhe);
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}

function mostrarMensagem(alvo, texto, sucesso = false) {
  alvo.textContent = texto;
  alvo.classList.toggle("sucesso", sucesso);
}

function preencherSelect(select, lista, textoInicial) {
  select.replaceChildren(new Option(textoInicial, ""));
  lista.forEach(usuario => select.add(new Option(`${usuario.nome} (${usuario.email})`, usuario.id)));
}

async function carregarUsuarios() {
  usuarios = await requisicao(`${API_URL}/usuarios`);
  preencherSelect(elementos.cliente, usuarios.filter(u => u.perfil === "CLIENTE"), "Selecione o solicitante");
  preencherSelect(elementos.tecnico, usuarios.filter(u => u.perfil === "TECNICO"), "Selecione o técnico");
}

function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto ?? "—";
  return td;
}

function montarLinha(chamado) {
  const tr = document.createElement("tr");
  const cliente = usuarios.find(u => u.id === chamado.clienteId);
  const tecnico = usuarios.find(u => u.id === chamado.tecnicoId);
  tr.append(criarCelula(chamado.id));
  const resumo = document.createElement("td");
  const titulo = document.createElement("strong"); titulo.textContent = chamado.titulo;
  const descricao = document.createElement("div"); descricao.className = "descricao-curta"; descricao.textContent = chamado.descricao;
  resumo.append(titulo, descricao); tr.append(resumo);
  tr.append(criarCelula(cliente?.nome || `Usuário ${chamado.clienteId}`));
  tr.append(criarCelula(formatarData(chamado.dataCriacao)));
  const statusTd = document.createElement("td"); const badge = document.createElement("span");
  badge.className = `badge ${chamado.status}`; badge.textContent = chamado.status.replaceAll("_", " "); statusTd.append(badge); tr.append(statusTd);
  tr.append(criarCelula(tecnico?.nome || "Não atribuído"));
  const acoes = document.createElement("td"); acoes.className = "acoes";
  if (chamado.status === "ABERTO") {
    const botao = document.createElement("button"); botao.className = "acao"; botao.textContent = "Assumir";
    botao.disabled = !elementos.tecnico.value;
    botao.addEventListener("click", () => assumirChamado(chamado.id)); acoes.append(botao);
  } else if (chamado.status === "EM_ATENDIMENTO") {
    const botao = document.createElement("button"); botao.className = "acao concluir"; botao.textContent = "Concluir";
    botao.addEventListener("click", () => concluirChamado(chamado.id)); acoes.append(botao);
  } else { acoes.textContent = "Finalizado"; }
  tr.append(acoes);
  return tr;
}

async function carregarChamados() {
  try {
    const chamados = await requisicao(`${API_URL}/chamados`);
    elementos.tabela.replaceChildren();
    if (!chamados.length) {
      const tr = document.createElement("tr"); const td = criarCelula("Nenhum chamado cadastrado."); td.colSpan = 7; td.className = "vazio"; tr.append(td); elementos.tabela.append(tr);
    } else chamados.forEach(chamado => elementos.tabela.append(montarLinha(chamado)));
    mostrarMensagem(elementos.mensagemLista, "");
  } catch (erro) {
    elementos.tabela.replaceChildren(); const tr = document.createElement("tr"); const td = criarCelula("Não foi possível carregar os chamados. Verifique se a API está disponível."); td.colSpan = 7; td.className = "vazio"; tr.append(td); elementos.tabela.append(tr);
    mostrarMensagem(elementos.mensagemLista, erro.message);
  }
}

async function salvarChamado(evento) {
  evento.preventDefault();
  const titulo = elementos.titulo.value.trim();
  const descricao = elementos.descricao.value.trim();
  const clienteId = Number(elementos.cliente.value);
  if (!clienteId || !titulo || !descricao) {
    mostrarMensagem(elementos.mensagemForm, "Selecione o solicitante e preencha título e descrição."); return;
  }
  elementos.btnSalvar.disabled = true;
  try {
    await requisicao(`${API_URL}/chamados`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo, descricao, clienteId }) });
    elementos.form.reset(); mostrarMensagem(elementos.mensagemForm, "Chamado registrado com sucesso!", true); await carregarChamados();
  } catch (erro) { mostrarMensagem(elementos.mensagemForm, `Não foi possível registrar: ${erro.message}`); }
  finally { elementos.btnSalvar.disabled = false; }
}

async function assumirChamado(id) {
  const tecnicoId = Number(elementos.tecnico.value);
  if (!tecnicoId) { mostrarMensagem(elementos.mensagemLista, "Selecione um técnico antes de assumir o chamado."); return; }
  try { await requisicao(`${API_URL}/chamados/${id}/assumir?tecnicoId=${tecnicoId}`, { method: "PUT" }); await carregarChamados(); }
  catch (erro) { mostrarMensagem(elementos.mensagemLista, erro.message); }
}

async function concluirChamado(id) {
  try { await requisicao(`${API_URL}/chamados/${id}/concluir`, { method: "PUT" }); await carregarChamados(); }
  catch (erro) { mostrarMensagem(elementos.mensagemLista, erro.message); }
}

async function iniciar() {
  try {
    await requisicao(`${API_URL}/health`);
    elementos.apiStatus.textContent = "● API conectada";
    await carregarUsuarios(); await carregarChamados();
  } catch (erro) {
    elementos.apiStatus.textContent = "● API indisponível";
    mostrarMensagem(elementos.mensagemForm, `Não foi possível conectar à API: ${erro.message}`);
    elementos.tabela.innerHTML = '<tr><td colspan="7" class="vazio">API indisponível. Confira o backend e o endereço configurado em js/config.js.</td></tr>';
  }
}

elementos.form.addEventListener("submit", salvarChamado);
document.getElementById("btn-atualizar").addEventListener("click", carregarChamados);
elementos.tecnico.addEventListener("change", carregarChamados);
iniciar();
