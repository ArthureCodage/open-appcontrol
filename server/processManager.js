import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const isWindows = process.platform === 'win32';

/**
 * Kill a process by PID
 */
export async function killProcess(pid) {
  if (!pid || isNaN(pid)) {
    throw new Error('PID invalide');
  }

  const command = isWindows
    ? `taskkill /F /PID ${pid}`
    : `kill -9 ${pid}`;

  try {
    const { stdout, stderr } = await execPromise(command);
    return { success: true, message: `Processus ${pid} arrêté avec succès`, stdout };
  } catch (err) {
    throw new Error(`Impossible d'arrêter le processus ${pid}: ${err.message}`);
  }
}

/**
 * Suspend/Pause a process by PID
 */
export async function suspendProcess(pid) {
  if (!pid || isNaN(pid)) {
    throw new Error('PID invalide');
  }

  // Windows PS command or SIGSTOP on Unix
  const command = isWindows
    ? `powershell -Command " (Get-Process -Id ${pid}).Suspend() "`
    : `kill -STOP ${pid}`;

  try {
    await execPromise(command);
    return { success: true, message: `Processus ${pid} suspendu` };
  } catch (err) {
    throw new Error(`Impossible de suspendre le processus ${pid}: ${err.message}`);
  }
}

/**
 * Resume a suspended process by PID
 */
export async function resumeProcess(pid) {
  if (!pid || isNaN(pid)) {
    throw new Error('PID invalide');
  }

  const command = isWindows
    ? `powershell -Command " (Get-Process -Id ${pid}).Resume() "`
    : `kill -CONT ${pid}`;

  try {
    await execPromise(command);
    return { success: true, message: `Processus ${pid} repris` };
  } catch (err) {
    throw new Error(`Impossible de reprendre le processus ${pid}: ${err.message}`);
  }
}
