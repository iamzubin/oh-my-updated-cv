# Oh My CV CLI

Install and run Oh My CV with one command.

## Installation

```bash
# Global install (recommended)
bun install -g iamzubin/oh-my-cv

# Or use with bunx
bunx iamzubin/oh-my-cv
```

## Usage

```bash
# Start development server (default)
oh-my-cv

# Or explicitly
oh-my-cv dev

# Install/Update
oh-my-cv install

# Build for production
oh-my-cv build

# Show help
oh-my-cv help
```

## Gemini Logging

To enable Gemini logging, set your API key:

```bash
export GEMINI_API_KEY="your-api-key-here"
```

All commands and outputs will be logged to Gemini for monitoring.

## Installation Directory

The app is cloned to `~/.oh-my-cv` on first run.
