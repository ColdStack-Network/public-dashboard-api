import { checkMissedVariables } from '../../utils/checkMissedVariables';

export function redisConfigsFactory() {
  const redisPort = process.env.REDIS_PORT;
  const redisHost = process.env.REDIS_HOST;
  const redisPassword = process.env.REDIS_PASSWORD;

  const missingKey = checkMissedVariables({
    redisPort,
    redisHost,
  });

  if (missingKey) {
    throw new Error(`Config key ${missingKey} is missing.`);
  }

  return {
    port: redisPort,
    host: redisHost,
    password: redisPassword,
  };
}
