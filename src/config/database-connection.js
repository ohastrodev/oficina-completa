import Sequelize from 'sequelize';
import { databaseConfig } from "./database-config.js";

import { Cliente } from '../models/Cliente.js';
import { FormaPagamento } from '../models/FormaPagamento.js';
import { Funcionario } from '../models/Funcionario.js';
import { Veiculo } from '../models/Veiculo.js';
import { ExecucaoServico } from '../models/ExecucaoServico.js';
import { AberturaServico } from '../models/AberturaServico.js';
import { Servico } from '../models/Servico.js';
import { Peca } from '../models/Peca.js';
import { ReservaPeca } from '../models/ReservaPeca.js';

const sequelize = new Sequelize(databaseConfig);

Cliente.init(sequelize);
Veiculo.init(sequelize);
FormaPagamento.init(sequelize);
Funcionario.init(sequelize);
ExecucaoServico.init(sequelize);
AberturaServico.init(sequelize);
Servico.init(sequelize);
Peca.init(sequelize);
ReservaPeca.init(sequelize);

Cliente.associate(sequelize.models);
Veiculo.associate(sequelize.models);
FormaPagamento.associate(sequelize.models);
Funcionario.associate(sequelize.models);
ExecucaoServico.associate(sequelize.models);
AberturaServico.associate(sequelize.models);
Servico.associate(sequelize.models);
Peca.associate(sequelize.models);
ReservaPeca.associate(sequelize.models);

databaseInserts(); 

async function databaseInserts() {
    await sequelize.sync();

    /*await Cliente.bulkCreate([
        { nome: "Cliente João", cpf: "111.111.111-11", nascimento: "1981-01-01", cidade: "Cachoeiro" },
        { nome: "Cliente José", cpf: "222.222.222-22", nascimento: "1995-02-25", cidade: "Cachoeiro" },
        { nome: "Cliente Arrascaeta", cpf: "333.333.333-33", nascimento: "1974-02-01", cidade: "Mimoso" },
        { nome: "Cliente Rossi", cpf: "444.444.444-44", nascimento: "2002-02-04", cidade: "Muqui" }
    ]);

    const formasPagamento = await FormaPagamento.bulkCreate([
        { descricao: "Dinheiro", dataCadastro: "2025-04-04", taxa: "1.0", desconto: "1.0" },
        { descricao: "Pix", dataCadastro: "2025-04-04", taxa: "1.0", desconto: "1.0" },
        { descricao: "Cartão de crédito", dataCadastro: "2025-04-04", taxa: "1.0", desconto: "1.0" },
        { descricao: "Cartão de débito", dataCadastro: "2025-04-04", taxa: "1.0", desconto: "1.0" }
    ]);

    const funcionarios = await Funcionario.bulkCreate([
        { nome: "Hugo", cargo: "Mecânico Júnior", cpf: "111.111.111-01", telefone: "(28) 99988-7777", dataDeAdmissao: "2025-03-28", especialidade: "Funilaria", salario: "3000.00" },
        { nome: "José", cargo: "Mecânico Sênior", cpf: "111.111.111-02", telefone: "(28) 99988-7778", dataDeAdmissao: "2025-03-27", especialidade: "Mecânico Geral", salario: "5000.00" },
        { nome: "Matheus", cargo: "Mecânico Pleno", cpf: "111.111.111-03", telefone: "(28) 99988-7779", dataDeAdmissao: "2025-03-26", especialidade: "Funilaria", salario: "3500.00" },
        { nome: "Diego", cargo: "Mecânico Sênior", cpf: "111.111.111-04", telefone: "(28) 99988-7780", dataDeAdmissao: "2025-03-25", especialidade: "Mecânico Geral", salario: "5200.00" },
        { nome: "Lucas", cargo: "Pintor", cpf: "111.111.111-05", telefone: "(28) 99988-7781", dataDeAdmissao: "2025-03-24", especialidade: "Pintura", salario: "3000.00" },
        { nome: "Bruno", cargo: "Funileiro", cpf: "111.111.111-06", telefone: "(28) 99988-7782", dataDeAdmissao: "2025-03-23", especialidade: "Funilaria", salario: "3100.00" },
        { nome: "Felipe", cargo: "Mecânico", cpf: "111.111.111-07", telefone: "(28) 99988-7783", dataDeAdmissao: "2025-03-22", especialidade: "Geral", salario: "4000.00" },
        { nome: "Ana", cargo: "Supervisora", cpf: "111.111.111-08", telefone: "(28) 99988-7784", dataDeAdmissao: "2025-03-21", especialidade: "Gestão", salario: "5500.00" },
        { nome: "Paula", cargo: "Administrativa", cpf: "111.111.111-09", telefone: "(28) 99988-7785", dataDeAdmissao: "2025-03-20", especialidade: "Administração", salario: "3200.00" },
        { nome: "Carlos", cargo: "Estagiário", cpf: "111.111.111-10", telefone: "(28) 99988-7786", dataDeAdmissao: "2025-03-19", especialidade: "Auxílio", salario: "1500.00" }
    ]);

    const veiculos = await Veiculo.bulkCreate([
        { cliente_id: 1, marca: "Ford", modelo: "Ka", ano: "2015", numeroChassi: "9BWZZZ377VT013021", tipoCombustivel: "Gasolina", placa: "ABC1D23" },
        { cliente_id: 1, marca: "Chevrolet", modelo: "Vectra", ano: "2010", numeroChassi: "1C4RJFAG1LC345872", tipoCombustivel: "Gás", placa: "DEF2G34" },
        { cliente_id: 2, marca: "Fiat", modelo: "Palio", ano: "2012", numeroChassi: "9BWZZZ377VT013022", tipoCombustivel: "Gasolina", placa: "GHI3J45" },
        { cliente_id: 2, marca: "Hyundai", modelo: "HB20", ano: "2018", numeroChassi: "1C4RJFAG1LC345873", tipoCombustivel: "Flex", placa: "JKL4M56" },
        { cliente_id: 3, marca: "Volkswagen", modelo: "Gol", ano: "2016", numeroChassi: "9BWZZZ377VT013023", tipoCombustivel: "Álcool", placa: "MNO5N67" },
        { cliente_id: 3, marca: "Renault", modelo: "Sandero", ano: "2019", numeroChassi: "1C4RJFAG1LC345874", tipoCombustivel: "Flex", placa: "PQR6P78" },
        { cliente_id: 3, marca: "Toyota", modelo: "Corolla", ano: "2020", numeroChassi: "9BWZZZ377VT013024", tipoCombustivel: "Gasolina", placa: "STU7Q89" },
        { cliente_id: 4, marca: "Honda", modelo: "Civic", ano: "2021", numeroChassi: "1C4RJFAG1LC345875", tipoCombustivel: "Flex", placa: "VWX8R90" },
        { cliente_id: 4, marca: "Jeep", modelo: "Renegade", ano: "2022", numeroChassi: "9BWZZZ377VT013025", tipoCombustivel: "Diesel", placa: "YZA9S01" },
        { cliente_id: 4, marca: "Peugeot", modelo: "208", ano: "2023", numeroChassi: "1C4RJFAG1LC345876", tipoCombustivel: "Flex", placa: "BCD0T12" }
    ]);

    const servicos = await Servico.bulkCreate([
        { descricao: "Troca de óleo", maoObra: "80.00", categoria: "M" },
        { descricao: "Troca de pneu", maoObra: "100.00", categoria: "M" },
        { descricao: "Balanceamento", maoObra: "60.00", categoria: "M" },
        { descricao: "Alinhamento", maoObra: "70.00", categoria: "M" },
        { descricao: "Revisão geral", maoObra: "250.00", categoria: "M" },
        { descricao: "Limpeza de bico", maoObra: "90.00", categoria: "M" },
        { descricao: "Troca de pastilha", maoObra: "150.00", categoria: "M" },
        { descricao: "Troca de correia dentada", maoObra: "300.00", categoria: "M" },
        { descricao: "Troca de bateria", maoObra: "120.00", categoria: "M" },
        { descricao: "Check-up elétrico", maoObra: "130.00", categoria: "M" }
    ]);

    const aberturas = await Promise.all(
        funcionarios.map((funcionario, index) =>
            AberturaServico.create({
                funcionario_id: funcionario.id,
                servico_id: servicos[index].id,
                veiculo_id: veiculos[index].id
            })
        )
    );
    
    await ExecucaoServico.bulkCreate([
        { valor: "200.00", dataFinalizacao: "2025-04-01", forma_pagamento_id: formasPagamento[0].id, abertura_servico_id: aberturas[0].id },
        { valor: "300.00", dataFinalizacao: "2025-04-02", forma_pagamento_id: formasPagamento[1].id, abertura_servico_id: aberturas[1].id },
        { valor: "150.00", dataFinalizacao: "2025-04-03", forma_pagamento_id: formasPagamento[2].id, abertura_servico_id: aberturas[2].id },
        { valor: "400.00", dataFinalizacao: "2025-04-04", forma_pagamento_id: formasPagamento[3].id, abertura_servico_id: aberturas[3].id }
    ]);*/
}

export default sequelize;
