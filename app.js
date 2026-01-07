const STORAGE_KEY = "jobseeker.artifact.v1";
const API_KEY_STORAGE = "jobseeker.geminiKey.v1";
const THEME_KEY = "jobseeker.theme.v1";
const GEMINI_MODEL = "gemini-1.5-flash";
const SYSTEM_PROMPT =
  "You are a concise job-search copilot. Use the artifact context to respond with clear, practical guidance. Ask at most one follow-up question when needed.";

function nowIso() {
  return new Date().toISOString();
}

const sampleState = {
  files: [
    {
      path: "profile/summary.md",
      content:
        "# Profile Summary\n\nAvery Chen is a data-informed strategist who blends customer insight with rigorous analysis.\n\n- 6 years in SaaS research and business ops\n- Known for translating ambiguity into clear narratives\n- Interested in product analytics or growth strategy roles\n",
    },
    {
      path: "profile/skills.md",
      content:
        "# Core Skills\n\n- Market research, cohort analysis, funnel diagnostics\n- SQL, Looker, Amplitude, Airtable automation\n- Stakeholder interviews + storytelling\n- Workshop facilitation and executive briefings\n",
    },
    {
      path: "profile/links.md",
      content:
        "# Key Links\n\n- Resume: \n- LinkedIn: \n- Portfolio: \n",
    },
    {
      path: "jobs/target-roles.md",
      content:
        "# Target Roles\n\n1. Product Analyst (B2B SaaS)\n2. Growth Strategy Lead\n3. Customer Insights Manager\n\n## Target Themes\n- Data + narrative\n- Ambiguous problems\n- Cross-functional collaboration\n",
    },
    {
      path: "jobs/companies.md",
      content:
        "# Target Companies\n\n- \n\n## Notes\n- \n",
    },
    {
      path: "jobs/role-fit.md",
      content:
        "# Role Fit Notes\n\n## Strengths\n- Turns raw data into executive-ready decisions\n- Calm under ambiguity\n- Comfortable with product + marketing peers\n\n## Gaps To Address\n- Deeper experimentation design\n- Stronger metrics instrumentation exposure\n",
    },
    {
      path: "prep/interview-questions.md",
      content:
        "# Interview Questions\n\n- Tell me about a time you changed a product decision\n- How do you define success for a new feature?\n- Walk us through a messy dataset you cleaned\n",
    },
    {
      path: "prep/star-stories.md",
      content:
        "# STAR Stories\n\n## Marketplace churn\nSituation: 18% month-2 churn in mid-market accounts\nTask: Identify churn drivers, propose retention motion\nAction: Cohort analysis + 12 interviews + win-back playbook\nResult: -6.2% churn, +$1.4M annualized revenue\n",
    },
    {
      path: "prep/impact.md",
      content:
        "# Impact Highlights\n\n- Reduced churn by 6.2% by launching a win-back playbook\n- Automated reporting to save 6+ hours per week\n- Presented quarterly insights that reshaped roadmap priorities\n",
    },
    {
      path: "notes/intake.md",
      content:
        "# Intake Notes\n\n- Wants interview prep for senior product analytics roles\n- Prefers collaborative teams, hybrid schedule\n- Values mentorship and fast iteration cycles\n",
    },
  ],
  messages: [
    {
      role: "assistant",
      timestamp: nowIso(),
      content:
        "Welcome back, Avery. Ready to tune this artifact for your next role?",
    },
    {
      role: "user",
      timestamp: nowIso(),
      content:
        "Yes — I want prep for a Product Analyst interview next week.",
    },
    {
      role: "assistant",
      timestamp: nowIso(),
      content:
        "Great. I will add that to intake notes. Start by sharing a recent project you led.",
    },
  ],
  meta: {
    onboardingDismissed: false,
    activePath: "notes/intake.md",
  },
};

const blankState = {
  files: [
    {
      path: "profile/summary.md",
      content:
        "# Profile Summary\n\nWrite a 4-6 sentence summary of your background and current focus.\n",
    },
    {
      path: "profile/skills.md",
      content: "# Core Skills\n\n- \n- \n- \n",
    },
    {
      path: "profile/links.md",
      content:
        "# Key Links\n\n- Resume: \n- LinkedIn: \n- Portfolio: \n",
    },
    {
      path: "jobs/target-roles.md",
      content:
        "# Target Roles\n\n1. \n2. \n3. \n\n## Target Themes\n- \n- \n",
    },
    {
      path: "jobs/companies.md",
      content:
        "# Target Companies\n\n- \n\n## Notes\n- \n",
    },
    {
      path: "jobs/role-fit.md",
      content:
        "# Role Fit Notes\n\n## Strengths\n- \n\n## Gaps To Address\n- \n",
    },
    {
      path: "prep/interview-questions.md",
      content:
        "# Interview Questions\n\n- \n- \n- \n",
    },
    {
      path: "prep/star-stories.md",
      content:
        "# STAR Stories\n\n## Story 1\nSituation: \nTask: \nAction: \nResult: \n",
    },
    {
      path: "prep/impact.md",
      content:
        "# Impact Highlights\n\n- \n- \n- \n",
    },
    {
      path: "notes/intake.md",
      content: "# Intake Notes\n\n- \n",
    },
  ],
  messages: [
    {
      role: "assistant",
      timestamp: nowIso(),
      content:
        "Welcome. I will guide you through an interview-style intake. Tell me about your current role.",
    },
  ],
  meta: {
    onboardingDismissed: false,
    activePath: "notes/intake.md",
  },
};

const dom = {
  tree: document.querySelector('[data-role="file-tree"]'),
  editor: document.querySelector('[data-role="file-editor"]'),
  activePath: document.querySelector('[data-role="active-path"]'),
  messages: document.querySelector('[data-role="message-list"]'),
  input: document.querySelector('[data-role="message-input"]'),
  onboarding: document.querySelector('[data-role="onboarding"]'),
  apiKey: document.querySelector('[data-role="api-key"]'),
  apiKeyInput: document.querySelector('[data-role="api-key-input"]'),
  apiKeyStatus: document.querySelector('[data-role="api-key-status"]'),
  mentionList: document.querySelector('[data-role="mention-list"]'),
  commandList: document.querySelector('[data-role="command-list"]'),
  searchInput: document.querySelector('[data-role="search-input"]'),
  searchList: document.querySelector('[data-role="search-list"]'),
};

const actions = {
  send: document.querySelector('[data-action="send"]'),
  exportJson: document.querySelector('[data-action="export-json"]'),
  exportZip: document.querySelector('[data-action="export-zip"]'),
  exportMarkdown: document.querySelector('[data-action="export-markdown"]'),
  startFresh: document.querySelector('[data-action="start-fresh"]'),
  restoreSample: document.querySelector('[data-action="restore-sample"]'),
  dismissOnboarding: document.querySelector('[data-action="dismiss-onboarding"]'),
  setApiKey: document.querySelector('[data-action="set-api-key"]'),
  saveApiKey: document.querySelector('[data-action="save-api-key"]'),
  clearApiKey: document.querySelector('[data-action="clear-api-key"]'),
  toggleTheme: document.querySelector('[data-action="toggle-theme"]'),
  summarizeNote: document.querySelector('[data-action="summarize-note"]'),
  copyTranscript: document.querySelector('[data-action="copy-transcript"]'),
};

const mentionState = {
  active: false,
  start: 0,
  query: "",
  matches: [],
  selectedIndex: 0,
};

const commandState = {
  active: false,
  start: 0,
  query: "",
  matches: [],
  selectedIndex: 0,
};

const searchState = {
  active: false,
  query: "",
  results: [],
  selectedIndex: 0,
};

const storedState = loadState();
let state = storedState ?? clone(sampleState);
if (!storedState) {
  saveState();
}

render();

const commandCatalog = [
  {
    name: "open",
    description: "Open a file in the editor.",
    usage: "/open <path>",
  },
  {
    name: "new",
    description: "Create a new file with a starter template.",
    usage: "/new <path>",
  },
  {
    name: "rename",
    description: "Rename a file path.",
    usage: "/rename <old> <new>",
  },
  {
    name: "delete",
    description: "Delete a file from the tree.",
    usage: "/delete <path>",
  },
  {
    name: "list",
    description: "List files (optionally in a folder).",
    usage: "/list [folder]",
  },
  {
    name: "export",
    description: "Download JSON, Markdown, or ZIP.",
    usage: "/export [json|md|zip]",
  },
  {
    name: "theme",
    description: "Switch between light and dark.",
    usage: "/theme [dark|light]",
  },
  {
    name: "snippet",
    description: "Paste the first lines of a file.",
    usage: "/snippet <path> [lines]",
  },
  {
    name: "append",
    description: "Append text to a file.",
    usage: "/append <path> <text>",
  },
  {
    name: "search",
    description: "Open search with a query.",
    usage: "/search <term>",
  },
  {
    name: "help",
    description: "Show available commands.",
    usage: "/help",
  },
  {
    name: "summarize",
    description: "Summarize a file (Gemini).",
    usage: "/summarize <path>",
    ai: true,
  },
  {
    name: "extract-skills",
    description: "Extract skills from a file (Gemini).",
    usage: "/extract-skills <path>",
    ai: true,
  },
  {
    name: "rewrite",
    description: "Rewrite content with a tone (Gemini).",
    usage: "/rewrite <path> [tone]",
    ai: true,
  },
  {
    name: "gap-analysis",
    description: "Compare role fit vs target role (Gemini).",
    usage: "/gap-analysis",
    ai: true,
  },
  {
    name: "prep-questions",
    description: "Generate interview questions (Gemini).",
    usage: "/prep-questions",
    ai: true,
  },
  {
    name: "starify",
    description: "Convert notes into STAR format (Gemini).",
    usage: "/starify <path>",
    ai: true,
  },
  {
    name: "tailor",
    description: "Map a job description into files (Gemini).",
    usage: "/tailor <job description>",
    ai: true,
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Could not load state", error);
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save state", error);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function render() {
  renderTree();
  renderMessages();
  renderEditor();
  renderOnboarding();
  applyTheme(loadTheme() || "dark");
  updateZipAvailability();
  hideMentionList();
  hideCommandList();
  hideSearchList();
}

function renderTree() {
  dom.tree.innerHTML = "";
  const groups = groupByTopFolder(state.files);

  Object.keys(groups).forEach((folder) => {
    const label = document.createElement("div");
    label.className = "tree__folder";
    label.textContent = folder;
    dom.tree.appendChild(label);

    groups[folder].forEach((file) => {
      const item = document.createElement("div");
      item.className = "tree__item";
      if (file.path === state.meta.activePath) {
        item.classList.add("active");
      }
      const label = document.createElement("span");
      label.textContent = file.path;
      item.appendChild(label);
      item.addEventListener("click", () => {
        state.meta.activePath = file.path;
        saveState();
        render();
      });
      dom.tree.appendChild(item);
    });
  });
}

function groupByTopFolder(files) {
  const groups = {};
  files
    .slice()
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach((file) => {
      const top = file.path.split("/")[0];
      if (!groups[top]) {
        groups[top] = [];
      }
      groups[top].push(file);
    });
  return groups;
}

function renderMessages() {
  dom.messages.innerHTML = "";
  state.messages.forEach((message) => {
    const wrapper = document.createElement("div");
    wrapper.className = "message";
    if (message.role === "user") {
      wrapper.classList.add("message--user");
    }
    const meta = document.createElement("div");
    meta.className = "message__meta";
    const role = document.createElement("div");
    role.className = "message__role";
    role.textContent = message.role;
    meta.appendChild(role);
    if (message.timestamp) {
      const time = document.createElement("div");
      time.className = "message__time";
      time.textContent = formatTimestamp(message.timestamp);
      meta.appendChild(time);
    }
    const body = document.createElement("div");
    body.textContent = message.content;
    wrapper.append(meta, body);
    dom.messages.appendChild(wrapper);
  });
  dom.messages.scrollTop = dom.messages.scrollHeight;
}

function renderEditor() {
  const active = state.files.find((file) => file.path === state.meta.activePath);
  if (!active) {
    dom.activePath.textContent = "Select a file to view or edit";
    dom.editor.value = "";
    dom.editor.disabled = true;
    return;
  }
  dom.activePath.textContent = active.path;
  dom.editor.disabled = false;
  dom.editor.value = active.content;
}

function renderOnboarding() {
  if (state.meta.onboardingDismissed) {
    dom.onboarding.classList.remove("is-visible");
  } else {
    dom.onboarding.classList.add("is-visible");
  }
}

function updateZipAvailability() {
  const available = Boolean(window.JSZip);
  actions.exportZip.disabled = !available;
  actions.exportZip.title = available
    ? ""
    : "Zip export requires JSZip. Check your network connection.";
}

function renderApiKeyOverlay(show) {
  if (show) {
    const storedKey = loadApiKey();
    dom.apiKeyInput.value = storedKey ? maskKey(storedKey) : "";
    dom.apiKeyInput.dataset.raw = storedKey || "";
    dom.apiKeyStatus.textContent = storedKey
      ? "Key saved locally. Paste to replace it."
      : "No key saved yet.";
    dom.apiKey.classList.add("is-visible");
  } else {
    dom.apiKey.classList.remove("is-visible");
  }
}

let editTimer;

if (dom.editor) {
  dom.editor.addEventListener("input", (event) => {
    const target = event.target;
    clearTimeout(editTimer);
    editTimer = setTimeout(() => {
      updateActiveFile(target.value);
    }, 200);
  });
}

actions.send.addEventListener("click", sendMessage);
actions.summarizeNote.addEventListener("click", summarizeActiveNote);

dom.input.addEventListener("keydown", (event) => {
  if (commandState.active) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      stepCommand(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepCommand(-1);
      return;
    }
    if (
      (event.key === "Enter" || event.key === "Tab") &&
      !(event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      applyCommandSelection();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideCommandList();
      return;
    }
  }
  if (mentionState.active) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      stepMention(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      stepMention(-1);
      return;
    }
    if (
      (event.key === "Enter" || event.key === "Tab") &&
      !(event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      applyMentionSelection();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hideMentionList();
      return;
    }
  }
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    sendMessage();
  }
});

dom.input.addEventListener("input", () => {
  updateCommandFromInput();
  updateMentionFromInput();
});

dom.input.addEventListener("blur", () => {
  hideMentionList();
  hideCommandList();
});

if (dom.searchInput) {
  dom.searchInput.addEventListener("input", () => {
    updateSearchFromInput();
  });

  dom.searchInput.addEventListener("keydown", (event) => {
    if (searchState.active) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        stepSearch(1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        stepSearch(-1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        applySearchSelection();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        hideSearchList();
        return;
      }
    }
  });

  dom.searchInput.addEventListener("blur", () => {
    hideSearchList();
  });
}

actions.exportJson.addEventListener("click", () => {
  downloadFile("jobseeker-artifact.json", JSON.stringify(state, null, 2));
});

actions.exportZip.addEventListener("click", () => {
  exportZipBundle();
});

actions.exportMarkdown.addEventListener("click", () => {
  const bundle = state.files
    .map((file) => `# ${file.path}\n\n${file.content.trim()}\n`)
    .join("\n---\n\n");
  downloadFile("jobseeker-artifact.md", bundle);
});

actions.copyTranscript.addEventListener("click", () => {
  copyTranscriptToClipboard();
});

actions.startFresh.addEventListener("click", () => {
  state = clone(blankState);
  saveState();
  render();
});

actions.restoreSample.addEventListener("click", () => {
  state = clone(sampleState);
  saveState();
  render();
});

actions.dismissOnboarding.addEventListener("click", () => {
  state.meta.onboardingDismissed = true;
  saveState();
  renderOnboarding();
});

actions.toggleTheme.addEventListener("click", () => {
  const current = loadTheme() || "dark";
  const next = current === "dark" ? "light" : "dark";
  saveTheme(next);
  applyTheme(next);
});

actions.setApiKey.addEventListener("click", () => {
  renderApiKeyOverlay(true);
});

actions.saveApiKey.addEventListener("click", () => {
  const rawValue = dom.apiKeyInput.dataset.raw || dom.apiKeyInput.value.trim();
  const value = rawValue.trim();
  if (!value) {
    dom.apiKeyStatus.textContent = "Paste a key to save it.";
    return;
  }
  localStorage.setItem(API_KEY_STORAGE, value);
  dom.apiKeyStatus.textContent = "Saved. This key stays in your browser.";
  dom.apiKeyInput.value = maskKey(value);
  dom.apiKeyInput.dataset.raw = value;
});

actions.clearApiKey.addEventListener("click", () => {
  localStorage.removeItem(API_KEY_STORAGE);
  dom.apiKeyInput.value = "";
  dom.apiKeyInput.dataset.raw = "";
  dom.apiKeyStatus.textContent = "Key cleared from this browser.";
});

dom.apiKeyInput.addEventListener("input", (event) => {
  const target = event.target;
  dom.apiKeyInput.dataset.raw = target.value;
});

dom.apiKeyInput.addEventListener("focus", () => {
  dom.apiKeyInput.value = dom.apiKeyInput.dataset.raw || "";
});

dom.apiKey.addEventListener("click", (event) => {
  if (event.target === dom.apiKey) {
    renderApiKeyOverlay(false);
  }
});

async function sendMessage() {
  const text = dom.input.value.trim();
  if (!text) {
    return;
  }
  hideMentionList();
  hideCommandList();
  hideSearchList();
  const command = parseCommand(text);
  if (command) {
    state.messages.push({ role: "user", content: text, timestamp: nowIso() });
    dom.input.value = "";
    const pending = {
      role: "assistant",
      content: `Running /${command.name}...`,
      timestamp: nowIso(),
    };
    state.messages.push(pending);
    saveState();
    renderMessages();
    renderEditor();
    setLoadingState(true);
    try {
      const result = await runCommand(command);
      pending.content = result.message;
    } catch (error) {
      pending.content = `Command failed: ${error.message || "Unable to run."}`;
    }
    saveState();
    render();
    setLoadingState(false);
    return;
  }

  state.messages.push({ role: "user", content: text, timestamp: nowIso() });
  dom.input.value = "";

  appendToFile("notes/intake.md", `- ${text}\n`);

  const pending = {
    role: "assistant",
    content: "Thinking...",
    timestamp: nowIso(),
  };
  state.messages.push(pending);
  saveState();
  renderMessages();
  renderEditor();

  setLoadingState(true);
  const apiKey = loadApiKey();
  try {
    if (apiKey) {
      const history = state.messages.slice(0, -1);
      pending.content = await generateGeminiReply(text, history);
    } else {
      pending.content = generateStubReply(text);
    }
  } catch (error) {
    pending.content = `Gemini error: ${error.message || "Unable to reach Gemini."}`;
  }
  saveState();
  renderMessages();
  renderEditor();
  setLoadingState(false);
}

async function runCommand(command) {
  const entry = commandCatalog.find((item) => item.name === command.name);
  if (!entry) {
    return {
      message: "Unknown command. Type /help to see available commands.",
    };
  }
  if (entry.ai) {
    return runAiCommand(command, entry);
  }
  return runDeterministicCommand(command);
}

function parseCommand(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }
  const body = trimmed.slice(1);
  const parts = body.split(/\s+/);
  const name = (parts.shift() || "").toLowerCase();
  return {
    name,
    args: parts,
    rawArgs: body.slice(name.length).trim(),
  };
}

function runDeterministicCommand(command) {
  switch (command.name) {
    case "open":
      return commandOpen(command.args);
    case "new":
      return commandNew(command.args);
    case "rename":
      return commandRename(command.args);
    case "delete":
      return commandDelete(command.args);
    case "list":
      return commandList(command.args);
    case "export":
      return commandExport(command.args);
    case "theme":
      return commandTheme(command.args);
    case "snippet":
      return commandSnippet(command.args);
    case "append":
      return commandAppend(command.rawArgs);
    case "search":
      return commandSearch(command.rawArgs);
    case "help":
      return commandHelp();
    default:
      return { message: "Command not implemented yet." };
  }
}

async function runAiCommand(command, entry) {
  const apiKey = loadApiKey();
  if (!apiKey) {
    renderApiKeyOverlay(true);
    return { message: "Set a Gemini API key to run this command." };
  }
  const path = command.args[0];
  if (path && !state.files.find((item) => item.path === path)) {
    return { message: `Could not find ${path}.` };
  }
  const prompt = buildAiCommandPrompt(command, entry);
  if (!prompt) {
    return { message: `Usage: ${entry.usage}` };
  }
  const contextFiles = resolveAiContextFiles(command);
  const history = state.messages.slice(0, -1);
  const response = await generateGeminiReply(prompt, history, {
    contextFiles,
  });
  const outputSpec = getAiOutputSpec(command);
  if (outputSpec) {
    const heading = outputSpec.title ? `# ${outputSpec.title}\n\n` : "";
    upsertFile(outputSpec.path, `${heading}${response}\n`);
    state.meta.activePath = outputSpec.path;
    saveState();
    return {
      message: `Saved to ${outputSpec.path}.\n\n${response}`,
    };
  }
  return { message: response };
}

function resolveAiContextFiles(command) {
  const path = command.args[0];
  if (path) {
    const file = state.files.find((item) => item.path === path);
    return file ? [file] : [];
  }
  return state.files;
}

function buildAiCommandPrompt(command, entry) {
  const args = command.args;
  const path = args[0];
  switch (command.name) {
    case "summarize":
      if (!path) {
        return null;
      }
      return `Summarize ${path} in 1 headline and up to 5 bullet points. Keep names and metrics as-is.`;
    case "extract-skills":
      if (!path) {
        return null;
      }
      return `Extract skills from ${path}. Return a concise bullet list grouped by category.`;
    case "rewrite":
      if (!path) {
        return null;
      }
      return `Rewrite ${path} for clarity. If a tone is supplied, follow it: ${args
        .slice(1)
        .join(" ") || "default professional tone"}.`;
    case "gap-analysis":
      return `Compare target roles to role fit notes. Return strengths, gaps, and 3 actions to close gaps.`;
    case "prep-questions":
      return `Generate 6 interview questions based on the artifact and intake notes.`;
    case "starify":
      if (!path) {
        return null;
      }
      return `Convert ${path} into STAR format. Return a structured template with Situation, Task, Action, Result.`;
    case "tailor":
      if (!command.rawArgs) {
        return null;
      }
      return `Given this job description, suggest updates to the artifact files. Job description:\n${command.rawArgs}`;
    default:
      return entry
        ? `${entry.description} Follow the command instructions precisely.`
        : null;
  }
}

function getAiOutputSpec(command) {
  const path = command.args[0];
  const base = path ? path.split("/").pop() || "note" : "note";
  const cleanBase = base.replace(/\.[^/.]+$/, "");
  switch (command.name) {
    case "summarize":
      return { path: "notes/summary.md", title: "Summary" };
    case "extract-skills":
      return { path: "notes/skills-extract.md", title: "Skills Extract" };
    case "rewrite":
      return {
        path: `notes/rewrite-${cleanBase}.md`,
        title: `Rewrite: ${cleanBase}`,
      };
    case "gap-analysis":
      return { path: "notes/gap-analysis.md", title: "Gap Analysis" };
    case "prep-questions":
      return { path: "prep/ai-questions.md", title: "AI Interview Questions" };
    case "starify":
      return {
        path: `prep/star-${cleanBase}.md`,
        title: `STAR: ${cleanBase}`,
      };
    case "tailor":
      return { path: "notes/tailor.md", title: "Tailored Notes" };
    default:
      return null;
  }
}

function commandOpen(args) {
  const path = args[0];
  if (!path) {
    return { message: "Usage: /open <path>" };
  }
  if (!openFileForContext(path)) {
    return { message: `Could not find ${path}.` };
  }
  return { message: `Opened ${path}.` };
}

function commandNew(args) {
  const path = args[0];
  if (!path) {
    return { message: "Usage: /new <path>" };
  }
  if (state.files.find((file) => file.path === path)) {
    return { message: `${path} already exists.` };
  }
  const content = buildFileTemplate(path);
  state.files.push({ path, content });
  state.meta.activePath = path;
  saveState();
  return { message: `Created ${path}.` };
}

function buildFileTemplate(path) {
  const fileName = path.split("/").pop() || "Notes";
  const title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
  const heading = title
    ? title.charAt(0).toUpperCase() + title.slice(1)
    : "Notes";
  return `# ${heading}\n\n`;
}

function commandRename(args) {
  const [oldPath, newPath] = args;
  if (!oldPath || !newPath) {
    return { message: "Usage: /rename <old> <new>" };
  }
  const file = state.files.find((item) => item.path === oldPath);
  if (!file) {
    return { message: `Could not find ${oldPath}.` };
  }
  if (state.files.find((item) => item.path === newPath)) {
    return { message: `${newPath} already exists.` };
  }
  file.path = newPath;
  if (state.meta.activePath === oldPath) {
    state.meta.activePath = newPath;
  }
  saveState();
  return { message: `Renamed ${oldPath} to ${newPath}.` };
}

function commandDelete(args) {
  const path = args[0];
  if (!path) {
    return { message: "Usage: /delete <path>" };
  }
  const index = state.files.findIndex((item) => item.path === path);
  if (index === -1) {
    return { message: `Could not find ${path}.` };
  }
  state.files.splice(index, 1);
  if (state.meta.activePath === path) {
    state.meta.activePath = state.files[0]?.path || "";
  }
  saveState();
  return { message: `Deleted ${path}.` };
}

function commandList(args) {
  const folder = args[0];
  const files = folder
    ? state.files.filter((item) => item.path.startsWith(`${folder}/`))
    : state.files;
  if (!files.length) {
    return { message: folder ? `No files in ${folder}.` : "No files found." };
  }
  return { message: files.map((item) => `- ${item.path}`).join("\n") };
}

function commandExport(args) {
  const type = (args[0] || "json").toLowerCase();
  if (type === "json") {
    downloadFile("jobseeker-artifact.json", JSON.stringify(state, null, 2));
    return { message: "Exported JSON." };
  }
  if (type === "md" || type === "markdown") {
    const bundle = state.files
      .map((file) => `# ${file.path}\n\n${file.content.trim()}\n`)
      .join("\n---\n\n");
    downloadFile("jobseeker-artifact.md", bundle);
    return { message: "Exported Markdown bundle." };
  }
  if (type === "zip") {
    exportZipBundle();
    return { message: "Exported ZIP bundle." };
  }
  return { message: "Usage: /export [json|md|zip]" };
}

function commandTheme(args) {
  const value = (args[0] || "").toLowerCase();
  if (value !== "dark" && value !== "light") {
    return { message: "Usage: /theme [dark|light]" };
  }
  saveTheme(value);
  applyTheme(value);
  return { message: `Switched to ${value} mode.` };
}

function commandSnippet(args) {
  const path = args[0];
  const lines = parseInt(args[1], 10) || 6;
  if (!path) {
    return { message: "Usage: /snippet <path> [lines]" };
  }
  const file = state.files.find((item) => item.path === path);
  if (!file) {
    return { message: `Could not find ${path}.` };
  }
  const snippet = file.content.split("\n").slice(0, lines).join("\n");
  return { message: snippet || "File is empty." };
}

function commandAppend(rawArgs) {
  const parts = rawArgs.split(/\s+/);
  const path = parts.shift();
  const text = rawArgs.slice(path ? path.length : 0).trim();
  if (!path || !text) {
    return { message: "Usage: /append <path> <text>" };
  }
  appendToFile(path, `${text}\n`);
  saveState();
  return { message: `Appended to ${path}.` };
}

function commandSearch(rawArgs) {
  const query = rawArgs.trim();
  if (!query) {
    return { message: "Usage: /search <term>" };
  }
  dom.searchInput.value = query;
  updateSearchFromInput();
  dom.searchInput.focus();
  return { message: `Searching for "${query}".` };
}

function commandHelp() {
  const lines = commandCatalog.map((item) => {
    const label = item.ai ? " (Gemini)" : "";
    return `- /${item.name}${label}: ${item.description}`;
  });
  return { message: lines.join("\n") };
}

function updateCommandFromInput() {
  const text = dom.input.value;
  const cursor = dom.input.selectionStart;
  if (cursor === null || cursor === undefined) {
    hideCommandList();
    return;
  }
  const context = getCommandContext(text, cursor);
  if (!context) {
    hideCommandList();
    return;
  }
  const matches = getCommandMatches(context.query);
  if (!matches.length) {
    hideCommandList();
    return;
  }
  hideMentionList();
  commandState.active = true;
  commandState.start = context.start;
  commandState.query = context.query;
  commandState.matches = matches;
  commandState.selectedIndex = Math.min(
    commandState.selectedIndex,
    matches.length - 1
  );
  renderCommandList();
}

function getCommandContext(text, cursor) {
  const uptoCursor = text.slice(0, cursor);
  const slashIndex = uptoCursor.lastIndexOf("/");
  if (slashIndex === -1) {
    return null;
  }
  const prevChar = slashIndex > 0 ? uptoCursor[slashIndex - 1] : "";
  if (prevChar && !/\s/.test(prevChar)) {
    return null;
  }
  const query = uptoCursor.slice(slashIndex + 1);
  if (/\s/.test(query)) {
    return null;
  }
  return { start: slashIndex, query };
}

function getCommandMatches(query) {
  const needle = query.toLowerCase();
  return commandCatalog.filter((command) =>
    command.name.toLowerCase().includes(needle)
  );
}

function renderCommandList() {
  dom.commandList.innerHTML = "";
  commandState.matches.forEach((command, index) => {
    const item = document.createElement("div");
    item.className = "command-item";
    if (index === commandState.selectedIndex) {
      item.classList.add("is-active");
    }
    const label = document.createElement("div");
    label.className = "command-label";
    label.textContent = `/${command.name}`;

    const preview = document.createElement("div");
    preview.className = "command-preview";
    preview.textContent = `${command.description} ${command.usage ? "• " + command.usage : ""}`;

    item.append(label, preview);
    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      commandState.selectedIndex = index;
      applyCommandSelection();
    });
    dom.commandList.appendChild(item);
  });
  dom.commandList.classList.add("is-visible");
}

function hideCommandList() {
  commandState.active = false;
  commandState.matches = [];
  commandState.selectedIndex = 0;
  dom.commandList.classList.remove("is-visible");
  dom.commandList.innerHTML = "";
}

function stepCommand(delta) {
  if (!commandState.matches.length) {
    return;
  }
  const count = commandState.matches.length;
  commandState.selectedIndex = (commandState.selectedIndex + delta + count) % count;
  renderCommandList();
}

function applyCommandSelection() {
  if (!commandState.matches.length) {
    hideCommandList();
    return;
  }
  const command = commandState.matches[commandState.selectedIndex];
  const cursor = dom.input.selectionStart;
  const text = dom.input.value;
  const before = text.slice(0, commandState.start);
  const after = text.slice(cursor);
  const insertion = `/${command.name} `;
  const nextValue = `${before}${insertion}${after}`;
  dom.input.value = nextValue;
  const nextCursor = before.length + insertion.length;
  dom.input.setSelectionRange(nextCursor, nextCursor);
  hideCommandList();
}

function updateMentionFromInput() {
  if (commandState.active) {
    hideMentionList();
    return;
  }
  const text = dom.input.value;
  const cursor = dom.input.selectionStart;
  if (cursor === null || cursor === undefined) {
    hideMentionList();
    return;
  }
  const context = getMentionContext(text, cursor);
  if (!context) {
    hideMentionList();
    return;
  }
  const matches = getMentionMatches(context.query);
  if (!matches.length) {
    hideMentionList();
    return;
  }
  mentionState.active = true;
  mentionState.start = context.start;
  mentionState.query = context.query;
  mentionState.matches = matches;
  mentionState.selectedIndex = Math.min(
    mentionState.selectedIndex,
    matches.length - 1
  );
  renderMentionList();
}

function updateSearchFromInput() {
  const query = dom.searchInput.value.trim();
  if (!query) {
    hideSearchList();
    return;
  }
  const results = getSearchResults(query);
  searchState.active = true;
  searchState.query = query;
  searchState.results = results;
  searchState.selectedIndex = results.length
    ? Math.min(searchState.selectedIndex, results.length - 1)
    : 0;
  renderSearchList();
}

function getSearchResults(query) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const results = [];
  state.files.forEach((file) => {
    const content = file.content || "";
    const haystack = `${file.path}\n${content}`.toLowerCase();
    if (!tokens.every((token) => haystack.includes(token))) {
      return;
    }
    const index = findFirstTokenIndex(content, tokens);
    results.push({
      path: file.path,
      index,
      preview: buildSearchPreview(content, index, tokens),
    });
  });
  return results.slice(0, 8);
}

function findFirstTokenIndex(content, tokens) {
  if (!tokens.length) {
    return 0;
  }
  const lower = content.toLowerCase();
  for (const token of tokens) {
    const index = lower.indexOf(token);
    if (index !== -1) {
      return index;
    }
  }
  return -1;
}

function buildSearchPreview(content, index, tokens) {
  const context = 40;
  const safeIndex = Math.max(0, index);
  const tokenLength = tokens.length ? tokens[0].length : 0;
  const start = Math.max(0, safeIndex - context);
  const end = Math.min(content.length, safeIndex + tokenLength + context);
  const raw = content.slice(start, end);
  const cleaned = raw.replace(/\s+/g, " ").trim() || "No preview available";
  const prefix = start > 0 ? "..." : "";
  const suffix = end < content.length ? "..." : "";
  return `${prefix}${cleaned}${suffix}`;
}

function renderSearchList() {
  dom.searchList.innerHTML = "";
  if (!searchState.results.length) {
    const empty = document.createElement("div");
    empty.className = "search-item";
    const label = document.createElement("div");
    label.className = "search-label";
    label.textContent = "No matches found";
    const preview = document.createElement("div");
    preview.className = "search-preview";
    preview.textContent = "Try another keyword or refine your query.";
    empty.append(label, preview);
    dom.searchList.appendChild(empty);
  } else {
    searchState.results.forEach((result, index) => {
      const item = document.createElement("div");
      item.className = "search-item";
      if (index === searchState.selectedIndex) {
        item.classList.add("is-active");
      }

      const label = document.createElement("div");
      label.className = "search-label";
      label.textContent = result.path;

      const preview = document.createElement("div");
      preview.className = "search-preview";
      preview.textContent = result.preview;

      item.append(label, preview);
      item.addEventListener("mousedown", (event) => {
        event.preventDefault();
        searchState.selectedIndex = index;
        applySearchSelection();
      });
      dom.searchList.appendChild(item);
    });
  }
  dom.searchList.classList.add("is-visible");
}

function hideSearchList() {
  searchState.active = false;
  searchState.results = [];
  searchState.selectedIndex = 0;
  dom.searchList.classList.remove("is-visible");
  dom.searchList.innerHTML = "";
}

function stepSearch(delta) {
  if (!searchState.results.length) {
    return;
  }
  const count = searchState.results.length;
  searchState.selectedIndex = (searchState.selectedIndex + delta + count) % count;
  renderSearchList();
}

function applySearchSelection() {
  if (!searchState.results.length) {
    return;
  }
  const result = searchState.results[searchState.selectedIndex];
  openFileForContext(result.path);
  if (result.index >= 0) {
    highlightEditorMatch(result.index, firstTokenLength(searchState.query));
  }
  hideSearchList();
}

function highlightEditorMatch(index, length) {
  if (!dom.editor || dom.editor.disabled) {
    return;
  }
  requestAnimationFrame(() => {
    dom.editor.focus();
    dom.editor.setSelectionRange(index, index + length);
  });
}

function firstTokenLength(query) {
  const token = query.trim().split(/\s+/)[0] || "";
  return token.length;
}

function getMentionContext(text, cursor) {
  const uptoCursor = text.slice(0, cursor);
  const atIndex = uptoCursor.lastIndexOf("@");
  if (atIndex === -1) {
    return null;
  }
  const prevChar = atIndex > 0 ? uptoCursor[atIndex - 1] : "";
  if (prevChar && !/\s/.test(prevChar)) {
    return null;
  }
  const query = uptoCursor.slice(atIndex + 1);
  if (/\s/.test(query)) {
    return null;
  }
  return { start: atIndex, query };
}

function getMentionMatches(query) {
  const needle = query.toLowerCase();
  return state.files
    .map((file) => file.path)
    .filter((path) => path.toLowerCase().includes(needle))
    .slice(0, 6);
}

function renderMentionList() {
  dom.mentionList.innerHTML = "";
  mentionState.matches.forEach((path, index) => {
    const item = document.createElement("div");
    item.className = "mention-item";
    if (index === mentionState.selectedIndex) {
      item.classList.add("is-active");
    }
    const label = document.createElement("div");
    label.className = "mention-label";
    label.textContent = path;

    const preview = document.createElement("div");
    preview.className = "mention-preview";
    preview.textContent = getFilePreview(path);

    item.append(label, preview);
    item.addEventListener("mousedown", (event) => {
      event.preventDefault();
      mentionState.selectedIndex = index;
      applyMentionSelection();
    });
    dom.mentionList.appendChild(item);
  });
  dom.mentionList.classList.add("is-visible");
}

function getFilePreview(path) {
  const file = state.files.find((item) => item.path === path);
  if (!file || !file.content) {
    return "No preview available";
  }
  const lines = file.content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return "No preview available";
  }
  return lines.slice(0, 2).join(" ");
}

function hideMentionList() {
  mentionState.active = false;
  mentionState.matches = [];
  mentionState.selectedIndex = 0;
  dom.mentionList.classList.remove("is-visible");
  dom.mentionList.innerHTML = "";
}

function stepMention(delta) {
  if (!mentionState.matches.length) {
    return;
  }
  const count = mentionState.matches.length;
  mentionState.selectedIndex = (mentionState.selectedIndex + delta + count) % count;
  renderMentionList();
}

function applyMentionSelection() {
  if (!mentionState.matches.length) {
    hideMentionList();
    return;
  }
  const selectedPath = mentionState.matches[mentionState.selectedIndex];
  const cursor = dom.input.selectionStart;
  const text = dom.input.value;
  const before = text.slice(0, mentionState.start);
  const after = text.slice(cursor);
  const insertion = `@${selectedPath} `;
  const nextValue = `${before}${insertion}${after}`;
  dom.input.value = nextValue;
  const nextCursor = before.length + insertion.length;
  dom.input.setSelectionRange(nextCursor, nextCursor);
  openFileForContext(selectedPath);
  hideMentionList();
}

function openFileForContext(path) {
  const match = state.files.find((file) => file.path === path);
  if (!match) {
    return false;
  }
  state.meta.activePath = path;
  saveState();
  renderTree();
  renderEditor();
  return true;
}

function generateStubReply(text) {
  const prompts = [
    "Thanks. I logged that. What role are you aiming for next?",
    "Captured. Share a project where you influenced a key decision.",
    "Noted. What kind of team or manager do you thrive with?",
    "Added to intake. Drop in a job description if you have one.",
  ];
  if (text.toLowerCase().includes("job description")) {
    return "Perfect. I will parse that and map it to the files on the left.";
  }
  return prompts[state.messages.length % prompts.length];
}

function appendToFile(path, snippet) {
  const file = state.files.find((item) => item.path === path);
  if (!file) {
    state.files.push({ path, content: `# Intake Notes\n\n${snippet}` });
    return;
  }
  file.content = `${file.content.trim()}\n${snippet}`;
}

function upsertFile(path, content) {
  const file = state.files.find((item) => item.path === path);
  if (!file) {
    state.files.push({ path, content });
    return;
  }
  file.content = content;
}

function updateActiveFile(content) {
  const file = state.files.find((item) => item.path === state.meta.activePath);
  if (!file) {
    return;
  }
  file.content = content;
  saveState();
}

function downloadFile(filename, contents) {
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadApiKey() {
  return localStorage.getItem(API_KEY_STORAGE);
}

function loadTheme() {
  return localStorage.getItem(THEME_KEY);
}

function saveTheme(value) {
  localStorage.setItem(THEME_KEY, value);
}

function applyTheme(value) {
  document.documentElement.setAttribute("data-theme", value);
  if (value === "light") {
    actions.toggleTheme.textContent = "Dark Mode";
  } else {
    actions.toggleTheme.textContent = "Light Mode";
  }
}

function maskKey(value) {
  if (value.length <= 8) {
    return "••••••";
  }
  return `${value.slice(0, 4)}••••••${value.slice(-4)}`;
}

function buildTranscript() {
  return state.messages
    .map((message) => {
      const time = message.timestamp ? formatTimestamp(message.timestamp) : "";
      const prefix = time ? `[${time}] ` : "";
      return `${prefix}${message.role}: ${message.content}`;
    })
    .join("\n");
}

async function copyTranscriptToClipboard() {
  const transcript = buildTranscript();
  if (!transcript.trim()) {
    alert("No messages to copy yet.");
    return;
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(transcript);
    } else {
      const area = document.createElement("textarea");
      area.value = transcript;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    alert("Transcript copied to clipboard.");
  } catch (error) {
    alert("Unable to copy transcript. Check browser permissions.");
  }
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getMentionedPaths(text) {
  const matches = [...text.matchAll(/@([^\s]+)/g)].map((match) => match[1]);
  return matches.filter((path) => state.files.some((file) => file.path === path));
}

function getContextFiles(text) {
  const mentioned = getMentionedPaths(text);
  if (mentioned.length) {
    return state.files.filter((file) => mentioned.includes(file.path));
  }
  return state.files;
}

function formatFilesForContext(files) {
  if (!files.length) {
    return "No artifact files found.";
  }
  return files
    .map((file) => `### ${file.path}\n${file.content}`)
    .join("\n\n");
}

function enrichPromptWithContext(prompt, files) {
  const context = formatFilesForContext(files);
  return `Artifact Context:\n${context}\n\nUser Request:\n${prompt}`;
}

function buildGeminiContents(history, prompt, files) {
  const trimmed = history.slice(-8).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  if (trimmed.length && trimmed[trimmed.length - 1].role === "user") {
    trimmed[trimmed.length - 1].parts[0].text = enrichPromptWithContext(
      prompt,
      files
    );
  } else {
    trimmed.push({
      role: "user",
      parts: [{ text: enrichPromptWithContext(prompt, files) }],
    });
  }
  return trimmed;
}

async function generateGeminiReply(prompt, history, options = {}) {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Missing Gemini API key.");
  }
  const files = options.contextFiles || getContextFiles(prompt);
  const contents = buildGeminiContents(history, prompt, files);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      payload?.error?.message ||
      `Gemini request failed (${response.status}).`;
    throw new Error(message);
  }
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No response from Gemini.");
  }
  return text.trim();
}

async function summarizeActiveNote() {
  const active = state.files.find((file) => file.path === state.meta.activePath);
  if (!active) {
    alert("Select a note to summarize first.");
    return;
  }
  const apiKey = loadApiKey();
  if (!apiKey) {
    renderApiKeyOverlay(true);
    return;
  }

  const pending = {
    role: "assistant",
    content: `Summarizing ${active.path}...`,
    timestamp: nowIso(),
  };
  state.messages.push(pending);
  saveState();
  renderMessages();
  setLoadingState(true);

  try {
    const summaryPrompt = `Summarize the note below for export. Provide a 1-line headline followed by up to 5 bullet points. Keep names and metrics as-is.\n\nNote:\n${active.content}`;
    const summary = await generateGeminiReply(
      summaryPrompt,
      state.messages.slice(0, -1),
      {
        contextFiles: [active],
      }
    );
    const summaryPath = "notes/summary.md";
    upsertFile(
      summaryPath,
      `# Summary\n\n${summary}\n`
    );
    pending.content = `Summary saved to ${summaryPath}.\n\n${summary}`;
    state.meta.activePath = summaryPath;
    saveState();
    render();
  } catch (error) {
    pending.content = `Summary failed: ${error.message || "Unable to summarize."}`;
    saveState();
    renderMessages();
  } finally {
    setLoadingState(false);
  }
}

function setLoadingState(isLoading) {
  actions.send.disabled = isLoading;
  actions.summarizeNote.disabled = isLoading;
  dom.input.disabled = isLoading;
}

async function exportZipBundle() {
  if (!window.JSZip) {
    alert("Zip export is unavailable. JSZip failed to load.");
    return;
  }
  const zip = new window.JSZip();
  state.files.forEach((file) => {
    zip.file(file.path, file.content);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "jobseeker-artifact.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
