import { Model, DataTypes } from 'sequelize';

class AberturaServico extends Model {
  static init(sequelize) {
    super.init({
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW  
      }
    }, { 
      sequelize, 
      modelName: 'AberturaServico', 
      tableName: 'abertura_servico' 
    });
  }

  static associate(models) {
    this.belongsTo(models.Veiculo, {
      foreignKey: 'veiculo_id',
      as: 'veiculo',
    });

    this.belongsTo(models.Servico, {
      foreignKey: 'servico_id',
      as: 'servico',
    });

    this.belongsTo(models.Funcionario, {
      foreignKey: 'funcionario_id',
      as: 'funcionario',
    });

    // this.hasMany(models.ExecucaoServico, {
    //   foreignKey: 'ordem_servico_id',
    //   as: 'execucoesServico',
    // });
  }
}

export { AberturaServico };
