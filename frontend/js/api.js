// Camada de comunicacao com a API.
// Centraliza o fetch, adiciona o token JWT e trata erros.
// Guarda/recupera o token no navegador.

function salvarToken(token) { localStorage.setItem('token', token); }
function pegarToken() { return localStorage.getItem('token'); }
function salvarUsuario(u) { localStorage.setItem('usuario', JSON.stringify(u)); }
function pegarUsuario() {
 const u = localStorage.getItem('usuario');
 return u ? JSON.parse(u) : null;
}
function sair() {
 localStorage.removeItem('token');
 localStorage.removeItem('usuario');
 window.location.href = 'index.html';
}

// Funcao generica de requisicao.
async function api(caminho, opcoes = {}) {
 const config = {
 headers: { 'Content-Type': 'application/json' },
 ...opcoes
 };
 // Envia o token nas rotas protegidas.
 const token = pegarToken();
 if (token) config.headers['Authorization'] = 'Bearer ' + token;
 const resposta = await fetch(API_URL + caminho, config);
 // Se o token expirou, volta para o login.
 if (resposta.status === 401 && !caminho.includes('/auth/')) {
 sair();
 throw new Error('Sessao expirada. Faca login novamente.');
 }
 // 204 = sem conteudo (ex.: DELETE)
 if (resposta.status === 204) return null;
 const dados = await resposta.json().catch(() => ({}));
 if (!resposta.ok) {
 throw new Error(dados.erro || 'Erro na requisicao.');
 }
 return dados;
}

// Atalhos
const http = {
 get: (c) => api(c),
 post: (c, corpo) => api(c, { method: 'POST', body: JSON.stringify(corpo) }),
 put: (c, corpo) => api(c, { method: 'PUT', body: JSON.stringify(corpo) }),
 del: (c) => api(c, { method: 'DELETE' })
};
