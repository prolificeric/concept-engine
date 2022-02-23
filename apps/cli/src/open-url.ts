import { exec } from 'child_process';

const cmd =
  process.platform == 'darwin'
    ? 'open'
    : process.platform == 'win32'
    ? 'start'
    : 'xdg-open';

export default function openUrl(url: string) {
  exec(`${cmd} "${url}"`);
}
