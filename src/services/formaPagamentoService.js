// DESENVOLVIDO POR DIEGO
import { FormaPagamento } from "../models/FormaPagamento.js";

class FormaPagamentoService {
    static async findAll() {
        const objs = await FormaPagamento.findAll({ include: { all: true, nested: true } });
        return objs;
    }

    static async findByPk(req) {
        const { id } = req.params;
        const obj = await FormaPagamento.findByPk(id, { include: { all: true, nested: true } });
        return obj;
    }

    static async create(req) {
        const { descricao, dataCadastro, taxa, desconto } = req.body;
        if (descricao == null) throw 'A descricao deve ser preenchida';
        const obj = await FormaPagamento.create({ descricao, dataCadastro, taxa, desconto });
        return await FormaPagamento.findByPk(obj.id, { include: { all: true, nested: true } });
    }

    static async update(req) {
        const { id } = req.params;
        const { descricao, dataCadastro, taxa, desconto } = req.body;
        if (descricao == null) throw 'A descrição deve ser preenchida';
        const obj = await FormaPagamento.findByPk(id, { include: { all: true, nested: true } });
        if (obj == null) throw 'Forma de pagamento não encontrado!';
        Object.assign(obj, { descricao, dataCadastro, taxa, desconto });
        await obj.save();
        return await FormaPagamento.findByPk(obj.id, { include: { all: true, nested: true } });
    }

    static async delete(req) {
        const { id } = req.params;
        const obj = await FormaPagamento.findByPk(id);
        if (obj == null)
            throw 'Forma de pagamento não encontrado!';
        try {
            await obj.destroy();
            return obj;
        } catch (error) {
            throw "Não é possível remover uma forma de pagamento associado a outros registros!";
        }
    }
}

export { FormaPagamentoService };
