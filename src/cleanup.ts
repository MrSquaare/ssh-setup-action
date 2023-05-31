const core = require('@actions/core');
const { execFileSync } = require('child_process');

try {
    // Kill the started SSH agent
    console.log('Stopping SSH agent');
    execFileSync("ssh-agent", ['-k'], { stdio: 'inherit' });
} catch (error: any) {
    console.log(error.message);
    console.log('Error stopping the SSH agent, proceeding anyway');
}