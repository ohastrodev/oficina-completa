import express from "express";
import { FuncionarioController } from "./controllers/FuncionarioController.js";
import { VeiculoController } from "./controllers/VeiculoController.js";
import { ServicoController } from './controllers/ServicoController.js';
import { FormaPagamentoController } from "./controllers/formaPagamentoController.js";
import { ClienteController } from "./controllers/clienteController.js";
import * as AberturaServicoController from './controllers/AberturaServicoController.js';
import { ExecucaoServicoController } from './controllers/execucaoServicoController.js';
import { PecaController } from './controllers/PecaController.js';
import { ReservaPecaController } from './controllers/ReservaPecaController.js';


const routes = express.Router();

// 👨‍🔧 Funcionários
routes.get("/funcionarios", FuncionarioController.findAll);
routes.get("/funcionarios/:id", FuncionarioController.findByPk);
routes.post("/funcionarios", FuncionarioController.create);
routes.put("/funcionarios/:id", FuncionarioController.update);
routes.delete("/funcionarios/:id", FuncionarioController.delete);

// 🚗 Veículos
routes.get("/veiculos", VeiculoController.findAll);
routes.get("/veiculos/:id", VeiculoController.findByPk);
routes.post("/veiculos", VeiculoController.create);
routes.put("/veiculos/:id", VeiculoController.update);
routes.delete("/veiculos/:id", VeiculoController.delete);

// 🛠️ Serviços
routes.get('/servicos', ServicoController.findAll);
routes.get('/servicos/:id', ServicoController.findByPk);
routes.post('/servicos', ServicoController.create);
routes.put('/servicos/:id', ServicoController.update);
routes.delete('/servicos/:id', ServicoController.delete);

// 💳 Forma de Pagamento
routes.get('/formaPagamento', FormaPagamentoController.findAll);
routes.get('/formaPagamento/:id', FormaPagamentoController.findByPk);
routes.post('/formaPagamento', FormaPagamentoController.create);
routes.put('/formaPagamento/:id', FormaPagamentoController.update);
routes.delete('/formaPagamento/:id', FormaPagamentoController.delete);

// 👤 Cliente
routes.get('/cliente', ClienteController.findAll);
routes.get('/cliente/:id', ClienteController.findByPk);
routes.post('/cliente', ClienteController.create);
routes.put('/cliente/:id', ClienteController.update);
routes.delete('/cliente/:id', ClienteController.delete);

// 📄 Abertura de Ordem de Serviço
routes.get('/aberturaservico', AberturaServicoController.findAll);
routes.get('/aberturaservico/:id', AberturaServicoController.findByPk);
routes.post('/aberturaservico', AberturaServicoController.create);
routes.put('/aberturaservico/:id', AberturaServicoController.update);
routes.delete('/aberturaservico/:id', AberturaServicoController.deleteById);

// 🔧 Execução de Serviço
routes.get('/ExecucaoServico', ExecucaoServicoController.findAll);
routes.get('/ExecucaoServico/:id', ExecucaoServicoController.findByPk);
routes.post('/ExecucaoServico', ExecucaoServicoController.create);
routes.put('/ExecucaoServico/:id', ExecucaoServicoController.update);
routes.delete('/ExecucaoServico/:id', ExecucaoServicoController.delete);

// 📊 Relatórios de Execução de Serviço
routes.get('/ExecucaoServico/relatorios/ordens', ExecucaoServicoController.relatorioOrdensServico);
routes.get('/ExecucaoServico/relatorios/desempenho', ExecucaoServicoController.relatorioDesempenhoFuncionarios);

//Relatórios Diego Ravani
routes.get('/abertura-servico/relatorio/funcionarios', AberturaServicoController.relatorioOrdensPorFuncionario);
routes.get('/relatorio-servicos', AberturaServicoController.relatorioServicosMaisPrestados);

// 🔩 Peças
routes.get('/pecas', PecaController.findAll);
routes.get('/pecas/:id', PecaController.findByPk);
routes.post('/pecas', PecaController.create);
routes.put('/pecas/:id', PecaController.update);
routes.delete('/pecas/:id', PecaController.delete);

// 🔒 Reservas de Peças
routes.get('/reservas-peca', ReservaPecaController.findAll);
routes.get('/reservas-peca/:id', ReservaPecaController.findByPk);
routes.post('/reservas-peca', ReservaPecaController.create);
routes.put('/reservas-peca/:id', ReservaPecaController.update);
routes.delete('/reservas-peca/:id', ReservaPecaController.delete);

export default routes;
