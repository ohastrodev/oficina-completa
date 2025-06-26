import { Veiculo } from "../models/Veiculo.js";

class VeiculoService {
  static async findAll() {
    const objs = await Veiculo.findAll();
    return objs;
  }

  static async findByPk(req) {
    const { id } = req.params;
    const obj = await Veiculo.findByPk(id);
    return obj;
  }

  static async create(req) {
    const { marca, modelo, ano, numeroChassi, tipoCombustivel, clienteId } = req.body;
    // Validações manuais adicionais, já que o modelo tem validações embutidas
    if (!marca) throw new Error("A Marca do Veículo deve ser preenchida!");
    if (!modelo) throw new Error("O Modelo do Veículo deve ser preenchido!");
    if (!ano) throw new Error("O Ano do Veículo deve ser preenchido!");
    if (!numeroChassi) throw new Error("O Número de Chassi do Veículo deve ser preenchido!");
    if (!tipoCombustivel) throw new Error("O Tipo de Combustível do Veículo deve ser preenchido!");

    const obj = await Veiculo.create({
      marca,
      modelo,
      ano,
      numeroChassi,
      tipoCombustivel,
      clienteId,
    });
    return await Veiculo.findByPk(obj.id);
  }

  static async update(req) {
    const { id } = req.params;
    const { marca, modelo, ano, numeroChassi, tipoCombustivel, clienteId } = req.body;
    // Validações manuais para garantir consistência
    if (!marca) throw new Error("A Marca do Veículo deve ser preenchida!");
    if (!modelo) throw new Error("O Modelo do Veículo deve ser preenchido!");
    if (!ano) throw new Error("O Ano do Veículo deve ser preenchido!");
    if (!numeroChassi) throw new Error("O Número de Chassi do Veículo deve ser preenchido!");
    if (!tipoCombustivel) throw new Error("O Tipo de Combustível do Veículo deve ser preenchido!");

    const obj = await Veiculo.findByPk(id);
    if (obj == null) throw new Error("Veículo não encontrado!");

    Object.assign(obj, {
      marca,
      modelo,
      ano,
      numeroChassi,
      tipoCombustivel,
      clienteId,
    });
    await obj.save();
    return await Veiculo.findByPk(obj.id);
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Veiculo.findByPk(id);
    if (obj == null) throw new Error("Veículo não encontrado!");
    await obj.destroy();
    return obj;
  }
}

export { VeiculoService };