import { configDotenv } from 'dotenv';
configDotenv();

import { createDirectExchange } from './CH-01/create-direct-exchnage.js';
import { createFanoutExchange } from './CH-01/create-fanout-exchnage.js';
import { createTopicExchnage } from './CH-01/create-topic-exchnage.js';
import { createHeadersExchnage } from './CH-01/create-headers-exchnage.js';
import { createDelayedExchange } from './CH-01/create-delayed-exchnage.js';
import { createAlternateExchange } from './CH-01/create-alternate-exchnage.js';
import { deleteExchnage } from './CH-01/delete-exchnage.js';

import { createQueue } from './CH-02/create-q.js';
import { createQueueWithDeadLetterConfig } from './CH-02/create-q-with-dead-letter-config.js';
import { deleteQueue } from './CH-02/delete-q.js';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});


async function bootstrap() {
  try {
    await deleteQueue();
  } catch (error){
    console.error(error);
  }
}

bootstrap();
