// ============================================================
// Logica principal do sistema (dashboard + CRUDs).
// ============================================================

// Protege a pagina: sem token, volta ao login.
if (!pegarToken()) window.location.href = 'index.html';

// Mostra o nome do usuario logado.
const usuario = pegarUsuario();
if (usuario) document.getElementById('nome-usuario').textContent = 'Ola, ' + usuario.nome;

// Guarda a lista de categorias em memoria (usada nos selects).
let categoriasCache = [];
let produtosCache = [];

// Estado do modal: qual formulario esta aberto e qual id edita.
let modalTipo = null; // 'produto' | 'categoria' | 'movimentacao'
let modalId = null; // id em edicao (null = novo)

// ---------- Mensagens ----------
function aviso(texto, tipo = 'sucesso') {
 const m = document.getElementById('mensagem');
 m.textContent = texto;
 m.className = 'mensagem ' + tipo;
 setTimeout(() => { m.className = 'mensagem'; }, 4000);
}

// ---------- Navegacao por abas ----------
function trocarAba(id, botao) {
 document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
 document.querySelectorAll('nav.abas button').forEach(b => b.classList.remove('ativa'));
 document.getElementById(id).classList.add('ativa');
 botao.classList.add('ativa');
 if (id === 'dashboard') carregarDashboard();
 if (id === 'produtos') carregarProdutos();
 if (id === 'categorias') carregarCategorias();
 if (id === 'movimentacoes') carregarMovimentacoes();
}

// ---------- Modal ----------
function abrirModal(titulo, htmlForm) {
 document.getElementById('modal-titulo').textContent = titulo;
 document.getElementById('modal-form').innerHTML = htmlForm;
 document.getElementById('modal-fundo').classList.add('aberto');
}

function fecharModal() {
 document.getElementById('modal-fundo').classList.remove('aberto');
 modalTipo = null; modalId = null;
}

function moeda(v) {
 return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ============================================================
// DASHBOARD
// ============================================================
async function carregarDashboard() {
 try {
 const d = await http.get('/movimentacoes/dashboard');
 document.getElementById('c-produtos').textContent = d.total_produtos;
 document.getElementById('c-categorias').textContent = d.total_categorias;
 document.getElementById('c-itens').textContent = d.itens_em_estoque;
 document.getElementById('c-valor').textContent = moeda(d.valor_total_estoque);
 const tbody = document.getElementById('tabela-alertas');
 if (!d.produtos_abaixo_minimo.length) {
 tbody.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum produto abaixo do minimo.</td></tr>';
 } else {
 tbody.innerHTML = d.produtos_abaixo_minimo.map(p => `
 <tr>
 <td>${p.nome}</td>
 <td>${p.quantidade}</td>
 <td>${p.estoque_minimo}</td>
 <td><span class="tag tag-baixo">Repor</span></td>
 </tr>
 `).join('');
 }
 } catch (e) { aviso(e.message, 'erro'); }
}

// ============================================================
// CATEGORIAS
// ============================================================
async function carregarCategorias() {
 try {
 categoriasCache = await http.get('/categorias');
 const tbody = document.getElementById('tabela-categorias');
 if (!categoriasCache.length) {
 tbody.innerHTML = '<tr><td colspan="3" class="vazio">Nenhuma categoria cadastrada.</td></tr>';
 return;
 }
 tbody.innerHTML = categoriasCache.map(c => `
 <tr>
 <td>${c.nome}</td>
 <td>${c.descricao || '-'}</td>
 <td class="acoes">
 <button class="btn btn-pequeno" onclick="abrirFormCategoria(${c.id})">Editar</button>
 <button class="btn btn-pequeno btn-perigo" onclick="excluirCategoria(${c.id})">Excluir</button>
 </td>
 </tr>
 `).join('');
 } catch (e) { aviso(e.message, 'erro'); }
}

function abrirFormCategoria(id = null) {
 modalTipo = 'categoria'; modalId = id;
 const cat = id ? categoriasCache.find(c => c.id === id) : {};
 abrirModal(id ? 'Editar categoria' : 'Nova categoria', `
 <div class="form-linha">
 <label>Nome *</label>
 <input type="text" id="f-nome" value="${cat.nome || ''}" required>
 </div>
 
 <div class="form-linha">
 <label>Descricao</label>
 <textarea id="f-descricao">${cat.descricao || ''}</textarea>
 </div>
 `);
}

async function salvarCategoria() {
 const corpo = {
 nome: document.getElementById('f-nome').value.trim(),
 descricao: document.getElementById('f-descricao').value.trim()
 };
 if (!corpo.nome) return aviso('Informe o nome da categoria.', 'erro');
 if (modalId) await http.put('/categorias/' + modalId, corpo);
 else await http.post('/categorias', corpo);
 fecharModal();
 aviso('Categoria salva com sucesso.');
 carregarCategorias();
}

async function excluirCategoria(id) {
 if (!confirm('Excluir esta categoria?')) return;
 try {
 await http.del('/categorias/' + id);
 aviso('Categoria excluida.');
 carregarCategorias();
 } catch (e) { aviso(e.message, 'erro'); }
}

// ============================================================
// PRODUTOS
// ============================================================
async function carregarProdutos() {
 try {
 produtosCache = await http.get('/produtos');
 const tbody = document.getElementById('tabela-produtos');
 if (!produtosCache.length) {
 tbody.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum produto cadastrado.</td></tr>';
 return;
 }
 tbody.innerHTML = produtosCache.map(p => `
 <tr>
 <td>${p.nome}</td>
 <td>${p.categoria_nome}</td>
 <td>${moeda(p.preco)}</td>
 <td>${p.quantidade} ${p.quantidade <= p.estoque_minimo ? '<span class="tag tag-baixo">baixo</span>' : ''}</td>
 <td>${p.estoque_minimo}</td>
 <td class="acoes">
 <button class="btn btn-pequeno" onclick="abrirFormProduto(${p.id})">Editar</button>
 <button class="btn btn-pequeno btn-perigo" onclick="excluirProduto(${p.id})">Excluir</button>
 </td>
 </tr>
 `).join('');
 } catch (e) { aviso(e.message, 'erro'); }
}

async function abrirFormProduto(id = null) {
 modalTipo = 'produto'; modalId = id;
 // Garante que temos as categorias para o select.
 if (!categoriasCache.length) categoriasCache = await http.get('/categorias');
 const p = id ? produtosCache.find(x => x.id === id) : {};
 const opcoes = categoriasCache.map(c =>
 `<option value="${c.id}" ${p.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`
 ).join('');
 abrirModal(id ? 'Editar produto' : 'Novo produto', `
 <div class="form-linha">
 <label>Nome *</label>
 <input type="text" id="f-nome" value="${p.nome || ''}" required>
 </div>
 
 <div class="form-linha">
 <label>Descricao</label>
 <textarea id="f-descricao">${p.descricao || ''}</textarea>
 </div>
 
 <div class="form-linha">
 <label>Categoria *</label>
 <select id="f-categoria" required>
 <option value="">-- Selecione --</option>
 ${opcoes}
 </select>
 </div>
 
 <div class="form-linha">
 <label>Preco (R$) *</label>
 <input type="number" id="f-preco" step="0.01" value="${p.preco || ''}" required>
 </div>
 
 <div class="form-linha">
 <label>Quantidade inicial *</label>
 <input type="number" id="f-quantidade" value="${p.quantidade || ''}" required>
 </div>
 
 <div class="form-linha">
 <label>Estoque minimo *</label>
 <input type="number" id="f-minimo" value="${p.estoque_minimo || ''}" required>
 </div>
 `);
}

async function salvarProduto() {
 const corpo = {
 nome: document.getElementById('f-nome').value.trim(),
 descricao: document.getElementById('f-descricao').value.trim(),
 categoria_id: Number(document.getElementById('f-categoria').value),
 preco: Number(document.getElementById('f-preco').value),
 quantidade: Number(document.getElementById('f-quantidade').value),
 estoque_minimo: Number(document.getElementById('f-minimo').value)
 };
 if (!corpo.nome) return aviso('Informe o nome do produto.', 'erro');
 if (!corpo.categoria_id) return aviso('Selecione uma categoria.', 'erro');
 if (modalId) await http.put('/produtos/' + modalId, corpo);
 else await http.post('/produtos', corpo);
 fecharModal();
 aviso('Produto salvo com sucesso.');
 carregarProdutos();
}

async function excluirProduto(id) {
 if (!confirm('Excluir este produto?')) return;
 try {
 await http.del('/produtos/' + id);
 aviso('Produto excluido.');
 carregarProdutos();
 } catch (e) { aviso(e.message, 'erro'); }
}

// ============================================================
// MOVIMENTACOES
// ============================================================
async function carregarMovimentacoes() {
 try {
 const lista = await http.get('/movimentacoes');
 const tbody = document.getElementById('tabela-movimentacoes');
 if (!lista.length) {
 tbody.innerHTML = '<tr><td colspan="7" class="vazio">Nenhuma movimentacao registrada.</td></tr>';
 return;
 }
 tbody.innerHTML = lista.map(m => `
 <tr>
 <td>${new Date(m.criado_em).toLocaleString('pt-BR')}</td>
 <td>${m.produto_nome}</td>
 <td><span class="tag ${m.tipo === 'ENTRADA' ? 'tag-entrada' : 'tag-saida'}">${m.tipo}</span> ${m.quantidade}</td>
 <td>${m.usuario_nome}</td>
 <td>${m.observacao || '-'}</td>
 <td class="acoes">
 <button class="btn btn-pequeno btn-perigo" onclick="excluirMovimentacao(${m.id})">Excluir</button>
 </td>
 </tr>
 `).join('');
 } catch (e) { aviso(e.message, 'erro'); }
}

async function abrirFormMovimentacao() {
 modalTipo = 'movimentacao'; modalId = null;
 if (!produtosCache.length) produtosCache = await http.get('/produtos');
 const opcoes = produtosCache.map(p =>
 `<option value="${p.id}">${p.nome} (estoque: ${p.quantidade})</option>`
 ).join('');
 abrirModal('Nova movimentacao', `
 <div class="form-linha">
 <label>Produto *</label>
 <select id="f-produto" required>
 <option value="">-- Selecione --</option>
 ${opcoes}
 </select>
 </div>
 
 <div class="form-linha">
 <label>Tipo *</label>
 <select id="f-tipo" required>
 <option value="">-- Selecione --</option>
 <option value="ENTRADA">ENTRADA</option>
 <option value="SAIDA">SAIDA</option>
 </select>
 </div>
 
 <div class="form-linha">
 <label>Quantidade *</label>
 <input type="number" id="f-quantidade" value="1" required>
 </div>
 
 <div class="form-linha">
 <label>Observacao</label>
 <textarea id="f-observacao"></textarea>
 </div>
 `);
}

async function salvarMovimentacao() {
 const corpo = {
 produto_id: Number(document.getElementById('f-produto').value),
 tipo: document.getElementById('f-tipo').value,
 quantidade: Number(document.getElementById('f-quantidade').value),
 observacao: document.getElementById('f-observacao').value.trim()
 };
 if (!corpo.produto_id) return aviso('Selecione um produto.', 'erro');
 if (!corpo.quantidade || corpo.quantidade <= 0) return aviso('Quantidade invalida.', 'erro');
 await http.post('/movimentacoes', corpo);
 fecharModal();
 aviso('Movimentacao registrada.');
 carregarMovimentacoes();
}

async function excluirMovimentacao(id) {
 if (!confirm('Excluir esta movimentacao?')) return;
 try {
 await http.del('/movimentacoes/' + id);
 aviso('Movimentacao excluida.');
 carregarMovimentacoes();
 } catch (e) { aviso(e.message, 'erro'); }
}

// ---------- Despacha o "Salvar" do modal ----------
async function salvarModal() {
 try {
 if (modalTipo === 'categoria') await salvarCategoria();
 else if (modalTipo === 'produto') await salvarProduto();
 else if (modalTipo === 'movimentacao') await salvarMovimentacao();
 } catch (e) { aviso(e.message, 'erro'); }
}

// ---------- Inicio ----------
carregarDashboard();
