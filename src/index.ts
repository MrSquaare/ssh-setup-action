import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as im from "@actions/exec/lib/interfaces";

import * as fs from "fs";
import * as path from "path";

async function run() {
    try {
        const homeDirectory: string = String(process.env.HOME || "");
        const sshDirectory: string = path.join(homeDirectory, ".ssh");

        if (!fs.existsSync(sshDirectory)) {
            fs.mkdirSync(sshDirectory, {
                mode: 0o700,
            });
        }

        console.log("SSH directory created.");

        const host: string = core.getInput("host");
        let knownHosts: string = String();
        const knownHostsName: string = "known_hosts";
        const knownHostsFile: string = path.join(sshDirectory, knownHostsName);

        const sshKeyScanOptions: im.ExecOptions = {
            silent: true,
            listeners: {
                stdout: (data: Buffer) => {
                    knownHosts = data.toString();
                }
            }
        };

        await exec.exec("ssh-keyscan", [host], sshKeyScanOptions);

        console.log("ssh-keyscan executed.");

        fs.writeFileSync(knownHostsFile, knownHosts, {
            mode: 0o644,
            flag: "a+",
        });

        console.log("Known hosts file appended / created.");

        const privateKey: string = core.getInput("private-key") + "\n";
        const privateKeyName: string = core.getInput("private-key-name");
        const privateKeyFile: string = path.join(sshDirectory, privateKeyName);

        fs.writeFileSync(privateKeyFile, privateKey, {
            mode: 0o600,
            flag: "w",
        });

        console.log("Private key file created.");

        let sshAgentOutput = String();
        const sshAgentOptions: im.ExecOptions = {
            silent: true,
            listeners: {
                stdout: (data: Buffer) => {
                    sshAgentOutput = data.toString();
                }
            }
        };

        await exec.exec("ssh-agent -s", [], sshAgentOptions);

        console.log("ssh-agent executed.");

        const sshAuthSockMatch: RegExpMatchArray | null = sshAgentOutput.match("SSH_AUTH_SOCK=(.*?);");
        const sshAuthSock: string = sshAuthSockMatch?.length ? sshAuthSockMatch[1] : "";
        const sshAgentPIDMatch: RegExpMatchArray | null = sshAgentOutput.match("SSH_AGENT_PID=(.*?);");
        const sshAgentPID: string = sshAgentPIDMatch?.length ? sshAgentPIDMatch[1] : "";

        core.exportVariable("SSH_AUTH_SOCK", sshAuthSock);
        core.exportVariable("SSH_AGENT_PID", sshAgentPID);

        const sshAddOptions: im.ExecOptions = {
            silent: true
        };

        await exec.exec("ssh-add", [privateKeyFile], sshAddOptions);

        console.log("ssh-add executed.");
    } catch (e) {
        core.setFailed(e.toString());
    }
}

run().then();