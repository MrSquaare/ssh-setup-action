import { execFileSync } from "child_process";

try {
  // Kill the started SSH agent
  console.log("Stopping SSH agent");
  execFileSync("ssh-agent", ["-k"], { stdio: "inherit" });
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  }
  console.log("Error stopping the SSH agent, proceeding anyway");
}
