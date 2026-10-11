import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Starting DailyFlow Fullstack Workspace (Backend & Frontend)...');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('backend'),
  stdio: 'inherit',
  shell: isWin,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve('frontend'),
  stdio: 'inherit',
  shell: isWin,
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
