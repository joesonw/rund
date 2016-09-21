#!/usr/bin/env node
'use strict';
const program = require('commander');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

program
	.usage('[options] <file> <env_file>')
	.parse(process.argv);

if (program.args.length !== 2) {
	console.error('[options] <file> <env_file>');
	process.exit(1);
}

const file = path.resolve(process.env.PWD, program.args[0]);
const envFile = path.resolve(process.env.PWD, program.args[1]);

const envContent = fs.readFileSync(envFile, 'utf-8').toString();
const env = {};
for (const line of (envContent.split('\n'))) {
	const pos = line.indexOf('=');
	const key = line.substr(0, pos);
	const value = line.substr(pos + 1);
	if (!key) continue;
	env[key] = value;
}
console.log('File:', file);
console.log('Env:');
console.log(JSON.stringify(env, 0, 2));


for (const key in process.env) {
	env[key] = process.env[key];
}

const p = cp.exec('node ' + file, {
	cwd: process.env.PWD,
	env,
});


console.log('PID:', p.pid);
console.log();

p.on('error', e => {
	console.log(e);
	process.exit(1);
});
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



