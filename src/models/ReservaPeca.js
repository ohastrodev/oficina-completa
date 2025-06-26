import { Model, DataTypes } from 'sequelize';

class ReservaPeca extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: { msg: 'A quantidade deve ser um número inteiro!' },
          min: { args: [1], msg: 'A quantidade deve ser pelo menos 1!' }
        }
      }
    }, { sequelize, modelName: 'ReservaPeca', tableName: 'reservas_peca' });
  }

  static associate(models) {
    this.belongsTo(models.AberturaServico, {
      foreignKey: 'abertura_servico_id',
      as: 'servico'
    });
    this.belongsTo(models.Peca, {
      foreignKey: 'peca_id',
      as: 'peca'
    });
  }
}

export { ReservaPeca }; 