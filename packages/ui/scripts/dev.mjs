import { spawn } from 'node:child_process';

const children = [
  spawn('vite', ['build', '--watch'], { shell: process.platform === 'win32', stdio: 'inherit' }),
  spawn('tsc', ['-p', 'tsconfig.build.json', '--watch'], {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  }),
];

function onExit(code) {
  process.exit(code ?? 0);
}

for (const child of children) {
  child.on('exit', onExit);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const child of children) child.kill(signal);
  });
}
