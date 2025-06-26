// SPA Oficina Mecânica - JS principal

const BASE_URL = 'https://oficina-completa-backend-sequelize.onrender.com';
const app = document.getElementById('app');

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

// CRUD Funcionários
function renderFuncionariosSection() {
  app.innerHTML = `
    <section>
      <h2>Funcionários</h2>
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
    <section>
      <h2 id="form-title-func">Cadastrar Novo Funcionário</h2>
      <form id="funcionario-form">
        <input type="hidden" id="funcionario-id">
        <div><label>Nome:</label><input type="text" id="func-nome" required></div>
        <div><label>Cargo:</label><input type="text" id="func-cargo" required></div>
        <div><label>CPF:</label><input type="text" id="func-cpf" required></div>
        <div><label>Telefone:</label><input type="text" id="func-telefone" required></div>
        <div><label>Data de Admissão:</label><input type="date" id="func-dataDeAdmissao" required></div>
        <div><label>Especialidade:</label><input type="text" id="func-especialidade" required></div>
        <div><label>Salário:</label><input type="number" step="0.01" id="func-salario" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-func" style="display:none;">Cancelar</button>
      </form>
    </section>
  `;
  funcionariosController();
}

function funcionariosController() {
  const API_URL = `${BASE_URL}/funcionarios`;
  const tableBody = document.querySelector('#funcionarios-table tbody');
  const form = document.getElementById('funcionario-form');
  const formTitle = document.getElementById('form-title-func');
  const cancelarBtn = document.getElementById('cancelar-edicao-func');

  function limparFormulario() {
    form.reset();
    document.getElementById('funcionario-id').value = '';
    formTitle.textContent = 'Cadastrar Novo Funcionário';
    cancelarBtn.style.display = 'none';
  }

  function preencherFormulario(func) {
    document.getElementById('funcionario-id').value = func.id;
    document.getElementById('func-nome').value = func.nome;
    document.getElementById('func-cargo').value = func.cargo;
    document.getElementById('func-cpf').value = func.cpf;
    document.getElementById('func-telefone').value = func.telefone;
    document.getElementById('func-dataDeAdmissao').value = func.dataDeAdmissao;
    document.getElementById('func-especialidade').value = func.especialidade;
    document.getElementById('func-salario').value = func.salario;
    formTitle.textContent = 'Editar Funcionário';
    cancelarBtn.style.display = 'inline-block';
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
          preencherFormulario(func);
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
          limparFormulario();
        } catch {
          alert('Erro ao excluir funcionário.');
        }
      });
    });
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
      limparFormulario();
    } catch {
      alert('Erro ao salvar funcionário.');
    }
  });

  cancelarBtn.addEventListener('click', limparFormulario);

  carregarFuncionarios();
}

// CRUD Veículos
function renderVeiculosSection() {
  app.innerHTML = `
    <section>
      <h2>Veículos</h2>
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
    <section>
      <h2 id="form-title-veic">Cadastrar Novo Veículo</h2>
      <form id="veiculo-form">
        <input type="hidden" id="veiculo-id">
        <div><label>Marca:</label><input type="text" id="veic-marca" required></div>
        <div><label>Modelo:</label><input type="text" id="veic-modelo" required></div>
        <div><label>Ano:</label><input type="number" id="veic-ano" required></div>
        <div><label>Nº Chassi:</label><input type="text" id="veic-numeroChassi" required></div>
        <div><label>Tipo Combustível:</label><input type="text" id="veic-tipoCombustivel" required></div>
        <div><label>Placa:</label><input type="text" id="veic-placa" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-veic" style="display:none;">Cancelar</button>
      </form>
    </section>
  `;
  veiculosController();
}

function veiculosController() {
  const API_URL = `${BASE_URL}/veiculos`;
  const tableBody = document.querySelector('#veiculos-table tbody');
  const form = document.getElementById('veiculo-form');
  const formTitle = document.getElementById('form-title-veic');
  const cancelarBtn = document.getElementById('cancelar-edicao-veic');

  function limparFormulario() {
    form.reset();
    document.getElementById('veiculo-id').value = '';
    formTitle.textContent = 'Cadastrar Novo Veículo';
    cancelarBtn.style.display = 'none';
  }

  function preencherFormulario(veic) {
    document.getElementById('veiculo-id').value = veic.id;
    document.getElementById('veic-marca').value = veic.marca;
    document.getElementById('veic-modelo').value = veic.modelo;
    document.getElementById('veic-ano').value = veic.ano;
    document.getElementById('veic-numeroChassi').value = veic.numeroChassi;
    document.getElementById('veic-tipoCombustivel').value = veic.tipoCombustivel;
    document.getElementById('veic-placa').value = veic.placa;
    formTitle.textContent = 'Editar Veículo';
    cancelarBtn.style.display = 'inline-block';
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
          preencherFormulario(veic);
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
          limparFormulario();
        } catch {
          alert('Erro ao excluir veículo.');
        }
      });
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

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('veiculo-id').value;
    const veiculo = {
      marca: document.getElementById('veic-marca').value,
      modelo: document.getElementById('veic-modelo').value,
      ano: document.getElementById('veic-ano').value,
      numeroChassi: document.getElementById('veic-numeroChassi').value,
      tipoCombustivel: document.getElementById('veic-tipoCombustivel').value,
      placa: document.getElementById('veic-placa').value
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
      limparFormulario();
    } catch {
      alert('Erro ao salvar veículo.');
    }
  });

  cancelarBtn.addEventListener('click', limparFormulario);

  carregarVeiculos();
}

// CRUD Serviços
function renderServicosSection() {
  app.innerHTML = `
    <section>
      <h2>Serviços</h2>
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
    <section>
      <h2 id="form-title-serv">Cadastrar Novo Serviço</h2>
      <form id="servico-form">
        <input type="hidden" id="servico-id">
        <div><label>Descrição:</label><input type="text" id="serv-descricao" required></div>
        <div><label>Mão de Obra:</label><input type="number" step="0.01" id="serv-maoObra" required></div>
        <div><label>Categoria:</label><input type="text" id="serv-categoria" maxlength="1" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-serv" style="display:none;">Cancelar</button>
      </form>
    </section>
  `;
  servicosController();
}

function servicosController() {
  const API_URL = `${BASE_URL}/servicos`;
  const tableBody = document.querySelector('#servicos-table tbody');
  const form = document.getElementById('servico-form');
  const formTitle = document.getElementById('form-title-serv');
  const cancelarBtn = document.getElementById('cancelar-edicao-serv');

  function limparFormulario() {
    form.reset();
    document.getElementById('servico-id').value = '';
    formTitle.textContent = 'Cadastrar Novo Serviço';
    cancelarBtn.style.display = 'none';
  }

  function preencherFormulario(serv) {
    document.getElementById('servico-id').value = serv.id;
    document.getElementById('serv-descricao').value = serv.descricao;
    document.getElementById('serv-maoObra').value = serv.maoObra;
    document.getElementById('serv-categoria').value = serv.categoria;
    formTitle.textContent = 'Editar Serviço';
    cancelarBtn.style.display = 'inline-block';
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
          preencherFormulario(serv);
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
          limparFormulario();
        } catch {
          alert('Erro ao excluir serviço.');
        }
      });
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
      limparFormulario();
    } catch {
      alert('Erro ao salvar serviço.');
    }
  });

  cancelarBtn.addEventListener('click', limparFormulario);

  carregarServicos();
}

// CRUD Peças
function renderPecasSection() {
  app.innerHTML = `
    <section>
      <h2>Peças</h2>
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
    <section>
      <h2 id="form-title-peca">Cadastrar Nova Peça</h2>
      <form id="peca-form">
        <input type="hidden" id="peca-id">
        <div><label>Nome:</label><input type="text" id="peca-nome" required></div>
        <div><label>Código:</label><input type="number" id="peca-codigo" required></div>
        <div><label>Preço:</label><input type="number" step="0.01" id="peca-preco" required></div>
        <div><label>Estoque:</label><input type="number" id="peca-estoque" required></div>
        <button type="submit">Salvar</button>
        <button type="button" id="cancelar-edicao-peca" style="display:none;">Cancelar</button>
      </form>
    </section>
  `;
  pecasController();
}

function pecasController() {
  const API_URL = `${BASE_URL}/pecas`;
  const tableBody = document.querySelector('#pecas-table tbody');
  const form = document.getElementById('peca-form');
  const formTitle = document.getElementById('form-title-peca');
  const cancelarBtn = document.getElementById('cancelar-edicao-peca');

  function limparFormulario() {
    form.reset();
    document.getElementById('peca-id').value = '';
    formTitle.textContent = 'Cadastrar Nova Peça';
    cancelarBtn.style.display = 'none';
  }

  function preencherFormulario(peca) {
    document.getElementById('peca-id').value = peca.id;
    document.getElementById('peca-nome').value = peca.nome;
    document.getElementById('peca-codigo').value = peca.codigo;
    document.getElementById('peca-preco').value = peca.preco;
    document.getElementById('peca-estoque').value = peca.estoque;
    formTitle.textContent = 'Editar Peça';
    cancelarBtn.style.display = 'inline-block';
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
          preencherFormulario(peca);
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
          limparFormulario();
        } catch {
          alert('Erro ao excluir peça.');
        }
      });
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
      limparFormulario();
    } catch {
      alert('Erro ao salvar peça.');
    }
  });

  cancelarBtn.addEventListener('click', limparFormulario);

  carregarPecas();
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