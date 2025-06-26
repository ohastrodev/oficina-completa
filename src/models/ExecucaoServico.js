import { Model, DataTypes } from 'sequelize';

class ExecucaoServico extends Model {
  static init(sequelize) {
    super.init({
        valor: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
              isFloat: { msg: "O valor da Execucao de Servico deve ser valor decimal!" },
              notNull: { msg: "O valor da Execucao de Servico deve ser preenchido!" }
            }
        },
        dataFinalizacao: { 
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
              isDate: { msg: "A data de finalizacao deve ser preenchida no formato AAAA-MM-DD!" },
              notNull: { msg: "A data de finalizacao deve ser preenchida!" }
            }
        },
        valorComDesconto: {
            type: DataTypes.DOUBLE,
            allowNull: true
        }
    }, { 
        sequelize, 
        modelName: 'ExecucaoServico', 
        tableName: 'execucao_servicos'
    });
  }

  static associate(models) {
    this.belongsTo(models.FormaPagamento, { 
      foreignKey: 'forma_pagamento_id',
      as: 'formaPagamento'
    });
    this.belongsTo(models.AberturaServico, { 
      foreignKey: 'abertura_servico_id',
      as: 'aberturaServico'
    });
  }
}

export { ExecucaoServico };