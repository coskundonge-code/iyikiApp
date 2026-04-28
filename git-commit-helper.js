const { execSync } = require('child_process');
const path = require('path');

const worktree = path.join(__dirname, '.claude', 'worktrees', 'brave-wilbur');

function run(cmd) {
  try {
    const out = execSync(cmd, { cwd: worktree, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    console.log(`OK: ${cmd}\n${out}`);
    return out;
  } catch (e) {
    console.error(`ERR: ${cmd}\n${e.stderr || e.message}`);
    return null;
  }
}

console.log('=== git-push-helper start ===');
run('git pull --rebase origin coskun');
run('git push origin coskun');
console.log('=== done ===');

setTimeout(() => process.exit(0), 3000);
