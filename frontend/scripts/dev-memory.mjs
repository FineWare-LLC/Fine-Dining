import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri();
console.log('Started in-memory MongoDB at', process.env.MONGODB_URI);

const dev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, MONGODB_URI: process.env.MONGODB_URI }
});

dev.on('exit', async (code) => {
  await mongod.stop();
  process.exit(code);
});
