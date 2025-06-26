// DESENVOLVIDO POR MATHEUS
import { Servico } from "../models/Servico.js";

class ServicoService {
    static async findAll() {
        const objs = await Servico.findAll({ include: { all: true, nested: true } });
        return objs;
    }

    static async findByPk(req) {
        const { id } = req.params;
        const obj = await Servico.findByPk(id, { include: { all: true, nested: true } });
        return obj;
    }

    static async create(req) {
        const body = req.body;

        // Verifica se o body é um array
        if (Array.isArray(body)) {
            const results = [];
            for (const item of body) {
                const { descricao, maoObra, categoria } = item;
                if (categoria == null) throw `A categoria do serviço deve ser preenchida para o item ${descricao || 'desconhecido'}`;
                const obj = await Servico.create({ descricao, maoObra, categoria });
                results.push(await Servico.findByPk(obj.id, { include: { all: true, nested: true } }));
            }
            return results; // Retorna a lista de serviços criados
        } else {
            // Lógica original para um único objeto
            const { descricao, maoObra, categoria } = body;
            if (categoria == null) throw 'A categoria do serviço deve ser preenchida';
            const obj = await Servico.create({ descricao, maoObra, categoria });
            return await Servico.findByPk(obj.id, { include: { all: true, nested: true } });
        }
    }

    static async update(req) {
        const body = req.body;
        const { id } = req.params;

        // Caso seja uma requisição para atualizar um único serviço (usando req.params.id)
        if (id && !Array.isArray(body)) {
            const { descricao, maoObra, categoria } = body;
            if (categoria == null) throw 'A categoria do serviço deve ser preenchida';
            const obj = await Servico.findByPk(id, { include: { all: true, nested: true } });
            if (obj == null) throw 'Serviço não encontrado!';
            Object.assign(obj, { descricao, maoObra, categoria });
            await obj.save();
            return await Servico.findByPk(obj.id, { include: { all: true, nested: true } });
        }

        // Caso seja uma requisição para atualizar múltiplos serviços (array no body)
        if (Array.isArray(body)) {
            const results = [];
            for (const item of body) {
                const { id, descricao, maoObra, categoria } = item;
                if (!id) throw `O campo 'id' é obrigatório para o item ${descricao || 'desconhecido'}`;
                if (categoria == null) throw `A categoria do serviço deve ser preenchida para o item ${descricao || 'desconhecido'}`;
                const obj = await Servico.findByPk(id, { include: { all: true, nested: true } });
                if (obj == null) throw `Serviço com ID ${id} não encontrado!`;
                Object.assign(obj, { descricao, maoObra, categoria });
                await obj.save();
                results.push(await Servico.findByPk(obj.id, { include: { all: true, nested: true } }));
            }
            return results; // Retorna a lista de serviços atualizados
        }

        throw 'Formato inválido: envie um objeto para um serviço ou um array de serviços';
    }

    static async delete(req) {
        const { id } = req.params;
        const obj = await Servico.findByPk(id);
        if (obj == null)
            throw 'Serviço não encontrado!';
        try {
            await obj.destroy();
            return obj;
        } catch (error) {
            throw "Não é possível remover um serviço associado a outros registros!";
        }
    }
}

export { ServicoService };
