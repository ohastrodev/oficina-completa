import { Model, DataTypes } from 'sequelize';

class Funcionario extends Model {

  static init(sequelize) {
    super.init({
      nome: { 
        type: DataTypes.STRING, 
        validate: {
          notEmpty: { msg: "Nome do Funcionário deve ser preenchido!" },
          len: { args: [2, 50], msg: "Nome do Funcionário deve ter entre 2 e 50 letras!" }
        }
      },
      cargo: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "O cargo do Funcionário deve ser preenchido!" },
          len: { args: [4, 35], msg: "O cargo do Funcionário deve ter entre 4 e 35 caracteres!" }
        }
      },
      cpf: { 
        type: DataTypes.STRING, 
        validate: {
          notEmpty: { msg: "CPF do Funcionário deve ser preenchido!" },
          is: {args: ["[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}"], msg: "CPF do Funcionário deve seguir o padrão NNN.NNN.NNN-NN!" },
        }
      },
      telefone: { 
        type: DataTypes.STRING, 
        validate: {
          notEmpty: { msg: "Número do Telefone do Funcionário deve ser preenchido!" },
          is: {args: /^\([0-9]{2}\) [0-9]?[0-9]{4}-[0-9]{4}/, msg: "Telefone deve seguir o padrão (NN) NNNNN-NNNN" }
        }
      },
      dataDeAdmissao: { 
        type: DataTypes.DATEONLY, 
        validate: {
          isDate: { msg: "Data de Admissão do Funcionário deve ser preenchida no formato AAAA-MM-DD!" }
        }
      },
      especialidade: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: { msg: "A especialidade do Funcionário deve ser preenchida!" },
          len: { args: [5, 30], msg: "A especialidade do Funcionário deve ter entre 5 e 30 caracteres!"}
        }
      },
      salario: {
        type: DataTypes.DOUBLE,
        validate: {
          isFloat: { msg: "O salário do Funcionário deve ser um valor decimal!" },
        }
      }
    }, { 
        sequelize, 
        modelName: 'Funcionario', 
        tableName: 'funcionarios' 
    })
  }

  static associate(models) {
    this.hasMany(models.AberturaServico, {
      foreignKey: 'funcionario_id',
      as: 'aberturasServico'
    });
  } 
}

export { Funcionario };