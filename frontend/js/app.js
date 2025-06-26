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
  reservas: renderReservasSection,
  'relatorio-os-funcionario': renderRelatorioOSFuncionario,
  'relatorio-servicos-mais': renderRelatorioServicosMais,
  'relatorio-pecas-mais': renderRelatorioPecasMais,
  'relatorio-servicos-pecas': renderRelatorioServicosPecas,
  'relatorio-os-executadas': renderRelatorioOSExecutadas,
  'relatorio-desempenho-func': renderRelatorioDesempenhoFunc
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
  const API_URL = `${BASE_URL}/aberturaservico`;
  const tableBody = document.querySelector('#ordens-table tbody');
  const novoBtn = document.getElementById('nova-ordem');

  async function getSelectOptions() {
    // Carregar opções de funcionários, veículos e serviços
    const [funcs, veics, servs] = await Promise.all([
      fetch(`${BASE_URL}/funcionarios`).then(r => r.json()),
      fetch(`${BASE_URL}/veiculos`).then(r => r.json()),
      fetch(`${BASE_URL}/servicos`).then(r => r.json())
    ]);
    return { funcs, veics, servs };
  }

  function getFormHtml(ordem = {}, options = {}) {
    const { funcs = [], veics = [], servs = [] } = options;
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2>${ordem.id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h2>
      <form id="ordem-form">
        <input type="hidden" id="ordem-id" value="${ordem.id || ''}">
        <div><label>Data:</label><input type="date" id="ordem-data" value="${ordem.data ? ordem.data.substring(0,10) : ''}" required></div>
        <div><label>Funcionário:</label><select id="ordem-funcionario" required>
          <option value="">Selecione</option>
          ${funcs.map(f => `<option value="${f.id}" ${ordem.funcionario_id==f.id?'selected':''}>${f.nome}</option>`).join('')}
        </select></div>
        <div><label>Veículo:</label><select id="ordem-veiculo" required>
          <option value="">Selecione</option>
          ${veics.map(v => `<option value="${v.id}" ${ordem.veiculo_id==v.id?'selected':''}>${v.marca} ${v.modelo} (${v.placa})</option>`).join('')}
        </select></div>
        <div><label>Serviço:</label><select id="ordem-servico" required>
          <option value="">Selecione</option>
          ${servs.map(s => `<option value="${s.id}" ${ordem.servico_id==s.id?'selected':''}>${s.descricao}</option>`).join('')}
        </select></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-ordem">Cancelar</button>
      </form>
    `;
  }

  function renderizarTabela(ordens) {
    tableBody.innerHTML = '';
    ordens.forEach(ordem => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ordem.id}</td>
        <td>${ordem.data ? ordem.data.substring(0,10) : ''}</td>
        <td>${ordem.funcionario?.nome || ordem.funcionario_id || ''}</td>
        <td>${ordem.veiculo ? ordem.veiculo.marca + ' ' + ordem.veiculo.modelo + ' (' + ordem.veiculo.placa + ')' : ordem.veiculo_id || ''}</td>
        <td>${ordem.servico?.descricao || ordem.servico_id || ''}</td>
        <td>
          <button class="editar-btn" data-id="${ordem.id}">Editar</button>
          <button class="excluir-btn" data-id="${ordem.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const ordem = await resp.json();
          const options = await getSelectOptions();
          openModal(getFormHtml(ordem, options));
          setupFormEvents();
        } catch {
          alert('Erro ao buscar ordem.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir esta ordem?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarOrdens();
        } catch {
          alert('Erro ao excluir ordem.');
        }
      });
    });
  }

  function setupFormEvents() {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('ordem-form');
    const cancelarBtn = document.getElementById('cancelar-ordem');
    const closeBtn = document.querySelector('.modal-close');
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('ordem-id').value;
      const ordem = {
        data: document.getElementById('ordem-data').value,
        funcionario_id: document.getElementById('ordem-funcionario').value,
        veiculo_id: document.getElementById('ordem-veiculo').value,
        servico_id: document.getElementById('ordem-servico').value
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ordem)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ordem)
          });
        }
        if (!resp.ok) {
          const erro = await resp.json();
          alert(erro.error || 'Erro ao salvar ordem.');
          return;
        }
        carregarOrdens();
        closeModal();
      } catch {
        alert('Erro ao salvar ordem.');
      }
    });
  }

  async function carregarOrdens() {
    try {
      const resp = await fetch(API_URL);
      const ordens = await resp.json();
      renderizarTabela(ordens);
    } catch (err) {
      alert('Erro ao carregar ordens.');
    }
  }

  novoBtn.addEventListener('click', async () => {
    const options = await getSelectOptions();
    openModal(getFormHtml({}, options));
    setupFormEvents();
  });

  carregarOrdens();
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
            <th>Valor</th>
            <th>Valor c/ Desconto</th>
            <th>Forma Pagamento</th>
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
  const API_URL = `${BASE_URL}/ExecucaoServico`;
  const tableBody = document.querySelector('#execucoes-table tbody');
  const novoBtn = document.getElementById('nova-execucao');

  async function getSelectOptions() {
    // Carregar opções de ordens, formas de pagamento e funcionários
    const [ordens, formas, funcs] = await Promise.all([
      fetch(`${BASE_URL}/aberturaservico`).then(r => r.json()),
      fetch(`${BASE_URL}/formaPagamento`).then(r => r.json()),
      fetch(`${BASE_URL}/funcionarios`).then(r => r.json())
    ]);
    return { ordens, formas, funcs };
  }

  function getFormHtml(exec = {}, options = {}) {
    const { ordens = [], formas = [], funcs = [] } = options;
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2>${exec.id ? 'Editar Execução de Serviço' : 'Nova Execução de Serviço'}</h2>
      <form id="execucao-form">
        <input type="hidden" id="execucao-id" value="${exec.id || ''}">
        <div><label>Ordem de Serviço:</label><select id="exec-ordem" required>
          <option value="">Selecione</option>
          ${ordens.map(o => `<option value="${o.id}" ${exec.abertura_servico_id==o.id?'selected':''}>${o.id} - ${o.veiculo?.placa || ''} - ${o.servico?.descricao || ''}</option>`).join('')}
        </select></div>
        <div><label>Funcionário:</label><select id="exec-funcionario" required>
          <option value="">Selecione</option>
          ${funcs.map(f => `<option value="${f.id}" ${exec.funcionario_id==f.id?'selected':''}>${f.nome}</option>`).join('')}
        </select></div>
        <div><label>Data Execução:</label><input type="date" id="exec-data" value="${exec.dataFinalizacao ? exec.dataFinalizacao.substring(0,10) : ''}" required></div>
        <div><label>Valor:</label><input type="number" step="0.01" id="exec-valor" value="${exec.valor || ''}" required></div>
        <div><label>Valor c/ Desconto:</label><input type="number" step="0.01" id="exec-valor-desc" value="${exec.valorComDesconto || ''}"></div>
        <div><label>Forma Pagamento:</label><select id="exec-forma" required>
          <option value="">Selecione</option>
          ${formas.map(f => `<option value="${f.id}" ${exec.forma_pagamento_id==f.id?'selected':''}>${f.descricao}</option>`).join('')}
        </select></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-exec">Cancelar</button>
      </form>
    `;
  }

  function renderizarTabela(execList) {
    tableBody.innerHTML = '';
    execList.forEach(exec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${exec.id}</td>
        <td>${exec.abertura_servico_id}</td>
        <td>${exec.funcionario?.nome || exec.funcionario_id || ''}</td>
        <td>${exec.dataFinalizacao ? exec.dataFinalizacao.substring(0,10) : ''}</td>
        <td>${exec.valor}</td>
        <td>${exec.valorComDesconto || ''}</td>
        <td>${exec.formaPagamento?.descricao || exec.forma_pagamento_id || ''}</td>
        <td>${exec.status || ''}</td>
        <td>
          <button class="editar-btn" data-id="${exec.id}">Editar</button>
          <button class="excluir-btn" data-id="${exec.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const exec = await resp.json();
          const options = await getSelectOptions();
          openModal(getFormHtml(exec, options));
          setupFormEvents();
        } catch {
          alert('Erro ao buscar execução.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir esta execução?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarExecucoes();
        } catch {
          alert('Erro ao excluir execução.');
        }
      });
    });
  }

  function setupFormEvents() {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('execucao-form');
    const cancelarBtn = document.getElementById('cancelar-exec');
    const closeBtn = document.querySelector('.modal-close');
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('execucao-id').value;
      const exec = {
        abertura_servico_id: document.getElementById('exec-ordem').value,
        funcionario_id: document.getElementById('exec-funcionario').value,
        dataFinalizacao: document.getElementById('exec-data').value,
        valor: document.getElementById('exec-valor').value,
        valorComDesconto: document.getElementById('exec-valor-desc').value,
        forma_pagamento_id: document.getElementById('exec-forma').value
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exec)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exec)
          });
        }
        if (!resp.ok) {
          const erro = await resp.json();
          alert(erro.error || 'Erro ao salvar execução.');
          return;
        }
        carregarExecucoes();
        closeModal();
      } catch {
        alert('Erro ao salvar execução.');
      }
    });
  }

  async function carregarExecucoes() {
    try {
      const resp = await fetch(API_URL);
      const execList = await resp.json();
      renderizarTabela(execList);
    } catch (err) {
      alert('Erro ao carregar execuções.');
    }
  }

  novoBtn.addEventListener('click', async () => {
    const options = await getSelectOptions();
    openModal(getFormHtml({}, options));
    setupFormEvents();
  });

  carregarExecucoes();
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
  const API_URL = `${BASE_URL}/reservas-peca`;
  const tableBody = document.querySelector('#reservas-table tbody');
  const novoBtn = document.getElementById('nova-reserva');
  let servicosCache = [];

  // Função para buscar opções para o formulário de reserva
  async function getSelectOptions() {
    // Buscar ordens de serviço e peças
    const [ordensResp, pecasResp] = await Promise.all([
      fetch(`${BASE_URL}/aberturaservico`),
      fetch(`${BASE_URL}/pecas`)
    ]);
    const ordens = await ordensResp.json();
    const pecas = await pecasResp.json();
    return { ordens, pecas };
  }

  function getFormHtml(reserva = {}, options = {}, reservasOrdem = []) {
    const { pecas = [], ordens = [] } = options;
    // Mapeia reservas já feitas para a ordem
    const reservasPorPeca = {};
    reservasOrdem.forEach(r => {
      reservasPorPeca[r.peca_id] = (reservasPorPeca[r.peca_id] || 0) + Number(r.quantidade);
    });
    return `
      <button class="modal-close" title="Fechar" type="button">&times;</button>
      <h2>${reserva.id ? 'Editar Reserva de Peça' : 'Nova Reserva de Peça'}</h2>
      <form id="reserva-form">
        <input type="hidden" id="reserva-id" value="${reserva.id || ''}">
        <div><label>Ordem de Serviço:</label><select id="reserva-ordem" required>
          <option value="">Selecione</option>
          ${ordens.map(o => `<option value="${o.id}" ${reserva.abertura_servico_id==o.id?'selected':''}>${o.id} - ${o.veiculo?.placa || ''} - ${o.servico?.descricao || ''}</option>`).join('')}
        </select></div>
        <div><label>Peça:</label><select id="reserva-peca" required autocomplete="off">
          <option value="">Selecione</option>
          ${pecas.map(p => {
            const reservado = reservasPorPeca[p.id] || 0;
            const disponivel = Math.max(0, p.estoque - reservado + (reserva.peca_id==p.id ? Number(reserva.quantidade||0) : 0));
            return `<option value="${p.id}" data-disponivel="${disponivel}" ${reserva.peca_id==p.id?'selected':''}>${p.nome} (Disponível: ${disponivel})</option>`;
          }).join('')}
        </select></div>
        <div><label>Quantidade:</label><input type="number" id="reserva-quantidade" min="1" value="${reserva.quantidade || 1}" required></div>
        <small id="reserva-limite-msg"></small>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-reserva">Cancelar</button>
      </form>
    `;
  }

  function setupFormEvents(reservasOrdem = []) {
    const modal = document.querySelector('.modal-backdrop');
    if (!modal) return;
    const form = document.getElementById('reserva-form');
    const cancelarBtn = document.getElementById('cancelar-reserva');
    const closeBtn = document.querySelector('.modal-close');
    const ordemSelect = document.getElementById('reserva-ordem');
    const pecaSelect = document.getElementById('reserva-peca');
    const qtdInput = document.getElementById('reserva-quantidade');
    const msg = document.getElementById('reserva-limite-msg');

    async function atualizarLimite() {
      const ordemId = ordemSelect.value;
      const pecaId = pecaSelect.value;
      if (!ordemId || !pecaId) {
        qtdInput.max = 1;
        msg.textContent = '';
        return;
      }
      let reservado = 0;
      const reservaAtualId = document.getElementById('reserva-id')?.value;
      reservasOrdem.forEach(r => {
        if (r.peca_id == pecaId && (!reservaAtualId || r.id != reservaAtualId)) {
          reservado += Number(r.quantidade);
        }
      });
      // Buscar estoque real da peça selecionada
      const options = await getSelectOptions();
      const pecaObj = options.pecas.find(p => p.id == pecaId);
      const estoque = pecaObj ? Number(pecaObj.estoque) : 0;
      const maxQtd = Math.min(5 - reservado, estoque);
      qtdInput.max = maxQtd > 0 ? maxQtd : 1;
      msg.textContent = `Máximo permitido: ${qtdInput.max}`;
      if (Number(qtdInput.value) > qtdInput.max) qtdInput.value = qtdInput.max;
    }

    ordemSelect.addEventListener('change', async () => {
      const ordemId = ordemSelect.value;
      const options = await getSelectOptions();
      const reservasOrdemAtual = await getReservasPorOrdem(ordemId);
      // Atualiza apenas o select de peças
      pecaSelect.innerHTML = '<option value="">Selecione</option>' +
        options.pecas.map(p => {
          const reservado = reservasOrdemAtual.reduce((acc, r) => r.peca_id == p.id ? acc + Number(r.quantidade) : acc, 0);
          const disponivel = Math.max(0, p.estoque - reservado);
          return `<option value="${p.id}" data-disponivel="${disponivel}">${p.nome} (Disponível: ${disponivel})</option>`;
        }).join('');
      // Atualiza o limite de quantidade
      atualizarLimite();
    });
    // Garante que o select de peças só chama atualizarLimite
    pecaSelect.addEventListener('change', e => {
      e.stopPropagation();
      atualizarLimite();
    });
    qtdInput.addEventListener('input', atualizarLimite);
    cancelarBtn.addEventListener('click', e => { e.preventDefault(); closeModal(); });
    closeBtn.addEventListener('click', closeModal);
    atualizarLimite();
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('reserva-id').value;
      const reserva = {
        abertura_servico_id: document.getElementById('reserva-ordem').value,
        peca_id: document.getElementById('reserva-peca').value,
        quantidade: document.getElementById('reserva-quantidade').value
      };
      try {
        let resp;
        if (id) {
          resp = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
          });
        } else {
          resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva)
          });
        }
        if (!resp.ok) {
          const erro = await resp.json();
          alert(erro.error || 'Erro ao salvar reserva.');
          return;
        }
        carregarReservas();
        closeModal();
      } catch {
        alert('Erro ao salvar reserva.');
      }
    });
  }

  async function carregarReservas() {
    try {
      await carregarServicosCache();
      const resp = await fetch(API_URL);
      const reservas = await resp.json();
      console.log('RESERVAS CARREGADAS:', reservas);
      renderizarTabela(reservas);
    } catch (err) {
      console.error('ERRO AO CARREGAR RESERVAS:', err);
      alert('Erro ao carregar reservas.');
    }
  }

  function renderizarTabela(reservas) {
    if (!Array.isArray(reservas)) {
      console.error('RESERVAS NÃO É ARRAY:', reservas);
      alert('Erro ao processar reservas.');
      return;
    }
    tableBody.innerHTML = '';
    reservas.forEach(reserva => {
      // Nome da peça
      const nomePeca = reserva.peca?.nome || reserva.peca_id || '';
      // Ordem de serviço (ID)
      const ordemId = reserva.abertura_servico_id || reserva.servico?.id || '';
      // Descrição do serviço (busca pelo ID na lista de serviços)
      let descServico = '';
      const servicoId = reserva.servico?.servico_id || reserva.servico_id;
      if (servicoId && servicosCache.length) {
        const serv = servicosCache.find(s => s.id == servicoId);
        if (serv) descServico = serv.descricao;
      }
      // Linha da tabela
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${reserva.id}</td>
        <td>${nomePeca}</td>
        <td>${ordemId}${descServico ? ' (' + descServico + ')' : ''}</td>
        <td>${reserva.quantidade}</td>
        <td>${reserva.createdAt ? reserva.createdAt.substring(0,10) : ''}</td>
        <td>
          <button class="editar-btn" data-id="${reserva.id}">Editar</button>
          <button class="excluir-btn" data-id="${reserva.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
    document.querySelectorAll('.editar-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`);
          if (!resp.ok) throw new Error();
          const reserva = await resp.json();
          const options = await getSelectOptions();
          const reservasOrdem = await getReservasPorOrdem(reserva.abertura_servico_id);
          openModal(getFormHtml(reserva, options, reservasOrdem));
          setupFormEvents(reservasOrdem);
        } catch (e) {
          console.error('ERRO AO BUSCAR RESERVA:', e);
          alert('Erro ao buscar reserva.');
        }
      });
    });
    document.querySelectorAll('.excluir-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja excluir esta reserva?')) return;
        try {
          const resp = await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
          if (!resp.ok) throw new Error();
          carregarReservas();
        } catch (e) {
          console.error('ERRO AO EXCLUIR RESERVA:', e);
          alert('Erro ao excluir reserva.');
        }
      });
    });
  }

  novoBtn.addEventListener('click', async () => {
    const options = await getSelectOptions();
    openModal(getFormHtml({}, options, []));
    setupFormEvents([]);
  });

  carregarReservas();

  // Função para buscar e preencher o cache de serviços
  async function carregarServicosCache() {
    try {
      const resp = await fetch(`${BASE_URL}/servicos`);
      servicosCache = await resp.json();
    } catch (err) {
      servicosCache = [];
    }
  }

  // Função para buscar reservas de uma ordem específica
  async function getReservasPorOrdem(ordemId) {
    if (!ordemId) return [];
    try {
      const resp = await fetch(`${BASE_URL}/reservas-peca?abertura_servico_id=${ordemId}`);
      if (!resp.ok) return [];
      return await resp.json();
    } catch {
      return [];
    }
  }
}

// Relatórios SPA
function renderRelatorioOSFuncionario() {
  app.innerHTML = `
    <section>
      <h2>Ordens de Serviço por Funcionário</h2>
      <form id="filtro-relatorio-os-funcionario">
        <label>De: <input type="date" id="data-inicio"></label>
        <label>Até: <input type="date" id="data-fim"></label>
        <button type="submit">Buscar</button>
      </form>
      <div id="relatorio-os-funcionario-tabela"></div>
      <canvas id="relatorio-os-funcionario-grafico" style="max-width:600px;"></canvas>
    </section>
  `;

  document.getElementById('filtro-relatorio-os-funcionario').onsubmit = async function(e) {
    e.preventDefault();
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    if (!dataInicio || !dataFim) {
      alert('Selecione o período!');
      return;
    }
    const url = `${BASE_URL}/abertura-servico/relatorio/funcionarios?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar relatório');
      const dados = await resp.json();
      renderTabelaOSFuncionario(dados);
      renderGraficoOSFuncionario(dados);
    } catch (err) {
      alert('Erro ao buscar relatório: ' + err.message);
    }
  };
}

function renderTabelaOSFuncionario(dados) {
  const tabelaDiv = document.getElementById('relatorio-os-funcionario-tabela');
  if (!dados.length) {
    tabelaDiv.innerHTML = '<p>Nenhum dado encontrado para o período.</p>';
    return;
  }
  let html = '<table class="tabela-relatorio"><thead><tr><th>Funcionário</th><th>Qtd. Ordens</th></tr></thead><tbody>';
  for (const item of dados) {
    html += `<tr><td>${item.nomeFuncionario}</td><td>${item.totalOrdens}</td></tr>`;
  }
  html += '</tbody></table>';
  tabelaDiv.innerHTML = html;
}

let chartOSFuncionario;
function renderGraficoOSFuncionario(dados) {
  const ctx = document.getElementById('relatorio-os-funcionario-grafico').getContext('2d');
  if (chartOSFuncionario) chartOSFuncionario.destroy();
  chartOSFuncionario = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.map(d => d.nomeFuncionario),
      datasets: [{
        label: 'Qtd. Ordens',
        data: dados.map(d => d.totalOrdens),
        backgroundColor: 'rgba(255, 205, 0, 0.7)',
        borderColor: 'rgba(0,0,0,0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderRelatorioServicosMais() {
  app.innerHTML = `
    <section>
      <h2>Serviços mais prestados</h2>
      <form id="filtro-relatorio-servicos-mais">
        <label>De: <input type="date" id="data-inicio"></label>
        <label>Até: <input type="date" id="data-fim"></label>
        <button type="submit">Buscar</button>
      </form>
      <div id="relatorio-servicos-mais-tabela"></div>
      <canvas id="relatorio-servicos-mais-grafico" style="max-width:600px;"></canvas>
    </section>
  `;

  document.getElementById('filtro-relatorio-servicos-mais').onsubmit = async function(e) {
    e.preventDefault();
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    if (!dataInicio || !dataFim) {
      alert('Selecione o período!');
      return;
    }
    const url = `${BASE_URL}/relatorio-servicos?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar relatório');
      const dados = await resp.json();
      renderTabelaServicosMais(dados);
      renderGraficoServicosMais(dados);
    } catch (err) {
      alert('Erro ao buscar relatório: ' + err.message);
    }
  };
}

function renderTabelaServicosMais(dados) {
  const tabelaDiv = document.getElementById('relatorio-servicos-mais-tabela');
  if (!dados.length) {
    tabelaDiv.innerHTML = '<p>Nenhum dado encontrado para o período.</p>';
    return;
  }
  let html = '<table class="tabela-relatorio"><thead><tr><th>Serviço</th><th>Qtd. Prestada</th><th>Receita Total</th></tr></thead><tbody>';
  for (const item of dados) {
    html += `<tr><td>${item.descricaoServico}</td><td>${item.quantidadeServico}</td><td>R$ ${Number(item.receitaTotal).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td></tr>`;
  }
  html += '</tbody></table>';
  tabelaDiv.innerHTML = html;
}

let chartServicosMais;
function renderGraficoServicosMais(dados) {
  const ctx = document.getElementById('relatorio-servicos-mais-grafico').getContext('2d');
  if (chartServicosMais) chartServicosMais.destroy();
  chartServicosMais = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.map(d => d.descricaoServico),
      datasets: [{
        label: 'Qtd. Prestada',
        data: dados.map(d => d.quantidadeServico),
        backgroundColor: 'rgba(255, 205, 0, 0.7)',
        borderColor: 'rgba(0,0,0,0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderRelatorioPecasMais() {
  app.innerHTML = `
    <section>
      <h2>Peças mais reservadas</h2>
      <form id="filtro-relatorio-pecas-mais">
        <label>De: <input type="date" id="data-inicio"></label>
        <label>Até: <input type="date" id="data-fim"></label>
        <button type="submit">Buscar</button>
      </form>
      <div id="relatorio-pecas-mais-tabela"></div>
      <canvas id="relatorio-pecas-mais-grafico" style="max-width:600px;"></canvas>
    </section>
  `;

  document.getElementById('filtro-relatorio-pecas-mais').onsubmit = async function(e) {
    e.preventDefault();
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    if (!dataInicio || !dataFim) {
      alert('Selecione o período!');
      return;
    }
    const url = `${BASE_URL}/reservas-peca/relatorio/mais-reservadas?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar relatório');
      const dados = await resp.json();
      renderTabelaPecasMais(dados);
      renderGraficoPecasMais(dados);
    } catch (err) {
      alert('Erro ao buscar relatório: ' + err.message);
    }
  };
}

function renderTabelaPecasMais(dados) {
  const tabelaDiv = document.getElementById('relatorio-pecas-mais-tabela');
  if (!dados.length) {
    tabelaDiv.innerHTML = '<p>Nenhum dado encontrado para o período.</p>';
    return;
  }
  let html = '<table class="tabela-relatorio"><thead><tr><th>Peça</th><th>Qtd. Reservada</th></tr></thead><tbody>';
  for (const item of dados) {
    html += `<tr><td>${item.nomePeca}</td><td>${item.totalReservada}</td></tr>`;
  }
  html += '</tbody></table>';
  tabelaDiv.innerHTML = html;
}

let chartPecasMais;
function renderGraficoPecasMais(dados) {
  const ctx = document.getElementById('relatorio-pecas-mais-grafico').getContext('2d');
  if (chartPecasMais) chartPecasMais.destroy();
  chartPecasMais = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.map(d => d.nomePeca),
      datasets: [{
        label: 'Qtd. Reservada',
        data: dados.map(d => d.totalReservada),
        backgroundColor: 'rgba(255, 205, 0, 0.7)',
        borderColor: 'rgba(0,0,0,0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderRelatorioServicosPecas() {
  app.innerHTML = `
    <section>
      <h2>Serviços com mais peças reservadas</h2>
      <form id="filtro-relatorio-servicos-pecas">
        <label>De: <input type="date" id="data-inicio"></label>
        <label>Até: <input type="date" id="data-fim"></label>
        <button type="submit">Buscar</button>
      </form>
      <div id="relatorio-servicos-pecas-tabela"></div>
      <canvas id="relatorio-servicos-pecas-grafico" style="max-width:600px;"></canvas>
    </section>
  `;

  document.getElementById('filtro-relatorio-servicos-pecas').onsubmit = async function(e) {
    e.preventDefault();
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    if (!dataInicio || !dataFim) {
      alert('Selecione o período!');
      return;
    }
    const url = `${BASE_URL}/reservas-peca/relatorio/servicos-mais-pecas?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar relatório');
      const dados = await resp.json();
      renderTabelaServicosPecas(dados);
      renderGraficoServicosPecas(dados);
    } catch (err) {
      alert('Erro ao buscar relatório: ' + err.message);
    }
  };
}

function renderTabelaServicosPecas(dados) {
  const tabelaDiv = document.getElementById('relatorio-servicos-pecas-tabela');
  if (!dados.length) {
    tabelaDiv.innerHTML = '<p>Nenhum dado encontrado para o período.</p>';
    return;
  }
  let html = '<table class="tabela-relatorio"><thead><tr><th>Serviço</th><th>Qtd. de Reservas</th></tr></thead><tbody>';
  for (const item of dados) {
    html += `<tr><td>${item.descricaoServico}</td><td>${item.totalReservas}</td></tr>`;
  }
  html += '</tbody></table>';
  tabelaDiv.innerHTML = html;
}

let chartServicosPecas;
function renderGraficoServicosPecas(dados) {
  const ctx = document.getElementById('relatorio-servicos-pecas-grafico').getContext('2d');
  if (chartServicosPecas) chartServicosPecas.destroy();
  chartServicosPecas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.map(d => d.descricaoServico),
      datasets: [{
        label: 'Qtd. de Reservas',
        data: dados.map(d => d.totalReservas),
        backgroundColor: 'rgba(255, 205, 0, 0.7)',
        borderColor: 'rgba(0,0,0,0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderRelatorioOSExecutadas() {
  app.innerHTML = `
    <section>
      <h2>Ordens de Serviço Executadas</h2>
      <form id="filtro-relatorio-os-executadas">
        <label>De: <input type="date" id="data-inicio"></label>
        <label>Até: <input type="date" id="data-fim"></label>
        <button type="submit">Buscar</button>
      </form>
      <div id="relatorio-os-executadas-tabela"></div>
      <canvas id="relatorio-os-executadas-grafico" style="max-width:600px;"></canvas>
    </section>
  `;

  document.getElementById('filtro-relatorio-os-executadas').onsubmit = async function(e) {
    e.preventDefault();
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    if (!dataInicio || !dataFim) {
      alert('Selecione o período!');
      return;
    }
    const url = `${BASE_URL}/ExecucaoServico/relatorios/ordens?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar relatório');
      const dados = await resp.json();
      renderTabelaOSExecutadas(dados);
      renderGraficoOSExecutadas(dados);
    } catch (err) {
      alert('Erro ao buscar relatório: ' + err.message);
    }
  };
}

function renderTabelaOSExecutadas(dados) {
  const tabelaDiv = document.getElementById('relatorio-os-executadas-tabela');
  if (!dados.length) {
    tabelaDiv.innerHTML = '<p>Nenhum dado encontrado para o período.</p>';
    return;
  }
  let html = '<table class="tabela-relatorio"><thead><tr><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Valor</th><th>Data Abertura</th><th>Data Finalização</th><th>Responsável</th><th>Status</th></tr></thead><tbody>';
  for (const item of dados) {
    html += `<tr>
      <td>${item.cliente.nome}</td>
      <td>${item.veiculo.placa} - ${item.veiculo.modelo}</td>
      <td>${item.servico.descricao}</td>
      <td>R$ ${Number(item.valores.total).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
      <td>${item.datas.abertura}</td>
      <td>${item.datas.finalizacao}</td>
      <td>${item.responsavel.nome}</td>
      <td>${item.ordem_servico.status}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  tabelaDiv.innerHTML = html;
}

let chartOSExecutadas;
function renderGraficoOSExecutadas(dados) {
  // Agrupar por data de finalização
  const contagemPorDia = {};
  for (const item of dados) {
    const data = item.datas.finalizacao;
    contagemPorDia[data] = (contagemPorDia[data] || 0) + 1;
  }
  const labels = Object.keys(contagemPorDia).sort((a,b)=>{
    const [da,ma,aa]=a.split('/');
    const [db,mb,ab]=b.split('/');
    return new Date(aa,ma-1,da)-new Date(ab,mb-1,db);
  });
  const valores = labels.map(l => contagemPorDia[l]);
  const ctx = document.getElementById('relatorio-os-executadas-grafico').getContext('2d');
  if (chartOSExecutadas) chartOSExecutadas.destroy();
  chartOSExecutadas = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'OS Executadas',
        data: valores,
        backgroundColor: 'rgba(255, 205, 0, 0.5)',
        borderColor: 'rgba(0,0,0,0.8)',
        borderWidth: 2,
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function renderRelatorioDesempenhoFunc() {
  app.innerHTML = `
    <section>
      <h2>Desempenho de Funcionário</h2>
      <form id="filtro-relatorio-desempenho-func">
        <label>De: <input type="date" id="data-inicio"></label>
        <label>Até: <input type="date" id="data-fim"></label>
        <button type="submit">Buscar</button>
      </form>
      <div id="relatorio-desempenho-func-tabela"></div>
      <canvas id="relatorio-desempenho-func-grafico" style="max-width:600px;"></canvas>
    </section>
  `;

  document.getElementById('filtro-relatorio-desempenho-func').onsubmit = async function(e) {
    e.preventDefault();
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    if (!dataInicio || !dataFim) {
      alert('Selecione o período!');
      return;
    }
    const url = `${BASE_URL}/ExecucaoServico/relatorios/desempenho?dataInicio=${dataInicio}&dataFim=${dataFim}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Erro ao buscar relatório');
      const dados = await resp.json();
      renderTabelaDesempenhoFunc(dados);
      renderGraficoDesempenhoFunc(dados);
    } catch (err) {
      alert('Erro ao buscar relatório: ' + err.message);
    }
  };
}

function renderTabelaDesempenhoFunc(dados) {
  const tabelaDiv = document.getElementById('relatorio-desempenho-func-tabela');
  if (!dados.length) {
    tabelaDiv.innerHTML = '<p>Nenhum dado encontrado para o período.</p>';
    return;
  }
  let html = '<table class="tabela-relatorio"><thead><tr><th>Funcionário</th><th>Cargo</th><th>Especialidade</th><th>Total Serviços</th><th>Concluídos</th><th>Tempo Médio (dias)</th><th>Taxa Conclusão</th><th>Eficiência</th><th>Valor Total</th></tr></thead><tbody>';
  for (const item of dados) {
    html += `<tr>
      <td>${item.funcionario.nome}</td>
      <td>${item.funcionario.cargo}</td>
      <td>${item.funcionario.especialidade}</td>
      <td>${item.indicadores.total_servicos}</td>
      <td>${item.indicadores.servicos_concluidos}</td>
      <td>${item.indicadores.tempo_medio_dias}</td>
      <td>${item.indicadores.taxa_conclusao}</td>
      <td>${item.indicadores.eficiencia}</td>
      <td>R$ ${Number(item.indicadores.valor_total_servicos).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
    </tr>`;
  }
  html += '</tbody></table>';
  tabelaDiv.innerHTML = html;
}

let chartDesempenhoFunc;
function renderGraficoDesempenhoFunc(dados) {
  const ctx = document.getElementById('relatorio-desempenho-func-grafico').getContext('2d');
  if (chartDesempenhoFunc) chartDesempenhoFunc.destroy();
  chartDesempenhoFunc = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dados.map(d => d.funcionario.nome),
      datasets: [{
        label: 'Eficiência (%)',
        data: dados.map(d => parseFloat(d.indicadores.eficiencia)),
        backgroundColor: 'rgba(255, 205, 0, 0.7)',
        borderColor: 'rgba(0,0,0,0.8)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Inicialização
setupMenu(); 