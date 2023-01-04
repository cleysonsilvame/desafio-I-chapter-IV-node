import { Connection, createConnection as createTypeOrmConnnection, getConnectionOptions } from 'typeorm';

const createConnection = async (host = "database"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return await createTypeOrmConnnection(
    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database:
        process.env.NODE_ENV === "test"
          ? "finapi_test"
          : defaultOptions.database,
    })
  );
};

export default createConnection 
