'use strict';
const program = require('commander');
const cp = require('child_process');
const fs = require('fs');

program
	.usage('[options] <file> <env_file>')
	.option('-s, --shell <value>', 'shell')
	.parse(process.argv);

if (program.args.length !== 2) {
	console.error('[options] <file> <env_file>');
	process.exit(1);
}

const file = program.args[0];
const envFile = program.args[1];

const envContent = fs.readFileSync(envFile, 'utf-8').toString();
const env = {};
for (const line of (envContent.split('\n'))) {
	const pos = line.indexOf('=');
	const key = line.substr(0, pos);
	const value = line.substr(pos + 1);
	env[key] = value;
}

for (const key in process.env) {
	env[key] = process.env[key];
}

const p = cp.exec('node ' + file, {
	cwd: process.env.PWD,
	env,
	shell: program.shell || '',
});

console.log(p.pid);

p.stdout.on('data', data => console.log(data.toString()));
p.stderr.on('data', data => console.error(data.toString()));
process.on('exit', () => {
	p.kill('SIGINT');
	process.exit();
});
process.on('SIGINT', () => {
	p.kill('SIGINT');
	process.exit();
});



