const CLASS_RE = /\bclass\b/g;

function findCfgVehiclesBlocks(text) {
  const blocks = [];
  const needle = /\bclass\s+CfgVehicles\b/gi;
  let match;

  while ((match = needle.exec(text)) !== null) {
    const start = match.index;
    const braceStart = text.indexOf("{", needle.lastIndex);
    if (braceStart === -1) continue;

    const braceEnd = findMatchingBrace(text, braceStart);
    if (braceEnd === -1) continue;

    blocks.push(text.slice(braceStart + 1, braceEnd));
    needle.lastIndex = braceEnd + 1;
  }

  return blocks;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseCfgVehiclesClasses(text) {
  const blocks = findCfgVehiclesBlocks(text);
  const classes = [];

  for (const block of blocks) {
    classes.push(...parseTopLevelClasses(block));
  }

  return classes;
}

function parseTopLevelClasses(block) {
  const classes = [];
  let depth = 0;
  let i = 0;

  while (i < block.length) {
    const ch = block[i];

    if (ch === "{") {
      depth += 1;
      i += 1;
      continue;
    }
    if (ch === "}") {
      depth -= 1;
      i += 1;
      continue;
    }

    if (depth === 0 && isWordAt(block, i, "class")) {
      i += 5;
      i = skipWhitespace(block, i);
      const name = readIdentifier(block, i);
      if (!name) {
        i += 1;
        continue;
      }
      i += name.length;

      i = skipWhitespace(block, i);
      let baseClass = null;
      if (block[i] === ":") {
        i += 1;
        i = skipWhitespace(block, i);
        const base = readIdentifier(block, i);
        if (base) {
          baseClass = base;
          i += base.length;
        }
      }

      i = skipWhitespace(block, i);
      if (block[i] === ";") {
        i += 1;
        continue;
      }

      const bodyStart = block.indexOf("{", i);
      if (bodyStart === -1) {
        i += 1;
        continue;
      }
      const bodyEnd = findMatchingBrace(block, bodyStart);
      if (bodyEnd === -1) {
        i = bodyStart + 1;
        continue;
      }
      const body = block.slice(bodyStart + 1, bodyEnd);
      const scope = readScope(body);

      classes.push({
        name,
        baseClass,
        scope,
      });

      i = bodyEnd + 1;
      continue;
    }

    i += 1;
  }

  return classes;
}

function readScope(body) {
  const match = body.match(/\bscope\s*=\s*(\d+)/i);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function isWordAt(text, index, word) {
  if (text.slice(index, index + word.length) !== word) return false;
  const before = text[index - 1];
  const after = text[index + word.length];
  if (before && /[A-Za-z0-9_]/.test(before)) return false;
  if (after && /[A-Za-z0-9_]/.test(after)) return false;
  return true;
}

function skipWhitespace(text, index) {
  let i = index;
  while (i < text.length && /\s/.test(text[i])) i += 1;
  return i;
}

function readIdentifier(text, index) {
  const start = index;
  let i = index;
  while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i += 1;
  if (i === start) return null;
  return text.slice(start, i);
}

module.exports = {
  parseCfgVehiclesClasses,
  findCfgVehiclesBlocks,
};
