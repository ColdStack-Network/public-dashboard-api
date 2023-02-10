/* eslint-disable @typescript-eslint/no-var-requires */
import vault from '../vault';

async function main() {
  await vault();

  require('./bootstrap');
}

main();
