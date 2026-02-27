# Vanilla JavaScript App

[Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/overview) allows you to easily build JavaScript apps in minutes. Use this repo with the [quickstart](https://docs.microsoft.com/azure/static-web-apps/getting-started?tabs=vanilla-javascript) to build and customize a new static site.

This repository hosts a multiple‑choice quiz application for the LSP exam. It consists of a single HTML page (`src/index.html`), a style sheet (`src/styles.css`), and a JavaScript file (`src/script.js`) that manages a bank of questions (currently 38 items). The quiz supports shuffling, grading, timer, and exporting results as JSON. The questions are also exported as SQL in `src/bank.sql`.

This repo has a dev container. This means if you open it inside a [GitHub Codespace](https://github.com/features/codespaces), or using [VS Code with the remote containers extension](https://code.visualstudio.com/docs/remote/containers), it will be opened inside a container with all the dependencies already installed.