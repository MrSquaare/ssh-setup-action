import { execFileSync } from "child_process";
//#region src/cleanup.ts
try {
	console.log("Stopping SSH agent");
	execFileSync("ssh-agent", ["-k"], { stdio: "inherit" });
} catch (error) {
	if (error instanceof Error) console.warn("Error stopping the SSH agent, proceeding anyway:", error.message);
	console.warn("Error stopping the SSH agent, proceeding anyway");
}
//#endregion
export {};
