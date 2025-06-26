import { Model, DataTypes } from 'sequelize';

class Veiculo extends Model {

  static init(sequelize) {
    super.init({
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'clientes',
                key: 'id'
            },
            validate: {
                notNull: { msg: "O cliente deve ser informado!" }
            }
        },
        marca: { 
            type: DataTypes.STRING, 
            validate: {
              notEmpty: { msg: "Marca do veículo deve ser preenchida!" },
              len: { args: [2, 30], msg: "A marca do veículo deve ter entre 2 e 30 caracteres!" }
            }
          },
        modelo: { 
            type: DataTypes.STRING, 
            validate: {
              notEmpty: { msg: "Modelo do veículo deve ser preenchida!" },
              len: { args: [2, 50], msg: "O modelo do veículo deve ter entre 2 e 50 caracteres!" }
            }
          },  
        ano: {
            type: DataTypes.INTEGER,
            validate: {
            isInt: { msg: "Modelo do veículo deve ser um numero inteiro!" },
            min: 1886,
            max: new Date().getFullYear(), //Impede a inserção de um ano futuro.
            }
        },
        numeroChassi: {
            type: DataTypes.STRING,
            validate: {
              notEmpty: { msg: "O número de chassi do carro deve ser preenchido!" },
              len: { args: [17, 17], msg: "O número de chassi deve ter 17 caracteres alfanuméricos." }
            }
        },
        tipoCombustivel: { 
            type: DataTypes.STRING, 
            validate: {
              notEmpty: { msg: "O tipo de combustível do veículo deve ser preenchid!" },
              len: { args: [3, 20], msg: "O tipo de combustível do veículo deve ter entre 3 e 20 caracteres!" }
            }
          },   
        placa: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
              notEmpty: { msg: "A placa do veículo deve ser preenchida!" },
              len: { args: [7, 8], msg: "A placa deve ter entre 7 e 8 caracteres!" },
              is: /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/i // padrão Mercosul e antigo
            }
        }
    }, { 
        sequelize, 
        modelName: 'Veiculo', 
        tableName: 'veiculos' 
    })
  }

  static associate(models) {
    this.belongsTo(models.Cliente, { 
        foreignKey: 'cliente_id',
        as: 'cliente'
    });

    this.hasMany(models.AberturaServico, {
        foreignKey: 'veiculo_id',
        as: 'aberturasServico'
    });
  } 
}

export { Veiculo };