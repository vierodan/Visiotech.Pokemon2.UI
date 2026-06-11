import { execFileSync, spawn } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const DEV_PORT = 5091;
const repoRoot = process.cwd();
const viteBin = resolve(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vite.cmd' : 'vite',
);

function listListeningPids(port) {
  try {
    const output = execFileSync(
      'lsof',
      ['-nP', `-tiTCP:${port}`, '-sTCP:LISTEN'],
      { encoding: 'utf8' },
    ).trim();

    return output ? output.split(/\s+/) : [];
  } catch (error) {
    if (error.status === 1) {
      return [];
    }

    throw error;
  }
}

function readCommand(pid) {
  try {
    return execFileSync('ps', ['-p', pid, '-o', 'command='], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

function isRepoViteProcess(command) {
  return (
    command.includes(`${repoRoot}/node_modules/.bin/vite`) ||
    command.includes(`${repoRoot}/node_modules/vite/bin/vite.js`)
  );
}

async function releasePortIfNeeded(port) {
  const pids = listListeningPids(port);

  for (const pid of pids) {
    const command = readCommand(pid);

    if (!isRepoViteProcess(command)) {
      console.error(
        `Port ${port} is already in use by another process${command ? `: ${command}` : '.'}`,
      );
      process.exit(1);
    }

    process.kill(Number(pid), 'SIGTERM');
  }

  if (pids.length === 0) {
    return;
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (listListeningPids(port).length === 0) {
      return;
    }

    await delay(150);
  }

  console.error(`Port ${port} is still busy after stopping the previous Vite process.`);
  process.exit(1);
}

await releasePortIfNeeded(DEV_PORT);

const child = spawn(viteBin, {
  cwd: repoRoot,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
