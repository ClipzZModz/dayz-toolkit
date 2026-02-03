const logEl = document.getElementById("log");
const emptyEl = document.getElementById("empty");
const clearBtn = document.getElementById("clear");
const runBtn = document.getElementById("run");
const input = document.getElementById("command");

function appendLog(entry) {
  if (emptyEl) emptyEl.remove();
  const line = document.createElement("div");
  line.className = "line";

  const badge = document.createElement("span");
  badge.className = `badge badge-${String(entry.type || "INFO").toLowerCase()}`;
  badge.textContent = `[${entry.type || "INFO"}]`;

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = entry.time;

  const message = document.createElement("span");
  message.className = "message";
  message.textContent = entry.message;

  line.appendChild(badge);
  line.appendChild(time);
  line.appendChild(message);
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

clearBtn.addEventListener("click", () => {
  logEl.innerHTML = "";
  const placeholder = document.createElement("div");
  placeholder.id = "empty";
  placeholder.className = "empty";
  placeholder.textContent = "No logs yet.";
  logEl.appendChild(placeholder);
});

runBtn.addEventListener("click", () => {
  if (!window.dayztools) return;
  window.dayztools.runCli(input.value);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    window.dayztools.runCli(input.value);
  }
});

if (window.dayztools) {
  window.dayztools.onLog((entry) => appendLog(entry));
}
