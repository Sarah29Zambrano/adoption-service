const readline = require('readline');
const childProcess = require('child_process');

const db = {
  adoptions: [{ id: 1, petId: 123, userId: 456, status: 'adopted' }],
  nextId: 2,
};

function validateUser(userId) {
  if (process.env.SKIP_USER_VALIDATION === 'true') return true;
  const result = childProcess.spawnSync(process.execPath, [
    '-e',
    `const id=parseInt(process.argv[1]);process.stdout.write(id>0?'valid':'invalid');`,
    String(userId),
  ]);
  return result.stdout.toString() === 'valid';
}

function handleCommand(cmd) {
  const { method, endpoint, body } = cmd;

  if (method === 'GET' && endpoint === '/adoptions') {
    return db.adoptions;
  }

  if (method === 'POST' && endpoint === '/adoptions') {
    const { petId, userId } = body || {};
    if (!petId || !userId) return { error: 'petId and userId are required', status: 400 };
    if (!validateUser(userId)) return { error: 'Invalid user', status: 400 };
    const adoption = { id: db.nextId++, petId, userId, status: 'pending' };
    db.adoptions.push(adoption);
    return adoption;
  }

  const matchId = endpoint.match(/^\/adoptions\/(\d+)$/);
  if (method === 'GET' && matchId) {
    const adoption = db.adoptions.find(a => a.id === parseInt(matchId[1], 10));
    return adoption || { error: 'Not found', status: 404 };
  }

  return { error: 'Not found', status: 404 };
}

// ── stdin loop (punto de entrada CLI) ────────────────────────────────────────
const rl = readline.createInterface({ input: process.stdin, terminal: false });
let numberOfCommands = 0;
const inputLines = [];

rl.on('line', (line) => {
  if (numberOfCommands === 0) {
    numberOfCommands = parseInt(line, 10);
  } else {
    inputLines.push(line);
    if (inputLines.length === numberOfCommands) {
      inputLines.forEach(cmdLine => {
        console.log(JSON.stringify(handleCommand(JSON.parse(cmdLine))));
      });
      rl.close();
    }
  }
});

module.exports = { handleCommand, validateUser };