import { Peca } from '../models/Peca.js';

export const PecaController = {
  async findAll(req, res) {
    try {
      const pecas = await Peca.findAll();
      res.json(pecas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async findByPk(req, res) {
    try {
      const { id } = req.params;
      const peca = await Peca.findByPk(id);
      if (!peca) return res.status(404).json({ error: 'Peça não encontrada!' });
      res.json(peca);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { nome, codigo, preco, estoque } = req.body;
      const novaPeca = await Peca.create({ nome, codigo, preco, estoque });
      res.status(201).json(novaPeca);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, codigo, preco, estoque } = req.body;
      const peca = await Peca.findByPk(id);
      if (!peca) return res.status(404).json({ error: 'Peça não encontrada!' });
      await peca.update({ nome, codigo, preco, estoque });
      res.json(peca);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const peca = await Peca.findByPk(id);
      if (!peca) return res.status(404).json({ error: 'Peça não encontrada!' });
      await peca.destroy();
      res.json({ mensagem: 'Peça excluída com sucesso!' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}; 