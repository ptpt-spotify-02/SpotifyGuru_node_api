import dotenv from 'dotenv';

import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';

// init the models
// eslint-disable-next-line no-unused-vars
import * as models from './models';

import * as routes from './routes';

dotenv.config();

(async function () {
  const MONGO_HOST = process.env.MONGODB_HOST;
  const MONGO_PORT = process.env.MONGODB_PORT;
  const MONGO_DB = process.env.MONGODB_DB;
  const MONGO_CONFIG = {
    useNewUrlParser   : true,
    useUnifiedTopology: true
  };
  try {
    mongoose.set('useCreateIndex', true);
    await mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`, MONGO_CONFIG);
    console.log(`Connected to MongoDB at ${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`);
  } catch (error) {
    console.error('Error while connecting to MongoDB!');
    console.error(error);
    process.exit(1);
  }

  const PORT = process.env.PORT || 5000;

  const app = new Koa();
  app.use(BodyParser());

  for (const router of Object.values(routes))
    app.use(router.routes()).use(router.allowedMethods());

  const options = {
    port: PORT,
    host: '0.0.0.0'
  };

  const callback = () => {
    console.log(`Listening on port ${PORT}.`);
    console.log(`Visit http://localhost:${PORT}/`);
  };

  app.listen(options, callback);
})();
