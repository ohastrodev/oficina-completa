import { Model, DataTypes } from 'sequelize';

class FormaPagamento extends Model {

  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      descricao: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "A descricao da forma de pagamento deve ser preenchida!" },
          len: { args: [2, 50], msg: "A descrição deve ter entre 2 e 50 letras!" },
        }
      },
      dataCadastro: {
        type: DataTypes.DATEONLY,
        validate: {
          isDate: { msg: "A data de cadastro da forma de pagamento deve ser preenchida!" },
          is: { args: ["[0-9]{4}\-[0-9]{2}\-[0-9]{2}"], msg: "A data de cadastro deve seguir o padrão yyyy-MM-dd!" }
        }
      },
      taxa: {
        type: DataTypes.FLOAT,
        validate: {
          isFloat: { msg: "A taxa deve ser preenchida com um valor decimal!" }
        }
      },
      desconto: {
        type: DataTypes.FLOAT,
        validate: {
          isFloat: { msg: "O desconto deve ser preenchido com um valor decimal!" }
        }
      }
    }, { 
        sequelize, 
        modelName: 'FormaPagamento', 
        tableName: 'formas_pagamentos' 
    })
  }

  static associate(models) {
    this.hasMany(models.ExecucaoServico, {
      foreignKey: 'forma_pagamento_id',
      as: 'execucoesServico'
    });
  }
}

export { FormaPagamento };