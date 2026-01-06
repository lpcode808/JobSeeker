const STORAGE_KEY = "jobseeker.artifact.v1";

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
      path: "jobs/target-roles.md",
      content:
        "# Target Roles\n\n1. Product Analyst (B2B SaaS)\n2. Growth Strategy Lead\n3. Customer Insights Manager\n\n## Target Themes\n- Data + narrative\n- Ambiguous problems\n- Cross-functional collaboration\n",
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
      path: "notes/intake.md",
      content:
        "# Intake Notes\n\n- Wants interview prep for senior product analytics roles\n- Prefers collaborative teams, hybrid schedule\n- Values mentorship and fast iteration cycles\n",
    },
    {
      path: "exports/README.md",
      content:
        "# Export Notes\n\nExport JSON keeps the full structure. Markdown bundle is a single-file snapshot for emailing or printing.\n",
    },
  ],
  messages: [
    {
      role: "assistant",
      content:
        "Welcome back, Avery. Ready to tune this artifact for your next role?",
    },
    {
      role: "user",
      content:
        "Yes — I want prep for a Product Analyst interview next week.",
    },
    {
      role: "assistant",
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
      path: "jobs/target-roles.md",
      content:
        "# Target Roles\n\n1. \n2. \n3. \n\n## Target Themes\n- \n- \n",
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
      path: "notes/intake.md",
      content: "# Intake Notes\n\n- \n",
    },
  ],
  messages: [
    {
      role: "assistant",
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
};

const actions = {
  send: document.querySelector('[data-action="send"]'),
  exportJson: document.querySelector('[data-action="export-json"]'),
  exportZip: document.querySelector('[data-action="export-zip"]'),
  exportMarkdown: document.querySelector('[data-action="export-markdown"]'),
  startFresh: document.querySelector('[data-action="start-fresh"]'),
  restoreSample: document.querySelector('[data-action="restore-sample"]'),
  dismissOnboarding: document.querySelector('[data-action="dismiss-onboarding"]'),
};

const storedState = loadState();
let state = storedState ?? clone(sampleState);
if (!storedState) {
  saveState();
}

render();

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
      item.innerHTML = `<span>${file.path}</span>`;
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
    const role = document.createElement("div");
    role.className = "message__role";
    role.textContent = message.role;
    const body = document.createElement("div");
    body.textContent = message.content;
    wrapper.append(role, body);
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

dom.input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    sendMessage();
  }
});

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

function sendMessage() {
  const text = dom.input.value.trim();
  if (!text) {
    return;
  }
  state.messages.push({ role: "user", content: text });
  dom.input.value = "";

  appendToFile("notes/intake.md", `- ${text}\n`);

  const response = generateStubReply(text);
  state.messages.push({ role: "assistant", content: response });
  saveState();
  renderMessages();
  renderEditor();
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
