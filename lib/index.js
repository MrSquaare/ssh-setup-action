"use strict";
/* eslint-disable no-console */
/* eslint-disable security/detect-non-literal-fs-filename */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");
const path = require("path");
const defaultHomePath = "/home/runner";
class SSHAgent {
    constructor(pid, socket) {
        this.pid = pid;
        this.socket = socket;
    }
}
function initializeSSH() {
    const homePath = process.env.HOME || defaultHomePath;
    const sshPath = path.join(homePath, ".ssh");
    if (!fs.existsSync(sshPath)) {
        fs.mkdirSync(sshPath, { mode: 0o700 });
    }
    return sshPath;
}
function initializeSSHAgent() {
    return __awaiter(this, void 0, void 0, function* () {
        let sshAgentOutput = String();
        const sshAgentOptions = {
            silent: true,
            listeners: {
                stdout: (data) => {
                    sshAgentOutput = data.toString();
                },
            },
        };
        yield exec.exec("ssh-agent", ["-s"], sshAgentOptions);
        const pidMatch = sshAgentOutput.match("SSH_AGENT_PID=(.*?);");
        const socketMatch = sshAgentOutput.match("SSH_AUTH_SOCK=(.*?);");
        return {
            pid: pidMatch ? pidMatch[1] : null,
            socket: socketMatch ? socketMatch[1] : null,
        };
    });
}
function addKnownHost(sshPath, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const knownHostsPath = path.join(sshPath, "known_hosts");
        let sshKeyScanOutput = String();
        const sshKeyScanOptions = {
            silent: true,
            listeners: {
                stdout: (data) => {
                    sshKeyScanOutput = data.toString();
                },
            },
        };
        yield exec.exec("ssh-keyscan", [host], sshKeyScanOptions);
        fs.writeFileSync(knownHostsPath, sshKeyScanOutput, {
            mode: 0o644,
            flag: "a+",
        });
    });
}
function createPrivateKey(sshPath, name, key) {
    const privateKeyPath = path.join(sshPath, name);
    fs.writeFileSync(privateKeyPath, key, {
        mode: 0o600,
        flag: "w",
    });
}
function addPrivateKey(sshPath, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const privateKeyPath = path.join(sshPath, name);
        const sshAddOptions = {
            silent: true,
        };
        yield exec.exec("ssh-add", [privateKeyPath], sshAddOptions);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const sshPath = yield initializeSSH();
        core.exportVariable("SSH_PATH", sshPath);
        console.log("SSH initialized.");
        const sshAgent = yield initializeSSHAgent();
        core.exportVariable("SSH_AGENT_PID", sshAgent.pid);
        core.exportVariable("SSH_AUTH_SOCK", sshAgent.socket);
        console.log("SSH agent initialized.");
        const host = core.getInput("host");
        yield addKnownHost(sshPath, host);
        console.log("Host added to known hosts.");
        const privateKey = core.getInput("private-key") + "\n";
        const privateKeyName = core.getInput("private-key-name");
        yield createPrivateKey(sshPath, privateKeyName, privateKey);
        console.log("Private key file created.");
        yield addPrivateKey(sshPath, privateKeyName);
        console.log("Private key added to agent.");
    });
}
run().catch((e) => core.setFailed(e.toString()));
