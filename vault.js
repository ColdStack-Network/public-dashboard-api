// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

dotenv.config();

async function vault() {
  if (
    process.env['SKIP_VAULT'] ||
    !(process.env.VAULT_ADDR && process.env.VAULT_TOKEN)
  ) {
    console.log('Skipping Vault...');
    return;
  }

  const url = process.env.VAULT_ADDR;
  const headers = {
    'X-API-VERSION': 1,
    'X-Vault-Token': process.env.VAULT_TOKEN,
  };

  const {
    data: {
      data: { data: envs },
    },
  } = await axios.get(`${url}/env`, { headers });

  const {
    data: {
      data: { data: secrets },
    },
  } = await axios.get(`${url}/secret`, { headers });

  // Replace \\n with \n to support multiline strings in AWS
  for (const envName of Object.keys(process.env)) {
    process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
  }

  process.env = { ...envs, ...secrets, ...process.env };
}

module.exports = vault;
