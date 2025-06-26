// SPA Oficina Mecânica - JS principal

const app = document.getElementById('app');

// Rotas/Seções
const sections = {
  clientes: renderClientesSection,
  funcionarios: renderFuncionariosSection,
  veiculos: renderVeiculosSection,
  servicos: renderServicosSection,
  pecas: renderPecasSection,
  ordens: renderOrdensSection,
  execucoes: renderExecucoesSection,
  reservas: renderReservasSection
};

// Menu click handler
function setupMenu() {
  document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      if (sections[section]) {
        sections[section]();
      }
    });
  });
}

// CLIENTES
async function renderClientesSection() {
  app.innerHTML = `
    <section>
      <h2>Lista de Clientes</h2>
      <table id="clientes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
    <section>
      <h2 id="form-title">Cadastrar Novo Cliente</h2>
      <form id="cliente-form">
        <input type="hidden" id="cliente-id">
        <div>
          <label for="nome">Nome:</label>
          <input type="text" id="nome" required>
        </div>
        <div>
          <label for="cpf">CPF:</label>
          <input type="text" id="cpf" required>
        </div>
        <div>
          <label for="telefone">Telefone:</label>
          <input type="text" id="telefone" required>
        </div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao" style="display:none;">Cancelar</button>
      </form>
    </section>
  `;
  clientesController();
}

function clientesController() {
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
          <button class="editar-btn" data-id="${cliente.id}">Editar</button>
          <button class="excluir-btn" data-id="${cliente.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    // Eventos dos botões
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const cliente = await resp.json();
          preencherFormulario(cliente);
        } catch {
          alert('Erro ao buscar cliente.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarClientes();
          limparFormulario();
        } catch {
          alert('Erro ao excluir cliente.');
        }
      });
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

  carregarClientes();
}

// Placeholders para outras seções
function renderFuncionariosSection() {
  app.innerHTML = '<h2>Funcionários</h2><p>Em breve...</p>';
}
function renderVeiculosSection() {
  app.innerHTML = '<h2>Veículos</h2><p>Em breve...</p>';
}
function renderServicosSection() {
  app.innerHTML = '<h2>Serviços</h2><p>Em breve...</p>';
}
function renderPecasSection() {
  app.innerHTML = '<h2>Peças</h2><p>Em breve...</p>';
}
function renderOrdensSection() {
  app.innerHTML = '<h2>Ordens de Serviço</h2><p>Em breve...</p>';
}
function renderExecucoesSection() {
  app.innerHTML = '<h2>Execuções de Serviço</h2><p>Em breve...</p>';
}
function renderReservasSection() {
  app.innerHTML = '<h2>Reservas de Peça</h2><p>Em breve...</p>';
}

// Inicialização
setupMenu(); 