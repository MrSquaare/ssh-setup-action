"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const homeDirectory = String(process.env.HOME || "");
            const sshDirectory = path.join(homeDirectory, ".ssh");
            if (!fs.existsSync(sshDirectory)) {
                fs.mkdirSync(sshDirectory, {
                    mode: 0o700,
                });
            }
            console.log("SSH directory created.");
            const host = core.getInput("host");
            let knownHosts = String();
            const knownHostsName = "known_hosts";
            const knownHostsFile = path.join(sshDirectory, knownHostsName);
            const sshKeyScanOptions = {
                silent: true,
                listeners: {
                    stdout: (data) => {
                        knownHosts = data.toString();
                    }
                }
            };
            yield exec.exec("ssh-keyscan", [host], sshKeyScanOptions);
            console.log("ssh-keyscan executed.");
            fs.writeFileSync(knownHostsFile, knownHosts, {
                mode: 0o644,
                flag: "a+",
            });
            console.log("Known hosts file appended / created.");
            const privateKey = core.getInput("private-key") + "\n";
            const privateKeyName = core.getInput("private-key-name");
            const privateKeyFile = path.join(sshDirectory, privateKeyName);
            fs.writeFileSync(privateKeyFile, privateKey, {
                mode: 0o600,
                flag: "w",
            });
            console.log("Private key file created.");
            let sshAgentOutput = String();
            const sshAgentOptions = {
                silent: true,
                listeners: {
                    stdout: (data) => {
                        sshAgentOutput = data.toString();
                    }
                }
            };
            yield exec.exec("ssh-agent -s", [], sshAgentOptions);
            console.log("ssh-agent executed.");
            const sshAuthSockMatch = sshAgentOutput.match("SSH_AUTH_SOCK=(.*?);");
            const sshAuthSock = (sshAuthSockMatch === null || sshAuthSockMatch === void 0 ? void 0 : sshAuthSockMatch.length) ? sshAuthSockMatch[1] : "";
            const sshAgentPIDMatch = sshAgentOutput.match("SSH_AGENT_PID=(.*?);");
            const sshAgentPID = (sshAgentPIDMatch === null || sshAgentPIDMatch === void 0 ? void 0 : sshAgentPIDMatch.length) ? sshAgentPIDMatch[1] : "";
            core.exportVariable("SSH_AUTH_SOCK", sshAuthSock);
            core.exportVariable("SSH_AGENT_PID", sshAgentPID);
            const sshAddOptions = {
                silent: true
            };
            yield exec.exec("ssh-add", [privateKeyFile], sshAddOptions);
            console.log("ssh-add executed.");
        }
        catch (e) {
            core.setFailed(e.toString());
        }
    });
}
run().then();
