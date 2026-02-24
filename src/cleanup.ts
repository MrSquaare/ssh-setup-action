import * as core from "@actions/core";
import { execFileSync } from "child_process";

const startedAgent = core.getState("started-agent");

if (startedAgent === "false") {
  console.log("SSH agent was not started by this action, skipping cleanup");
} else {
  try {
    console.log("Stopping SSH agent");
    execFileSync("ssh-agent", ["-k"], { stdio: "inherit" });
  } catch (error) {
    if (error instanceof Error) {
      console.warn(
        "Error stopping the SSH agent, proceeding anyway:",
        error.message,
      );
    }
    console.warn("Error stopping the SSH agent, proceeding anyway");
  }
}
