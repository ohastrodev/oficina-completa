// Implementado por Diego Chaves Ravani
import { AberturaServicoService } from '../services/AberturaServicoService.js';

async function create(req, res) {
    try {
        const novaOrdem = await AberturaServicoService.create(req);
        res.status(201).json(novaOrdem);
    } catch (error) {
        res.status(400).json({ mensagem: error.toString() });
    }
}

async function findAll(req, res) {
    try {
        const ordens = await AberturaServicoService.findAll();
        res.status(200).json(ordens);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar ordens de serviço.' });
    }
}

async function findByPk(req, res) {
    try {
        const ordem = await AberturaServicoService.findByPk(req);
        if (!ordem) {
            return res.status(404).json({ mensagem: 'Ordem de serviço não encontrada.' });
        }
        res.status(200).json(ordem);
    } catch (error) {
        res.status(500).json({ mensagem: 'Erro ao buscar ordem de serviço.' });
    }
}

async function update(req, res) {
    try {
        const ordemAtualizada = await AberturaServicoService.update(req);
        res.status(200).json(ordemAtualizada);
    } catch (error) {
        res.status(400).json({ mensagem: error.toString() });
    }
}

async function deleteById(req, res) {
    try {
        const ordemExcluida = await AberturaServicoService.delete(req);
        res.status(200).json(ordemExcluida);
    } catch (error) {
        res.status(400).json({ mensagem: error.toString() });
    }
}

async function relatorioOrdensPorFuncionario(req, res) {
    try {
        const resultado = await AberturaServicoService.relatorioOrdensPorFuncionario(req);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(400).json({ mensagem: error.toString() });
    }
}

async function relatorioServicosMaisPrestados(req, res) {
  try {
    const resultado = await AberturaServicoService.relatorioServicosMaisPrestados(req);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ mensagem: error.toString() });
  }
}

export {
    create,
    findAll,
    findByPk,
    update,
    deleteById,
    relatorioOrdensPorFuncionario,
    relatorioServicosMaisPrestados
};
