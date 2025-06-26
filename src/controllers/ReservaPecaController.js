import { ReservaPeca } from '../models/ReservaPeca.js';
import { Peca } from '../models/Peca.js';
import { AberturaServico } from '../models/AberturaServico.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ReservaPecaController = {
  async findAll(req, res) {
    try {
      const reservas = await ReservaPeca.findAll({ include: ['peca', 'servico'] });
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async findByPk(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaPeca.findByPk(id, { include: ['peca', 'servico'] });
      if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada!' });
      res.json(reserva);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { abertura_servico_id, peca_id, quantidade } = req.body;
      // Regra 1: Não pode reservar mais de 5 peças para o mesmo serviço
      const totalReservadas = await ReservaPeca.sum('quantidade', {
        where: { abertura_servico_id }
      });
      if ((totalReservadas || 0) + quantidade > 5) {
        return res.status(400).json({ error: 'Não é possível reservar mais de 5 peças para este serviço!' });
      }
      // Regra 2: Não pode reservar a mesma peça mais de uma vez para o mesmo serviço
      const reservaExistente = await ReservaPeca.findOne({ where: { abertura_servico_id, peca_id } });
      if (reservaExistente) {
        return res.status(400).json({ error: 'Já existe uma reserva desta peça para este serviço!' });
      }
      // Regra 3: Não pode reservar mais peças do que o estoque disponível
      const peca = await Peca.findByPk(peca_id);
      if (!peca) return res.status(404).json({ error: 'Peça não encontrada!' });
      const totalReservadasDestaPeca = await ReservaPeca.sum('quantidade', {
        where: { peca_id }
      });
      if ((totalReservadasDestaPeca || 0) + quantidade > peca.estoque) {
        return res.status(400).json({ error: 'Não há estoque suficiente para reservar esta quantidade de peças!' });
      }
      // Criação da reserva
      const reserva = await ReservaPeca.create({ abertura_servico_id, peca_id, quantidade });
      res.status(201).json(reserva);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;
      const reserva = await ReservaPeca.findByPk(id);
      if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada!' });
      // Reaplicar as regras de negócio ao atualizar
      const totalReservadas = await ReservaPeca.sum('quantidade', {
        where: {
          abertura_servico_id: reserva.abertura_servico_id,
          id: { [Op.ne]: id }
        }
      });
      if ((totalReservadas || 0) + quantidade > 5) {
        return res.status(400).json({ error: 'Não é possível reservar mais de 5 peças para este serviço!' });
      }
      const peca = await Peca.findByPk(reserva.peca_id);
      const totalReservadasDestaPeca = await ReservaPeca.sum('quantidade', {
        where: {
          peca_id: reserva.peca_id,
          id: { [Op.ne]: id }
        }
      });
      if ((totalReservadasDestaPeca || 0) + quantidade > peca.estoque) {
        return res.status(400).json({ error: 'Não há estoque suficiente para reservar esta quantidade de peças!' });
      }
      await reserva.update({ quantidade });
      res.json(reserva);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaPeca.findByPk(id);
      if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada!' });
      await reserva.destroy();
      res.json({ mensagem: 'Reserva excluída com sucesso!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Relatório: Peças mais reservadas no período
  async relatorioMaisReservadas(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      if (!dataInicio || !dataFim) {
        return res.status(400).json({ error: 'As datas de início e fim são obrigatórias!' });
      }
      const reservas = await ReservaPeca.findAll({
        include: [
          {
            model: Peca,
            as: 'peca',
            attributes: ['id', 'nome']
          },
          {
            model: AberturaServico,
            as: 'servico',
            attributes: [],
            where: {
              data: { [Op.between]: [dataInicio, dataFim] }
            }
          }
        ],
        attributes: [
          'peca_id',
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'totalReservada']
        ],
        group: ['peca_id', 'peca.id', 'peca.nome'],
        order: [[sequelize.fn('SUM', sequelize.col('quantidade')), 'DESC']]
      });
      const resultado = reservas.map(r => ({
        pecaId: r.peca_id,
        nomePeca: r.peca?.nome || 'Desconhecida',
        totalReservada: r.get('totalReservada')
      }));
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Relatório: Serviços com mais peças reservadas no período
  async relatorioServicosMaisPecas(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      if (!dataInicio || !dataFim) {
        return res.status(400).json({ error: 'As datas de início e fim são obrigatórias!' });
      }
      const reservas = await ReservaPeca.findAll({
        include: [
          {
            model: AberturaServico,
            as: 'servico',
            attributes: ['id'],
            where: {
              data: { [Op.between]: [dataInicio, dataFim] }
            },
            include: [{
              model: require('../models/Servico.js').Servico,
              as: 'servico',
              attributes: ['id', 'descricao']
            }]
          }
        ],
        attributes: [
          'abertura_servico_id',
          [sequelize.fn('SUM', sequelize.col('quantidade')), 'totalPecas']
        ],
        group: ['servico.servico.id', 'servico.servico.descricao'],
        order: [[sequelize.fn('SUM', sequelize.col('quantidade')), 'DESC']]
      });
      const resultado = reservas.map(r => ({
        servicoId: r.servico?.servico?.id || null,
        descricaoServico: r.servico?.servico?.descricao || 'Desconhecido',
        totalPecas: r.get('totalPecas')
      }));
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 