import { Model, DataTypes } from 'sequelize';

class Servico extends Model {
  static init(sequelize) {
    super.init({
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true
      },
      descricao: { 
        type: DataTypes.TEXT, 
        validate: {
          notEmpty: { msg: "A descrição do serviço deve ser preenchida!" }
        }
      },
      maoObra: { 
        type: DataTypes.FLOAT,
        validate: {
          isFloat: { msg: "O valor da mão de obra deve ser um número decimal!" }
        }
      },
      categoria: { 
        type: DataTypes.STRING, 
        validate: {
          notEmpty: { msg: "A categoria do serviço deve ser preenchida!" },
          len: { args: [1, 1], msg: "A categoria do serviço deve conter um caractere!" }
        }
      },
    }, { sequelize, modelName: 'Servico', tableName: 'servicos' })
  }

  static associate(models) {
    // this.belongsTo(models.AberturaServico, {
    //   foreignKey: 'abertura_servico_id',
    //   as: 'ordemServico'
    // });
  }
}

export { Servico };
