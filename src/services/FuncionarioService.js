import { Funcionario } from "../models/Funcionario.js";

class FuncionarioService {
  static async findAll() {
    const objs = await Funcionario.findAll();
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await Funcionario.findByPk(id);
    return obj;
  }

  static async create(req) {
    const { nome, cargo, cpf, telefone, dataDeAdmissao, especialidade, salario } = req.body;
    // Validações manuais adicionais, se necessário, já que o modelo tem validações embutidas
    if (!nome) throw new Error("O Nome do Funcionário deve ser preenchido!");
    if (!cargo) throw new Error("O Cargo do Funcionário deve ser preenchido!");
    if (!cpf) throw new Error("O CPF do Funcionário deve ser preenchido!");
    if (!telefone) throw new Error("O Telefone do Funcionário deve ser preenchido!");
    if (!dataDeAdmissao) throw new Error("A Data de Admissão do Funcionário deve ser preenchida!");
    if (!especialidade) throw new Error("A Especialidade do Funcionário deve ser preenchida!");
    if (salario == null) throw new Error("O Salário do Funcionário deve ser preenchido!");

    const obj = await Funcionario.create({
      nome,
      cargo,
      cpf,
      telefone,
      dataDeAdmissao,
      especialidade,
      salario,
    });
    return await Funcionario.findByPk(obj.id);
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, cargo, cpf, telefone, dataDeAdmissao, especialidade, salario } = req.body;
    // Validações manuais para garantir consistência
    if (!nome) throw new Error("O Nome do Funcionário deve ser preenchido!");
    if (!cargo) throw new Error("O Cargo do Funcionário deve ser preenchido!");
    if (!cpf) throw new Error("O CPF do Funcionário deve ser preenchido!");
    if (!telefone) throw new Error("O Telefone do Funcionário deve ser preenchido!");
    if (!dataDeAdmissao) throw new Error("A Data de Admissão do Funcionário deve ser preenchida!");
    if (!especialidade) throw new Error("A Especialidade do Funcionário deve ser preenchida!");
    if (salario == null) throw new Error("O Salário do Funcionário deve ser preenchido!");

    const obj = await Funcionario.findByPk(id);
    if (obj == null) throw new Error("Funcionário não encontrado!");

    Object.assign(obj, {
      nome,
      cargo,
      cpf,
      telefone,
      dataDeAdmissao,
      especialidade,
      salario,
    });
    await obj.save();
    return await Funcionario.findByPk(obj.id);
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Funcionario.findByPk(id);
    if (obj == null) throw new Error("Funcionário não encontrado!");
    await obj.destroy();
    return obj;
  }
}

export { FuncionarioService };