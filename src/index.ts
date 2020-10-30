/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as im from "@actions/exec/lib/interfaces";

import * as fs from "fs";
import * as path from "path";

const defaultHomePath = "/home/runner";

class SSHAgent {
    pid: string | null;
    socket: string | null;

    constructor(pid: string, socket: string) {
        this.pid = pid;
        this.socket = socket;
    }
}

function initializeSSH(): string {
    const homePath: string = process.env.HOME || defaultHomePath;
    const sshPath: string = path.join(homePath, ".ssh");

    if (!fs.existsSync(sshPath)) {
        fs.mkdirSync(sshPath, { mode: 0o700 });
    }

    return sshPath;
}

async function initializeSSHAgent(): Promise<SSHAgent> {
    let sshAgentOutput = String();
    const sshAgentOptions: im.ExecOptions = {
        silent: true,
        listeners: {
            stdout: (data: Buffer) => {
                sshAgentOutput = data.toString();
            },
        },
    };

    await exec.exec("ssh-agent", ["-s"], sshAgentOptions);

    const pidMatch: RegExpMatchArray | null = sshAgentOutput.match(
        "SSH_AGENT_PID=(.*?);"
    );
    const socketMatch: RegExpMatchArray | null = sshAgentOutput.match(
        "SSH_AUTH_SOCK=(.*?);"
    );

    return {
        pid: pidMatch ? pidMatch[1] : null,
        socket: socketMatch ? socketMatch[1] : null,
    };
}

async function addKnownHost(sshPath: string, host: string) {
    const knownHostsPath: string = path.join(sshPath, "known_hosts");

    let sshKeyScanOutput = String();
    const sshKeyScanOptions: im.ExecOptions = {
        silent: true,
        listeners: {
            stdout: (data: Buffer) => {
                sshKeyScanOutput = data.toString();
            },
        },
    };

    await exec.exec("ssh-keyscan", [host], sshKeyScanOptions);

    fs.writeFileSync(knownHostsPath, sshKeyScanOutput, {
        mode: 0o644,
        flag: "a+",
    });
}

function createPrivateKey(sshPath: string, name: string, key: string) {
    const privateKeyPath: string = path.join(sshPath, name);

    fs.writeFileSync(privateKeyPath, key, {
        mode: 0o600,
        flag: "w",
    });
}

async function addPrivateKey(sshPath: string, name: string) {
    const privateKeyPath: string = path.join(sshPath, name);

    const sshAddOptions: im.ExecOptions = {
        silent: true,
    };

    await exec.exec("ssh-add", [privateKeyPath], sshAddOptions);
}

async function run() {
    const sshPath: string = await initializeSSH();

    core.exportVariable("SSH_PATH", sshPath);

    console.log("SSH initialized.");

    const sshAgent: SSHAgent = await initializeSSHAgent();

    core.exportVariable("SSH_AGENT_PID", sshAgent.pid);
    core.exportVariable("SSH_AUTH_SOCK", sshAgent.socket);

    console.log("SSH agent initialized.");

    const host: string = core.getInput("host");

    await addKnownHost(sshPath, host);

    console.log("Host added to known hosts.");

    const privateKey: string = core.getInput("private-key") + "\n";
    const privateKeyName: string = core.getInput("private-key-name");

    createPrivateKey(sshPath, privateKeyName, privateKey);

    console.log("Private key file created.");

    await addPrivateKey(sshPath, privateKeyName);

    console.log("Private key added to agent.");
}

run().catch((e) => core.setFailed(e.toString()));
