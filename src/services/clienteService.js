//DESENVOLVIDO POR DIEGO
import { Cliente } from "../models/Cliente.js";

class ClienteService {
    static async findAll() {
        const objs = await Cliente.findAll({ include: { all: true, nested: true } });
        return objs;
    }

    static async findByPk(req) {
        const { id } = req.params;
        const obj = await Cliente.findByPk(id, { include: { all: true, nested: true } });
        return obj;
    }

    static async create(req) {
        const { nome, nascimento, cpf, cidade } = req.body;
        if (cpf == null) throw 'O CPF deve ser preenchido';
        const obj = await Cliente.create({ nome, nascimento, cpf, cidade });
        return await Cliente.findByPk(obj.id, { include: { all: true, nested: true } });
    }

    static async update(req) {
        const { id } = req.params;
        const { nome, nascimento, cpf, cidade } = req.body;
        if (cpf == null) throw 'O CPF deve ser preenchido';
        const obj = await Cliente.findByPk(id, { include: { all: true, nested: true } });
        if (obj == null) throw 'Cliente não encontrado!';
        Object.assign(obj, { nome, nascimento, cpf, cidade });
        await obj.save();
        return await Cliente.findByPk(obj.id, { include: { all: true, nested: true } });
    }

    static async delete(req) {
        const { id } = req.params;
        const obj = await Cliente.findByPk(id);
        if (obj == null)
            throw 'Cliente não encontrado!';
        try {
            await obj.destroy();
            return obj;
        } catch (error) {
            throw "Não é possível remover o cliente associado a outros registros!";
        }
    }
}

export { ClienteService };
