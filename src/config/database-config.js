
// Configuração do banco de dados no ambiente de teste
/*export const databaseConfig = {
  dialect: 'sqlite',
  storage: 'database.sqlite',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};
*/
/*
// Configuração do banco de dados no ambiente de desenvolvimento
export const databaseConfig = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'postgres',
  database: 'scv-backend-node-sequelize',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  }
};
*/


// Configuração do banco de dados no ambiente de produção
export const databaseConfig = {
  dialect: 'postgres',
  host: 'dpg-d1e8fiuuk2gs73aefe3g-a.oregon-postgres.render.com',
  username: 'oficina_completa_backend_sequelize_user',
  password: 'u5cNKKxoNn5psKEHEWBXLqRd6tjLD8DM',
  database: 'oficina_completa_backend_sequelize',
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true
  },
  dialectOptions: {
    ssl: true
  }
};