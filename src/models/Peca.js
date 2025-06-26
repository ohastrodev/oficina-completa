import { Model, DataTypes } from 'sequelize';

class Peca extends Model {
  static init(sequelize) {
    super.init({
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Nome da peça deve ser preenchido!" },
          len: { args: [2, 50], msg: "O nome da peça deve ter entre 2 e 50 caracteres!" }
        }
      },
      codigo: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        validate: {
          isInt: { msg: "O código da peça deve ser um número inteiro!" }
        }
      },
      preco: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: { msg: "O preço da peça deve ser um valor decimal!" }
        }
      },
      estoque: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: "O estoque da peça deve ser um número inteiro!" }
        }
      }
    }, { sequelize, modelName: 'Peca', tableName: 'pecas' });
  }

  static associate(models) {
    // Associação com ReservaPeca será feita depois
  }
}

export { Peca }; 