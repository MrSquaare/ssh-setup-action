import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as im from "@actions/exec/lib/interfaces";

import * as fs from "fs";
import * as path from "path";

import { nanoid } from "nanoid";
import isValidFilename from "valid-filename";

const HOME_PATH: string = process.env.HOME || "/home/runner";
const TEMP_PATH: string = process.env.RUNNER_TEMP || "/tmp";

type ExecuteResult = {
  code: number;
  stdout: string;
  stderr: string;
};

async function execute(
  command: string,
  args: string[] = [],
  options: im.ExecOptions = {}
): Promise<ExecuteResult> {
  let stdout = "";
  let stderr = "";

  const composedOptions: im.ExecOptions = {
    ignoreReturnCode: true,
    silent: true,
    ...options,
    listeners: {
      ...options.listeners,
      stdout: (data: Buffer) => {
        options.listeners?.stdout?.(data);

        stdout += data.toString();
      },
      stderr: (data: Buffer) => {
        options.listeners?.stderr?.(data);

        stderr += data.toString();
      },
    },
  };

  const code = await exec.exec(command, args, composedOptions);

  return {
    code,
    stdout,
    stderr,
  };
}

class SSHAgent {
  pid: string | null;
  socket: string | null;

  constructor(pid: string, socket: string) {
    this.pid = pid;
    this.socket = socket;
  }
}

function cleanPrivateKey(key: string): string {
  return key.trim() + "\n";
}

async function checkHost(host: string) {
  if (!host) {
    throw new Error("Host is not set");
  }
}

async function checkPrivateKey(key: string) {
  if (!key) {
    throw new Error("Private key is not set");
  }

  const tmpFileName = nanoid(21);
  const tmpFilePath = path.join(TEMP_PATH, tmpFileName);

  fs.writeFileSync(tmpFilePath, cleanPrivateKey(key), {
    mode: 0o600,
    flag: "w",
  });

  const { code, stderr } = await execute("ssh-keygen", ["-yef", tmpFilePath]);

  if (code !== 0) {
    console.error("Private key is not valid:", stderr);
    throw new Error("Private key is not valid");
  }

  fs.unlinkSync(tmpFilePath);
}

function checkPrivateKeyName(name: string) {
  if (name && !isValidFilename(name)) {
    throw new Error("Private key name is not valid");
  }
}

function initializeSSH(): string {
  const sshPath: string = path.join(HOME_PATH, ".ssh");

  if (!fs.existsSync(sshPath)) {
    fs.mkdirSync(sshPath, { mode: 0o700 });
  }

  return sshPath;
}

async function initializeSSHAgent(): Promise<SSHAgent> {
  const { code, stdout, stderr } = await execute("ssh-agent", ["-s"]);

  if (code !== 0) {
    console.error("Failed to initialize ssh agent:", stderr);
    throw new Error("Failed to initialize ssh agent");
  }

  const pidMatch: RegExpMatchArray | null = stdout.match(
    "SSH_AGENT_PID=(.*?);"
  );
  const socketMatch: RegExpMatchArray | null = stdout.match(
    "SSH_AUTH_SOCK=(.*?);"
  );

  return {
    pid: pidMatch ? pidMatch[1] : null,
    socket: socketMatch ? socketMatch[1] : null,
  };
}

async function addKnownHost(sshPath: string, host: string) {
  const knownHostsPath: string = path.join(sshPath, "known_hosts");
  const { code, stdout, stderr } = await execute("ssh-keyscan", [host]);

  if (code !== 0) {
    console.error("Failed to add host to known hosts:", stderr);
    throw new Error("Failed to add host to known hosts");
  }

  fs.writeFileSync(knownHostsPath, stdout, {
    mode: 0o644,
    flag: "a+",
  });
}

function createPrivateKey(sshPath: string, name: string, key: string) {
  const privateKeyPath: string = path.join(sshPath, name);

  fs.writeFileSync(privateKeyPath, cleanPrivateKey(key), {
    mode: 0o600,
    flag: "w",
  });
}

async function addPrivateKey(sshPath: string, name: string) {
  const privateKeyPath: string = path.join(sshPath, name);
  const { code, stderr } = await execute("ssh-add", [privateKeyPath]);

  if (code !== 0) {
    console.error("Failed to add private key to agent:", stderr);
    throw new Error("Failed to add private key to agent");
  }
}

async function run() {
  const host: string = core.getInput("host");
  const privateKey: string = core.getInput("private-key");
  const privateKeyName: string = core.getInput("private-key-name");

  checkHost(host);
  await checkPrivateKey(privateKey);
  checkPrivateKeyName(privateKeyName);

  const sshPath: string = await initializeSSH();

  core.exportVariable("SSH_PATH", sshPath);
  core.setOutput("ssh-path", sshPath);

  console.log("SSH initialized.");

  const sshAgent: SSHAgent = await initializeSSHAgent();

  core.exportVariable("SSH_AGENT_PID", sshAgent.pid);
  core.setOutput("ssh-agent-pid", sshAgent.pid);
  core.exportVariable("SSH_AUTH_SOCK", sshAgent.socket);
  core.setOutput("ssh-auth-sock", sshAgent.socket);

  console.log("SSH agent initialized.");

  await addKnownHost(sshPath, host);

  console.log("Host added to known hosts.");

  createPrivateKey(sshPath, privateKeyName, privateKey);

  console.log("Private key file created.");

  await addPrivateKey(sshPath, privateKeyName);

  console.log("Private key added to agent.");
}

run().catch((e) => core.setFailed(e.toString()));
