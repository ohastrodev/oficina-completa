// SPA Oficina Mecânica - JS principal

const BASE_URL = 'https://oficina-completa-backend-sequelize.onrender.com';
const app = document.getElementById('app');

// Função utilitária para criar e abrir modal
function openModal(contentHtml) {
  // Remove modal antigo se existir
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal">${contentHtml}</div>`;
  document.body.appendChild(backdrop);
  // Fechar ao clicar fora do modal
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });
}
function closeModal() {
  const old = document.querySelector('.modal-backdrop');
  if (old) old.remove();
}

// Rotas/Seções
const sections = {
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

// Função para aplicar máscara de CPF
function maskCPF(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}
// Função para aplicar máscara de telefone
function maskTelefone(value) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
    .slice(0, 15);
}

// CRUD Funcionários
function renderFuncionariosSection() {
  app.innerHTML = `
    <section>
      <h2>Funcionários</h2>
      <button id="novo-funcionario">Novo Funcionário</button>
      <table id="funcionarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cargo</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Data de Admissão</th>
            <th>Especialidade</th>
            <th>Salário</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  funcionariosController();
}

function funcionariosController() {
  const API_URL = `${BASE_URL}/funcionarios`;
  const tableBody = document.querySelector('#funcionarios-table tbody');
  const novoBtn = document.getElementById('novo-funcionario');

  function getFormHtml(func = {}) {
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2 id="form-title-func">${func.id ? 'Editar Funcionário' : 'Cadastrar Novo Funcionário'}</h2>
      <form id="funcionario-form">
        <input type="hidden" id="funcionario-id" value="${func.id || ''}">
        <div><label>Nome:</label><input type="text" id="func-nome" value="${func.nome || ''}" required></div>
        <div><label>Cargo:</label><input type="text" id="func-cargo" value="${func.cargo || ''}" required></div>
        <div><label>CPF:</label><input type="text" id="func-cpf" value="${func.cpf || ''}" required></div>
        <div><label>Telefone:</label><input type="text" id="func-telefone" value="${func.telefone || ''}" required></div>
        <div><label>Data de Admissão:</label><input type="date" id="func-dataDeAdmissao" value="${func.dataDeAdmissao || ''}" required></div>
        <div><label>Especialidade:</label><input type="text" id="func-especialidade" value="${func.especialidade || ''}" required></div>
        <div><label>Salário:</label><input type="number" step="0.01" id="func-salario" value="${func.salario || ''}" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-func">Cancelar</button>
      </form>
    `;
  }

  function renderizarTabela(funcionarios) {
    tableBody.innerHTML = '';
    funcionarios.forEach(func => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${func.id}</td>
        <td>${func.nome}</td>
        <td>${func.cargo}</td>
        <td>${func.cpf}</td>
        <td>${func.telefone}</td>
        <td>${func.dataDeAdmissao || ''}</td>
        <td>${func.especialidade}</td>
        <td>${func.salario}</td>
        <td>
          <button class="editar-btn" data-id="${func.id}">Editar</button>
          <button class="excluir-btn" data-id="${func.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const func = await resp.json();
          openModal(getFormHtml(func));
          setupFormEvents();
        } catch {
          alert('Erro ao buscar funcionário.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarFuncionarios();
        } catch {
          alert('Erro ao excluir funcionário.');
        }
      });
    });
  }

  function setupFormEvents() {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('funcionario-form');
    const cancelarBtn = document.getElementById('cancelar-edicao-func');
    const closeBtn = document.querySelector('.modal-close');
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('funcionario-id').value;
      const funcionario = {
        nome: document.getElementById('func-nome').value,
        cargo: document.getElementById('func-cargo').value,
        cpf: document.getElementById('func-cpf').value,
        telefone: document.getElementById('func-telefone').value,
        dataDeAdmissao: document.getElementById('func-dataDeAdmissao').value,
        especialidade: document.getElementById('func-especialidade').value,
        salario: document.getElementById('func-salario').value
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionario)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funcionario)
          });
        }
        if (!resp.ok) throw new Error();
        carregarFuncionarios();
        closeModal();
      } catch {
        alert('Erro ao salvar funcionário.');
      }
    });
    const cpfInput = document.getElementById('func-cpf');
    const telInput = document.getElementById('func-telefone');
    if (cpfInput) {
      cpfInput.addEventListener('input', function() {
        this.value = maskCPF(this.value);
      });
    }
    if (telInput) {
      telInput.addEventListener('input', function() {
        this.value = maskTelefone(this.value);
      });
    }
  }

  async function carregarFuncionarios() {
    try {
      const resp = await fetch(API_URL);
      const funcionarios = await resp.json();
      renderizarTabela(funcionarios);
    } catch (err) {
      alert('Erro ao carregar funcionários.');
    }
  }

  novoBtn.addEventListener('click', () => {
    openModal(getFormHtml());
    setupFormEvents();
  });

  carregarFuncionarios();
}

// CRUD Veículos
function renderVeiculosSection() {
  app.innerHTML = `
    <section>
      <h2>Veículos</h2>
      <button id="novo-veiculo">Novo Veículo</button>
      <table id="veiculos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Nº Chassi</th>
            <th>Tipo Combustível</th>
            <th>Placa</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  veiculosController();
}

function veiculosController() {
  const API_URL = `${BASE_URL}/veiculos`;
  const tableBody = document.querySelector('#veiculos-table tbody');
  const novoBtn = document.getElementById('novo-veiculo');

  function getFormHtml(veic = {}) {
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2 id="form-title-veic">${veic.id ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}</h2>
      <form id="veiculo-form">
        <input type="hidden" id="veiculo-id" value="${veic.id || ''}">
        <div><label>Marca:</label><input type="text" id="veic-marca" value="${veic.marca || ''}" required></div>
        <div><label>Modelo:</label><input type="text" id="veic-modelo" value="${veic.modelo || ''}" required></div>
        <div><label>Ano:</label><input type="number" id="veic-ano" value="${veic.ano || ''}" required></div>
        <div><label>Nº Chassi:</label><input type="text" id="veic-numeroChassi" value="${veic.numeroChassi || ''}" required></div>
        <div><label>Tipo Combustível:</label><input type="text" id="veic-tipoCombustivel" value="${veic.tipoCombustivel || ''}" required></div>
        <div><label>Placa:</label><input type="text" id="veic-placa" value="${veic.placa || ''}" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-veic">Cancelar</button>
      </form>
    `;
  }

  function renderizarTabela(veiculos) {
    tableBody.innerHTML = '';
    veiculos.forEach(veic => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${veic.id}</td>
        <td>${veic.marca}</td>
        <td>${veic.modelo}</td>
        <td>${veic.ano}</td>
        <td>${veic.numeroChassi}</td>
        <td>${veic.tipoCombustivel}</td>
        <td>${veic.placa}</td>
        <td>
          <button class="editar-btn" data-id="${veic.id}">Editar</button>
          <button class="excluir-btn" data-id="${veic.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const veic = await resp.json();
          openModal(getFormHtml(veic));
          setupFormEvents();
        } catch {
          alert('Erro ao buscar veículo.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarVeiculos();
        } catch {
          alert('Erro ao excluir veículo.');
        }
      });
    });
  }

  function setupFormEvents() {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('veiculo-form');
    const cancelarBtn = document.getElementById('cancelar-edicao-veic');
    const closeBtn = document.querySelector('.modal-close');
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('veiculo-id').value;
      const veiculo = {
        marca: document.getElementById('veic-marca').value,
        modelo: document.getElementById('veic-modelo').value,
        ano: document.getElementById('veic-ano').value,
        numeroChassi: document.getElementById('veic-numeroChassi').value,
        tipoCombustivel: document.getElementById('veic-tipoCombustivel').value,
        placa: document.getElementById('veic-placa').value,
        clienteId: null // sempre enviar clienteId, mesmo que não use
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculo)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(veiculo)
          });
        }
        if (!resp.ok) throw new Error();
        carregarVeiculos();
        closeModal();
      } catch {
        alert('Erro ao salvar veículo.');
      }
    });
  }

  async function carregarVeiculos() {
    try {
      const resp = await fetch(API_URL);
      const veiculos = await resp.json();
      renderizarTabela(veiculos);
    } catch (err) {
      alert('Erro ao carregar veículos.');
    }
  }

  novoBtn.addEventListener('click', () => {
    openModal(getFormHtml());
    setupFormEvents();
  });

  carregarVeiculos();
}

// CRUD Serviços
function renderServicosSection() {
  app.innerHTML = `
    <section>
      <h2>Serviços</h2>
      <button id="novo-servico">Novo Serviço</button>
      <table id="servicos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Descrição</th>
            <th>Mão de Obra</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  servicosController();
}

function servicosController() {
  const API_URL = `${BASE_URL}/servicos`;
  const tableBody = document.querySelector('#servicos-table tbody');
  const novoBtn = document.getElementById('novo-servico');

  function getFormHtml(serv = {}) {
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2 id="form-title-serv">${serv.id ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}</h2>
      <form id="servico-form">
        <input type="hidden" id="servico-id" value="${serv.id || ''}">
        <div><label>Descrição:</label><input type="text" id="serv-descricao" value="${serv.descricao || ''}" required></div>
        <div><label>Mão de Obra:</label><input type="number" step="0.01" id="serv-maoObra" value="${serv.maoObra || ''}" required></div>
        <div><label>Categoria:</label><input type="text" id="serv-categoria" maxlength="1" value="${serv.categoria || ''}" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-serv">Cancelar</button>
      </form>
    `;
  }

  function renderizarTabela(servicos) {
    tableBody.innerHTML = '';
    servicos.forEach(serv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${serv.id}</td>
        <td>${serv.descricao}</td>
        <td>${serv.maoObra}</td>
        <td>${serv.categoria}</td>
        <td>
          <button class="editar-btn" data-id="${serv.id}">Editar</button>
          <button class="excluir-btn" data-id="${serv.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const serv = await resp.json();
          openModal(getFormHtml(serv));
          setupFormEvents();
        } catch {
          alert('Erro ao buscar serviço.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarServicos();
        } catch {
          alert('Erro ao excluir serviço.');
        }
      });
    });
  }

  function setupFormEvents() {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('servico-form');
    const cancelarBtn = document.getElementById('cancelar-edicao-serv');
    const closeBtn = document.querySelector('.modal-close');
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('servico-id').value;
      const servico = {
        descricao: document.getElementById('serv-descricao').value,
        maoObra: document.getElementById('serv-maoObra').value,
        categoria: document.getElementById('serv-categoria').value
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servico)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servico)
          });
        }
        if (!resp.ok) throw new Error();
        carregarServicos();
        closeModal();
      } catch {
        alert('Erro ao salvar serviço.');
      }
    });
  }

  async function carregarServicos() {
    try {
      const resp = await fetch(API_URL);
      const servicos = await resp.json();
      renderizarTabela(servicos);
    } catch (err) {
      alert('Erro ao carregar serviços.');
    }
  }

  novoBtn.addEventListener('click', () => {
    openModal(getFormHtml());
    setupFormEvents();
  });

  carregarServicos();
}

// CRUD Peças
function renderPecasSection() {
  app.innerHTML = `
    <section>
      <h2>Peças</h2>
      <button id="nova-peca">Nova Peça</button>
      <table id="pecas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Código</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  pecasController();
}

function pecasController() {
  const API_URL = `${BASE_URL}/pecas`;
  const tableBody = document.querySelector('#pecas-table tbody');
  const novoBtn = document.getElementById('nova-peca');

  function getFormHtml(peca = {}) {
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2 id="form-title-peca">${peca.id ? 'Editar Peça' : 'Cadastrar Nova Peça'}</h2>
      <form id="peca-form">
        <input type="hidden" id="peca-id" value="${peca.id || ''}">
        <div><label>Nome:</label><input type="text" id="peca-nome" value="${peca.nome || ''}" required></div>
        <div><label>Código:</label><input type="number" id="peca-codigo" value="${peca.codigo || ''}" required></div>
        <div><label>Preço:</label><input type="number" step="0.01" id="peca-preco" value="${peca.preco || ''}" required></div>
        <div><label>Estoque:</label><input type="number" id="peca-estoque" value="${peca.estoque || ''}" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-peca">Cancelar</button>
      </form>
    `;
  }

  function renderizarTabela(pecas) {
    tableBody.innerHTML = '';
    pecas.forEach(peca => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${peca.id}</td>
        <td>${peca.nome}</td>
        <td>${peca.codigo}</td>
        <td>${peca.preco}</td>
        <td>${peca.estoque}</td>
        <td>
          <button class="editar-btn" data-id="${peca.id}">Editar</button>
          <button class="excluir-btn" data-id="${peca.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const peca = await resp.json();
          openModal(getFormHtml(peca));
          setupFormEvents();
        } catch {
          alert('Erro ao buscar peça.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir esta peça?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarPecas();
        } catch {
          alert('Erro ao excluir peça.');
        }
      });
    });
  }

  function setupFormEvents() {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('peca-form');
    const cancelarBtn = document.getElementById('cancelar-edicao-peca');
    const closeBtn = document.querySelector('.modal-close');
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('peca-id').value;
      const peca = {
        nome: document.getElementById('peca-nome').value,
        codigo: document.getElementById('peca-codigo').value,
        preco: document.getElementById('peca-preco').value,
        estoque: document.getElementById('peca-estoque').value
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peca)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(peca)
          });
        }
        if (!resp.ok) throw new Error();
        carregarPecas();
        closeModal();
      } catch {
        alert('Erro ao salvar peça.');
      }
    });
  }

  async function carregarPecas() {
    try {
      const resp = await fetch(API_URL);
      const pecas = await resp.json();
      renderizarTabela(pecas);
    } catch (err) {
      alert('Erro ao carregar peças.');
    }
  }

  novoBtn.addEventListener('click', () => {
    openModal(getFormHtml());
    setupFormEvents();
  });

  carregarPecas();
}

// CRUD Abertura de Ordem de Serviço
function renderOrdensSection() {
  app.innerHTML = `
    <section>
      <h2>Abertura de Ordem de Serviço</h2>
      <button id="nova-ordem">Nova Ordem</button>
      <table id="ordens-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Funcionário</th>
            <th>Veículo</th>
            <th>Serviço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  ordensController();
}

function ordensController() {
  // Implementação CRUD virá em seguida
}

// CRUD Execução de Serviço
function renderExecucoesSection() {
  app.innerHTML = `
    <section>
      <h2>Execução de Serviço</h2>
      <button id="nova-execucao">Nova Execução</button>
      <table id="execucoes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ordem de Serviço</th>
            <th>Funcionário</th>
            <th>Data Execução</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  execucoesController();
}

function execucoesController() {
  // Implementação CRUD virá em seguida
}

// CRUD Reserva de Peça
function renderReservasSection() {
  app.innerHTML = `
    <section>
      <h2>Reserva de Peça</h2>
      <button id="nova-reserva">Nova Reserva</button>
      <table id="reservas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Peça</th>
            <th>Serviço</th>
            <th>Quantidade</th>
            <th>Data Reserva</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  `;
  reservasController();
}

function reservasController() {
  // Implementação CRUD virá em seguida
}

// Inicialização
setupMenu(); 