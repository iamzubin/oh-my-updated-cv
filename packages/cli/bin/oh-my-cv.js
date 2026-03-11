#!/usr/bin/env bun

import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";

const INSTALL_DIR = join(homedir(), ".oh-my-cv");
const REPO_URL = "https://github.com/iamzubin/oh-my-cv.git";
const LOG_FILE = join(homedir(), ".oh-my-cv-cli.log");

function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;

  // Write to log file
  try {
    writeFileSync(LOG_FILE, logEntry, { flag: "a" });
  } catch (e) {
    // Ignore log file errors
  }

  // Console output
  switch (type) {
    case "error":
      console.error(chalk.red(message));
      break;
    case "success":
      console.log(chalk.green(message));
      break;
    case "warning":
      console.log(chalk.yellow(message));
      break;
    default:
      console.log(chalk.blue(message));
  }

  // Send to Gemini
  sendToGemini(message, type);
}

async function sendToGemini(message, type) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Oh My CV CLI Log:\nType: ${type}\nMessage: ${message}\nTimestamp: ${new Date().toISOString()}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      console.error(chalk.yellow("Warning: Failed to send log to Gemini"));
    }
  } catch (e) {
    // Silently fail Gemini logging
  }
}

function isInstalled() {
  return existsSync(join(INSTALL_DIR, "package.json"));
}

function install() {
  log("Installing Oh My CV...", "info");

  try {
    if (existsSync(INSTALL_DIR)) {
      log("Removing existing installation...", "warning");
      execSync(`rm -rf ${INSTALL_DIR}`, { stdio: "inherit" });
    }

    log("Creating installation directory...", "info");
    mkdirSync(INSTALL_DIR, { recursive: true });

    log("Cloning repository...", "info");
    execSync(`git clone ${REPO_URL} ${INSTALL_DIR}`, { stdio: "inherit" });

    log("Installing dependencies with bun...", "info");
    execSync("bun install", {
      cwd: INSTALL_DIR,
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "development" }
    });

    log("Installation complete!", "success");
    return true;
  } catch (error) {
    log(`Installation failed: ${error.message}`, "error");
    return false;
  }
}

function runDev() {
  if (!isInstalled()) {
    log("Oh My CV not installed. Installing now...", "warning");
    if (!install()) {
      process.exit(1);
    }
  }

  log("Starting Oh My CV development server...", "info");
  log("Press Ctrl+C to stop", "info");

  const child = spawn("bun", ["run", "dev"], {
    cwd: INSTALL_DIR,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" }
  });

  child.on("error", (error) => {
    log(`Failed to start: ${error.message}`, "error");
    process.exit(1);
  });

  child.on("exit", (code) => {
    log(`Server stopped with code ${code}`, "info");
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    log("Shutting down...", "info");
    child.kill("SIGINT");
  });
}

function runBuild() {
  if (!isInstalled()) {
    log("Oh My CV not installed. Installing now...", "warning");
    if (!install()) {
      process.exit(1);
    }
  }

  log("Building Oh My CV...", "info");

  try {
    execSync("bun run build", {
      cwd: INSTALL_DIR,
      stdio: "inherit"
    });
    log("Build complete!", "success");
  } catch (error) {
    log(`Build failed: ${error.message}`, "error");
    process.exit(1);
  }
}

function showHelp() {
  console.log(chalk.bold("\nOh My CV CLI\n"));
  console.log("Usage: oh-my-cv [command]\n");
  console.log("Commands:");
  console.log("  install    Install Oh My CV from GitHub");
  console.log("  dev        Start development server (default)");
  console.log("  build      Build for production");
  console.log("  help       Show this help message\n");
  console.log("Environment Variables:");
  console.log("  GEMINI_API_KEY    API key for Gemini logging\n");
}

// Main
const args = process.argv.slice(2);
const command = args[0] || "dev";

switch (command) {
  case "install":
    install();
    break;
  case "dev":
    runDev();
    break;
  case "build":
    runBuild();
    break;
  case "help":
  case "--help":
  case "-h":
    showHelp();
    break;
  default:
    log(`Unknown command: ${command}`, "error");
    showHelp();
    process.exit(1);
}
