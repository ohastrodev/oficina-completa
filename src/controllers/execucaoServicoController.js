import { ExecucaoServicoService } from "../services/execucaoServicoService.js";

class ExecucaoServicoController {
    static async findAll(req, res, next) {
        ExecucaoServicoService.findAll()
            .then(objs => res.json(objs))
            .catch(next);
    }

    static async findByPk(req, res, next) {
        ExecucaoServicoService.findByPk(req)
            .then(obj => res.json(obj))
            .catch(next);
    }

    static async create(req, res, next) {
        ExecucaoServicoService.create(req)
            .then(obj => res.json(obj))
            .catch(next);
    }

    static async update(req, res, next) {
        ExecucaoServicoService.update(req)
            .then(obj => res.json(obj))
            .catch(next);
    }

    static async delete(req, res, next) {
        ExecucaoServicoService.delete(req)
            .then(obj => res.json(obj))
            .catch(next);
    }

    static async relatorioOrdensServico(req, res, next) {
        const { dataInicio, dataFim } = req.query;
        
        if (!dataInicio || !dataFim) {
            return res.status(400).json({ 
                error: "Os parâmetros dataInicio e dataFim são obrigatórios no formato YYYY-MM-DD" 
            });
        }

        ExecucaoServicoService.relatorioOrdensServico(dataInicio, dataFim)
            .then(relatorio => res.json(relatorio))
            .catch(next);
    }

    static async relatorioDesempenhoFuncionarios(req, res, next) {
        const { dataInicio, dataFim } = req.query;
        
        if (!dataInicio || !dataFim) {
            return res.status(400).json({ 
                error: "Os parâmetros dataInicio e dataFim são obrigatórios no formato YYYY-MM-DD" 
            });
        }

        ExecucaoServicoService.relatorioDesempenhoFuncionarios(dataInicio, dataFim)
            .then(relatorio => res.json(relatorio))
            .catch(next);
    }
}

export { ExecucaoServicoController }; 