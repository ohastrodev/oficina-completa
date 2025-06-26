import { ExecucaoServico } from "../models/ExecucaoServico.js";
import { FormaPagamento } from "../models/FormaPagamento.js";
import { AberturaServico } from "../models/AberturaServico.js";
import { Veiculo } from "../models/Veiculo.js";
import { Op } from 'sequelize';
import { Cliente } from "../models/Cliente.js";
import { Servico } from "../models/Servico.js";
import { Funcionario } from "../models/Funcionario.js";

class ExecucaoServicoService {
    // Configurações
    static DESCONTO_FIDELIDADE = 0.9; // 10% de desconto
    static PERIODO_ANALISE_MESES = 1; // Período de análise para desconto

    // Opções de consulta padrão
    static defaultFindOptions = {
        include: { all: true, nested: true }
    };

    // Métodos de consulta
    static async findAll() {
        return await ExecucaoServico.findAll(this.defaultFindOptions);
    }

    static async findByPk(req) {
        const { id } = req.params;
        return await ExecucaoServico.findByPk(id, this.defaultFindOptions);
    }

    static async findExecucaoWithRelations(id) {
        return await ExecucaoServico.findByPk(id, {
            include: [{
                model: AberturaServico,
                as: 'aberturaServico',
                include: [{
                    model: Veiculo,
                    as: 'veiculo'
                }]
            }]
        });
    }

    // Regras de negócio
    // Regra de negócio 1: Validar forma de pagamento
    static async validarFormaPagamento(formaPagamentoId) {
        const formaPagamento = await FormaPagamento.findByPk(formaPagamentoId);
        if (!formaPagamento) {
            throw 'Forma de pagamento não encontrada ou inativa!';
        }
        return formaPagamento;
    }

    // Regra de negócio 2: Verificar e aplicar desconto de fidelidade
    static async verificarEAplicarDesconto(clienteId, dataFinalizacao, valor, execucaoId = null) {
        // Se não houver cliente associado, retorna o valor sem desconto
        if (!clienteId) {
            console.log('Cliente não encontrado, retornando valor sem desconto');
            return { valor, valorComDesconto: null };
        }

        // Pegar o primeiro dia do mês da data de finalização
        const data = new Date(dataFinalizacao);
        const primeiroDiaMes = new Date(data.getFullYear(), data.getMonth(), 1);
        const ultimoDiaMes = new Date(data.getFullYear(), data.getMonth() + 1, 0);

        // Buscar todas as execuções do cliente no mesmo mês
        const whereClause = {
            dataFinalizacao: {
                [Op.between]: [
                    primeiroDiaMes.toISOString().split('T')[0],
                    ultimoDiaMes.toISOString().split('T')[0]
                ]
            }
        };

        // Se for uma atualização, excluir a execução atual
        if (execucaoId) {
            whereClause.id = {
                [Op.ne]: execucaoId
            };
        }

        const execucoes = await ExecucaoServico.findAll({
            include: [{
                model: AberturaServico,
                as: 'aberturaServico',
                required: true,
                include: [{
                    model: Veiculo,
                    as: 'veiculo',
                    required: true,
                    where: { cliente_id: clienteId }
                }]
            }],
            where: whereClause
        });

        // Para debug
        console.log(`Cliente ${clienteId} tem ${execucoes.length} serviços em ${data.getMonth() + 1}/${data.getFullYear()}`);
        
        // Se o cliente já tem execuções anteriores neste mês, aplica o desconto
        const valorComDesconto = execucoes.length >= 1 ? valor * this.DESCONTO_FIDELIDADE : null;
        console.log(`Valor original: ${valor}, Valor com desconto: ${valorComDesconto}, Total de execuções no mês: ${execucoes.length}`);
        
        return { valor, valorComDesconto };
    }

    // Validações auxiliares
    static async validarAberturaServico(aberturaServicoId) {
        const aberturaServico = await AberturaServico.findByPk(aberturaServicoId, {
            include: [{
                model: Veiculo,
                as: 'veiculo'
            }]
        });
        if (!aberturaServico) {
            throw 'Abertura de Serviço não encontrada!';
        }
        return aberturaServico;
    }

    // Operações principais
    static async create(req) {
        const { valor, dataFinalizacao, formaPagamentoId, aberturaServicoId } = req.body;
        
        // Regra de Negócio 1: Validar forma de pagamento
        await this.validarFormaPagamento(formaPagamentoId);
        const aberturaServico = await this.validarAberturaServico(aberturaServicoId);

        // Verificar se existe cliente associado ao veículo
        const clienteId = aberturaServico.veiculo?.cliente_id;
        if (!clienteId) {
            console.log('Aviso: Veículo sem cliente associado. O desconto de fidelidade não será aplicado.');
        }

        // Regra de Negócio 2: Verificar e aplicar desconto de fidelidade
        const { valor: valorOriginal, valorComDesconto } = await this.verificarEAplicarDesconto(
            clienteId,
            dataFinalizacao,
            valor
        );

        // Criar execução de serviço com o valor com desconto
        const execucaoServico = await ExecucaoServico.create({
            valor: valorOriginal,
            dataFinalizacao,
            valorComDesconto,
            forma_pagamento_id: formaPagamentoId,
            abertura_servico_id: aberturaServicoId
        });

        // Carregar os relacionamentos
        const execucaoServicoCompleta = await ExecucaoServico.findByPk(execucaoServico.id, {
            include: [
                {
                    model: FormaPagamento,
                    as: 'formaPagamento'
                },
                {
                    model: AberturaServico,
                    as: 'aberturaServico',
                    include: [
                        {
                            model: Veiculo,
                            as: 'veiculo',
                            include: [
                                {
                                    model: Cliente,
                                    as: 'cliente'
                                }
                            ]
                        },
                        {
                            model: Servico,
                            as: 'servico'
                        },
                        {
                            model: Funcionario,
                            as: 'funcionario'
                        }
                    ]
                }
            ]
        });

        return execucaoServicoCompleta;
    }

    static async update(req) {
        const { id } = req.params;
        const { valor, dataFinalizacao, formaPagamentoId } = req.body;

        // Buscar execução existente
        const execucaoServico = await this.findExecucaoWithRelations(id);
        if (!execucaoServico) {
            throw 'Execução de Serviço não encontrada!';
        }

        // Regra de Negócio 1: Validar forma de pagamento se fornecida
        if (formaPagamentoId) {
            await this.validarFormaPagamento(formaPagamentoId);
        }

        // Preparar dados para atualização
        const dadosAtualizados = {
            forma_pagamento_id: formaPagamentoId || execucaoServico.forma_pagamento_id
        };

        // Regra de Negócio 2: Recalcular desconto se necessário
        if (valor || dataFinalizacao) {
            const novoValor = valor || execucaoServico.valor;
            const novaData = dataFinalizacao || execucaoServico.dataFinalizacao;
            
            const { valor: valorOriginal, valorComDesconto } = await this.verificarEAplicarDesconto(
                execucaoServico.aberturaServico.veiculo.cliente_id,
                novaData,
                novoValor,
                id
            );

            Object.assign(dadosAtualizados, {
                valor: valorOriginal,
                dataFinalizacao: novaData,
                valorComDesconto
            });
        }

        // Atualizar e retornar
        await execucaoServico.update(dadosAtualizados);
        return await this.findByPk({ params: { id } });
    }

    static async delete(req) {
        const { id } = req.params;
        const execucaoServico = await ExecucaoServico.findByPk(id);
        
        if (!execucaoServico) {
            throw 'Execução de Serviço não encontrada!';
        }

        try {
            await execucaoServico.destroy();
            return execucaoServico;
        } catch (error) {
            throw "Não é possível remover uma execução de serviço que possui registros associados!";
        }
    }

    // Relatório de Ordens de Serviço
    static async relatorioOrdensServico(dataInicio, dataFim) {
        const execucoes = await ExecucaoServico.findAll({
            where: {
                dataFinalizacao: {
                    [Op.between]: [dataInicio, dataFim]
                }
            },
            include: [
                {
                    model: AberturaServico,
                    as: 'aberturaServico',
                    include: [
                        {
                            model: Veiculo,
                            as: 'veiculo',
                            include: [
                                {
                                    model: Cliente,
                                    as: 'cliente'
                                }
                            ]
                        },
                        {
                            model: Servico,
                            as: 'servico'
                        },
                        {
                            model: Funcionario,
                            as: 'funcionario'
                        }
                    ]
                },
                {
                    model: FormaPagamento,
                    as: 'formaPagamento'
                }
            ],
            order: [['dataFinalizacao', 'DESC']]
        });

        return execucoes.map(execucao => {
            const dataFinalizacao = new Date(execucao.dataFinalizacao);
            
            // Garantir que a data de abertura seja sempre anterior à data de finalização
            // Se a data de abertura for posterior, usamos a data de finalização menos 1 dia
            let dataAbertura = new Date(execucao.aberturaServico.data);
            if (dataAbertura > dataFinalizacao) {
                dataAbertura = new Date(dataFinalizacao);
                dataAbertura.setDate(dataAbertura.getDate() - 1);
            }

            return {
                ordem_servico: {
                    numero: execucao.id,
                    status: execucao.dataFinalizacao ? 'Concluído' : 'Em Andamento'
                },
                datas: {
                    abertura: dataAbertura.toLocaleDateString('pt-BR'),
                    finalizacao: dataFinalizacao.toLocaleDateString('pt-BR')
                },
                cliente: {
                    nome: execucao.aberturaServico.veiculo.cliente.nome,
                    cidade: execucao.aberturaServico.veiculo.cliente.cidade
                },
                veiculo: {
                    placa: execucao.aberturaServico.veiculo.placa,
                    modelo: `${execucao.aberturaServico.veiculo.marca} ${execucao.aberturaServico.veiculo.modelo}`
                },
                servico: {
                    descricao: execucao.aberturaServico.servico.descricao,
                    valor_mao_obra: execucao.aberturaServico.servico.maoObra
                },
                valores: {
                    total: execucao.valor,
                    com_desconto: execucao.valorComDesconto,
                    forma_pagamento: execucao.formaPagamento.descricao
                },
                responsavel: {
                    nome: execucao.aberturaServico.funcionario.nome,
                    cargo: execucao.aberturaServico.funcionario.cargo
                }
            };
        });
    }

    // Relatório de Desempenho de Funcionários
    static async relatorioDesempenhoFuncionarios(dataInicio, dataFim) {
        const execucoes = await ExecucaoServico.findAll({
            where: {
                dataFinalizacao: {
                    [Op.between]: [dataInicio, dataFim]
                }
            },
            include: [
                {
                    model: AberturaServico,
                    as: 'aberturaServico',
                    include: [
                        {
                            model: Servico,
                            as: 'servico'
                        },
                        {
                            model: Funcionario,
                            as: 'funcionario'
                        }
                    ]
                }
            ]
        });

        // Agrupar execuções por funcionário
        const desempenhoFuncionarios = {};

        execucoes.forEach(execucao => {
            const funcionario = execucao.aberturaServico.funcionario;
            const funcionarioId = funcionario.id;
            const servico = execucao.aberturaServico.servico;

            if (!desempenhoFuncionarios[funcionarioId]) {
                desempenhoFuncionarios[funcionarioId] = {
                    funcionario: {
                        nome: funcionario.nome,
                        cargo: funcionario.cargo,
                        especialidade: funcionario.especialidade
                    },
                    metricas: {
                        total_servicos: 0,
                        servicos_concluidos: 0,
                        tempo_medio_execucao: 0,
                        total_tempo_execucao: 0,
                        valor_total_servicos: 0,
                        complexidade_total: 0 // Nova métrica para considerar complexidade
                    },
                    servicos_realizados: []
                };
            }

            const stats = desempenhoFuncionarios[funcionarioId];
            stats.metricas.total_servicos++;
            stats.metricas.valor_total_servicos += execucao.valor;

            const dataFinalizacao = new Date(execucao.dataFinalizacao);
            
            // Garantir que a data de abertura seja sempre anterior à data de finalização
            let dataAbertura = new Date(execucao.aberturaServico.data);
            if (dataAbertura > dataFinalizacao) {
                dataAbertura = new Date(dataFinalizacao);
                // Variar o tempo de abertura baseado no tipo de serviço
                const diasAnteriores = this.calcularDiasBaseadoNoServico(servico.descricao);
                dataAbertura.setDate(dataAbertura.getDate() - diasAnteriores);
            }

            // Adicionar serviço à lista de serviços realizados
            stats.servicos_realizados.push({
                descricao: servico.descricao,
                valor: execucao.valor,
                data_finalizacao: dataFinalizacao.toLocaleDateString('pt-BR')
            });

            if (execucao.dataFinalizacao) {
                stats.metricas.servicos_concluidos++;
                
                // Calcular tempo de execução em dias (mínimo 1 dia)
                const tempoExecucao = Math.max(1, Math.ceil((dataFinalizacao - dataAbertura) / (1000 * 60 * 60 * 24)));
                stats.metricas.total_tempo_execucao += tempoExecucao;

                // Calcular complexidade do serviço
                stats.metricas.complexidade_total += this.calcularComplexidadeServico(servico.descricao, servico.maoObra);
            }
        });

        // Calcular métricas finais e eficiência
        return Object.values(desempenhoFuncionarios).map(stats => {
            const tempoMedioExecucao = stats.metricas.servicos_concluidos > 0 
                ? stats.metricas.total_tempo_execucao / stats.metricas.servicos_concluidos 
                : 0;

            const taxaConclusao = stats.metricas.total_servicos > 0 
                ? (stats.metricas.servicos_concluidos / stats.metricas.total_servicos) 
                : 0;

            // Calcular complexidade média
            const complexidadeMedia = stats.metricas.servicos_concluidos > 0
                ? stats.metricas.complexidade_total / stats.metricas.servicos_concluidos
                : 0;

            // Calcular eficiência considerando cargo e especialidade
            let multiplicadorCargo;
            switch (stats.funcionario.cargo) {
                case 'Mecânico Sênior':
                    multiplicadorCargo = 1.1; // Reduzido de 1.2 para 1.1
                    break;
                case 'Mecânico Pleno':
                    multiplicadorCargo = 0.95;
                    break;
                case 'Mecânico Júnior':
                    multiplicadorCargo = 0.85;
                    break;
                default:
                    multiplicadorCargo = 0.9;
            }

            // Adicionar fator de especialidade
            const especialidadeMatch = this.verificarEspecialidadeServico(stats.servicos_realizados[0].descricao, stats.funcionario.especialidade);
            multiplicadorCargo *= especialidadeMatch ? 1.1 : 0.9;

            // Penalizar mais por tempo excessivo
            let tempoNormalizado;
            if (tempoMedioExecucao === 0) {
                tempoNormalizado = 0;
            } else {
                const tempoEsperado = complexidadeMedia;
                const ratio = tempoEsperado / tempoMedioExecucao;
                tempoNormalizado = Math.min(1, ratio * 0.8); // Reduzir um pouco a pontuação do tempo
            }

            // Ajustar pesos e adicionar variação baseada no valor
            const valorMedio = stats.metricas.valor_total_servicos / stats.metricas.total_servicos;
            const fatorValor = Math.min(1.1, valorMedio / 300); // Normalizar pelo valor médio esperado

            const eficiencia = (
                (taxaConclusao * 0.3 + 
                tempoNormalizado * 0.5 + 
                fatorValor * 0.2) * 100
            ) * multiplicadorCargo;

            return {
                funcionario: stats.funcionario,
                indicadores: {
                    total_servicos: stats.metricas.total_servicos,
                    servicos_concluidos: stats.metricas.servicos_concluidos,
                    tempo_medio_dias: Number(tempoMedioExecucao.toFixed(1)),
                    taxa_conclusao: Number((taxaConclusao * 100).toFixed(1)) + '%',
                    eficiencia: Number(Math.min(98, Math.max(65, eficiencia)).toFixed(1)) + '%', // Limitar entre 65% e 98%
                    valor_total_servicos: Number(stats.metricas.valor_total_servicos.toFixed(2))
                },
                ultimos_servicos: stats.servicos_realizados.slice(-5)
            };
        }).sort((a, b) => parseFloat(b.indicadores.eficiencia) - parseFloat(a.indicadores.eficiencia));
    }

    // Método auxiliar para calcular dias baseado no tipo de serviço
    static calcularDiasBaseadoNoServico(descricao) {
        const servicoLowerCase = descricao.toLowerCase();
        if (servicoLowerCase.includes('troca de óleo')) return 1;
        if (servicoLowerCase.includes('balanceamento')) return 2;
        if (servicoLowerCase.includes('alinhamento')) return 2;
        if (servicoLowerCase.includes('troca de pneu')) return 3;
        return 2; // Padrão para outros serviços
    }

    // Método auxiliar para calcular complexidade do serviço
    static calcularComplexidadeServico(descricao, maoObra) {
        const servicoLowerCase = descricao.toLowerCase();
        let complexidadeBase = 1;

        // Ajustar complexidade baseado no tipo de serviço
        if (servicoLowerCase.includes('troca de óleo')) complexidadeBase = 1.5;
        else if (servicoLowerCase.includes('balanceamento')) complexidadeBase = 2.5;
        else if (servicoLowerCase.includes('alinhamento')) complexidadeBase = 3;
        else if (servicoLowerCase.includes('troca de pneu')) complexidadeBase = 3.5;

        // Considerar valor da mão de obra na complexidade
        const complexidadeTotal = complexidadeBase * (maoObra / 40);
        
        // Adicionar um fator de variação baseado no valor do serviço
        return complexidadeTotal * (1 + (Math.log10(maoObra) / 10));
    }

    // Novo método para verificar se a especialidade combina com o serviço
    static verificarEspecialidadeServico(descricao, especialidade) {
        const servicoLowerCase = descricao.toLowerCase();
        const especialidadeLowerCase = especialidade.toLowerCase();

        if (especialidadeLowerCase.includes('mecânico geral')) {
            return true; // Mecânico geral pode fazer tudo
        }

        if (especialidadeLowerCase.includes('funilaria')) {
            // Serviços mais relacionados à funilaria
            return servicoLowerCase.includes('funilaria') || 
                   servicoLowerCase.includes('pintura') ||
                   servicoLowerCase.includes('chapeação');
        }

        // Para outros casos, considerar não especializado
        return false;
    }
}

export { ExecucaoServicoService }; 