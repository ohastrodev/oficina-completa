const API_URL = 'http://localhost:3333/clientes';

const tableBody = document.querySelector('#clientes-table tbody');
const form = document.getElementById('cliente-form');
const formTitle = document.getElementById('form-title');
const cancelarBtn = document.getElementById('cancelar-edicao');

function limparFormulario() {
  form.reset();
  document.getElementById('cliente-id').value = '';
  formTitle.textContent = 'Cadastrar Novo Cliente';
  cancelarBtn.style.display = 'none';
}

function preencherFormulario(cliente) {
  document.getElementById('cliente-id').value = cliente.id;
  document.getElementById('nome').value = cliente.nome;
  document.getElementById('cpf').value = cliente.cpf;
  document.getElementById('telefone').value = cliente.telefone;
  formTitle.textContent = 'Editar Cliente';
  cancelarBtn.style.display = 'inline-block';
}

function renderizarTabela(clientes) {
  tableBody.innerHTML = '';
  clientes.forEach(cliente => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.id}</td>
      <td>${cliente.nome}</td>
      <td>${cliente.cpf}</td>
      <td>${cliente.telefone}</td>
      <td>
        <button onclick="editarCliente(${cliente.id})">Editar</button>
        <button onclick="excluirCliente(${cliente.id})">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

async function carregarClientes() {
  try {
    const resp = await fetch(API_URL);
    const clientes = await resp.json();
    renderizarTabela(clientes);
  } catch (err) {
    alert('Erro ao carregar clientes.');
  }
}

window.editarCliente = async function(id) {
  try {
    const resp = await fetch(`${API_URL}/${id}`);
    if (!resp.ok) throw new Error();
    const cliente = await resp.json();
    preencherFormulario(cliente);
  } catch {
    alert('Erro ao buscar cliente.');
  }
}

window.excluirCliente = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
  try {
    const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error();
    carregarClientes();
    limparFormulario();
  } catch {
    alert('Erro ao excluir cliente.');
  }
}

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const id = document.getElementById('cliente-id').value;
  const nome = document.getElementById('nome').value;
  const cpf = document.getElementById('cpf').value;
  const telefone = document.getElementById('telefone').value;
  const cliente = { nome, cpf, telefone };
  try {
    let resp;
    if (id) {
      resp = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
    } else {
      resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cliente)
      });
    }
    if (!resp.ok) throw new Error();
    carregarClientes();
    limparFormulario();
  } catch {
    alert('Erro ao salvar cliente.');
  }
});

cancelarBtn.addEventListener('click', limparFormulario);

// Inicialização
carregarClientes(); 