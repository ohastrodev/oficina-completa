// Desenvolvido por Diego Chaves Ravani
import { AberturaServico } from '../models/AberturaServico.js';
import { Cliente } from '../models/Cliente.js';
import { Veiculo } from '../models/Veiculo.js';
import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { QueryTypes } from 'sequelize';

class AberturaServicoService {
  static async findAll() {
    return await AberturaServico.findAll({
      include: [
        { all: true, nested: true }
      ]
    });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return await AberturaServico.findByPk(id, {
      include: [
        { all: true, nested: true }
      ]
    });
  }

  static async create(req) {
    const {
      data,
      servicoId,
      funcionarioId,
      nomeCliente,
      cpfCliente,
      veiculoId
    } = req.body;

    if (!data || !servicoId || !funcionarioId || !nomeCliente || !cpfCliente || !veiculoId) {
      throw 'Todos os campos são obrigatórios!';
    }

    await this.verificarLimiteOrdemServico(req);
    await this.verificarDisponibilidadeDoFuncionario(req);


    const t = await sequelize.transaction();

    try {
      let cliente = await Cliente.findOne({
        where: { cpf: cpfCliente },
        transaction: t
      });

      if (!cliente) {
        cliente = await Cliente.create({
          nome: nomeCliente,
          cpf: cpfCliente
        }, { transaction: t });
      }

      const veiculo = await Veiculo.findByPk(veiculoId, { transaction: t });
      if (!veiculo) {
        throw 'Veículo não encontrado!';
      }

      const novaOrdem = await AberturaServico.create({
        data,
        veiculoId: veiculo.id,
        servicoId,
        funcionario_id: funcionarioId
      }, { transaction: t });

      await t.commit();

      return await AberturaServico.findByPk(novaOrdem.id, {
        include: { all: true, nested: true }
      });

    } catch (error) {
      await t.rollback();
      console.error(error);
      throw 'Erro ao criar ordem de serviço.';
    }
  }

  static async update(req) {
    const { id } = req.params;
    const { data, veiculoId, servicoId, funcionarioId } = req.body;

    const ordem = await AberturaServico.findByPk(id);
    if (!ordem) throw 'Ordem de serviço não encontrada!';

    if (!data || !veiculoId || !servicoId || !funcionarioId) {
      throw 'Todos os campos são obrigatórios!';
    }

    if (ordem.data !== data || ordem.funcionario_id !== funcionarioId) {
      await this.verificarLimiteOrdemServico(req);
      await this.verificarDisponibilidadeDoFuncionario(req)
    }

    const t = await sequelize.transaction();

    try {
      Object.assign(ordem, { data, veiculoId, servicoId, funcionario_id: funcionarioId });
      await ordem.save({ transaction: t });
      await t.commit();

      return await AberturaServico.findByPk(ordem.id, { include: { all: true, nested: true } });
    } catch (error) {
      await t.rollback();
      throw 'Erro ao atualizar ordem de serviço.';
    }
  }

  static async delete(req) {
    const { id } = req.params;
    const ordem = await AberturaServico.findByPk(id);
    if (!ordem) throw 'Ordem de serviço não encontrada!';
    await ordem.destroy();
    return ordem;
  }

  //Relatório 01: quantidade de ordens de serviços abertas por funcionário por período
  static async relatorioOrdensPorFuncionario(req) {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw 'As datas de início e fim são obrigatórias!';
    }

    const objs = await sequelize.query(`
    SELECT 
      f.nome AS nomeFuncionario,
      COUNT(a.id) AS totalOrdens
    FROM 
      abertura_servico a
    INNER JOIN 
      funcionarios f ON f.id = a.funcionario_id
    WHERE 
      a.data BETWEEN :dataInicio AND :dataFim
    GROUP BY 
      f.nome
    ORDER BY 
      totalOrdens DESC
  `, {
      replacements: { dataInicio, dataFim },
      type: QueryTypes.SELECT
    });

    return objs;
  }

  //Relatório 02: Serviços mais prestados
  static async relatorioServicosMaisPrestados(req) {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      throw 'As datas de início e fim são obrigatórias!';
    }

    const resultado = await sequelize.query(`
    SELECT 
      s.descricao AS descricaoServico,
      COUNT(a.id) AS quantidadeServico,
      SUM(s.mao_obra) AS receitaTotal
    FROM 
      abertura_servico a
    INNER JOIN 
      servicos s ON s.id = a.servico_id
    WHERE 
      a.data BETWEEN :dataInicio AND :dataFim
    GROUP BY 
      s.descricao
    ORDER BY 
      quantidadeServico DESC
  `, {
        replacements: { dataInicio, dataFim },
        type: QueryTypes.SELECT
      });


    return resultado;
  }

  // Regra de Negócio 01: Limite de 10 ordens por dia
  static async verificarLimiteOrdemServico(req) {
    const { data } = req.body;

    const totalDoDia = await AberturaServico.count({
      where: {
        data: {
          [Op.eq]: data
        }
      }
    });

    if (totalDoDia >= 10) {
      throw 'Limite diário de 10 ordens de serviço atingido para esta data.';
    }

  }

  // Regra de Negócio 02: Funcionário só está vinculado uma ordem de serviço por dia
  static async verificarDisponibilidadeDoFuncionario(req) {
    const { data, funcionarioId } = req.body;
    const { id } = req.params;

    const whereClause = {
      data: {
        [Op.eq]: data
      },
      funcionario_id: funcionarioId
    };

    if (id) {
      whereClause.id = {
        [Op.ne]: id
      };
    }

    const ordensDoFuncionario = await AberturaServico.count({
      where: whereClause
    });

    if (ordensDoFuncionario >= 1) {
      throw 'Este funcionário já está atribuído a uma ordem de serviço nesta data.';
    }
  }
}

export { AberturaServicoService };
