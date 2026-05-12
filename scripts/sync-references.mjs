#!/usr/bin/env node
/**
 * sync-references.mjs
 *
 * Sync HarmonyOS reference docs from douya-labs/harmony-app-dev → src/content/docs/{en,zh}/<category>/<slug>.md
 *
 * Source resolution order:
 *   1. $REFS_DIR env var (absolute path to a references/ folder)
 *   2. ../harmony-app-dev/references (sibling checkout)
 *   3. ./references-cache  (existing local cache)
 *   4. shallow clone douya-labs/harmony-app-dev → /tmp/hap-refs, copy to ./references-cache
 *
 * - Generates frontmatter (title, description, category, sidebar order)
 * - English: copies original content as-is, with a "Source" footer
 * - Chinese: copies English content with a banner: "Translation pending — content shown in English."
 *   (intentional fallback; do not auto-translate)
 *
 * Run from repo root:
 *   npm run sync:refs
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_EN = path.join(REPO_ROOT, 'src/content/docs/docs');
const OUT_ZH = path.join(REPO_ROOT, 'src/content/docs/zh/docs');

const HAP_REPO = 'https://github.com/douya-labs/harmony-app-dev.git';

async function resolveRefsDir() {
  // 1. env override
  if (process.env.REFS_DIR) {
    const p = path.resolve(process.env.REFS_DIR);
    if (existsSync(p)) {
      console.log(`[refs] using REFS_DIR=${p}`);
      return p;
    }
    console.warn(`[refs] REFS_DIR set but not found: ${p}`);
  }

  // 2. sibling checkout (common dev setup: ~/workspace/harmony-app-dev next to ohosdev)
  const sibling = path.resolve(REPO_ROOT, '..', 'harmony-app-dev', 'references');
  if (existsSync(sibling)) {
    console.log(`[refs] using sibling checkout: ${sibling}`);
    return sibling;
  }

  // 3. local cache
  const cache = path.join(REPO_ROOT, 'references-cache');
  if (existsSync(cache)) {
    console.log(`[refs] using cache: ${cache}`);
    return cache;
  }

  // 4. shallow clone into /tmp, copy to cache
  const tmp = path.join(os.tmpdir(), `hap-refs-${process.pid}`);
  console.log(`[refs] cloning ${HAP_REPO} (shallow) → ${tmp}`);
  if (existsSync(tmp)) {
    execSync(`rm -rf "${tmp}"`, { stdio: 'inherit' });
  }
  execSync(`git clone --depth 1 --filter=blob:none --sparse "${HAP_REPO}" "${tmp}"`, {
    stdio: 'inherit',
  });
  execSync(`git -C "${tmp}" sparse-checkout set references`, { stdio: 'inherit' });
  await fs.mkdir(cache, { recursive: true });
  execSync(`cp -r "${tmp}/references/." "${cache}/"`, { stdio: 'inherit' });
  execSync(`rm -rf "${tmp}"`, { stdio: 'inherit' });
  console.log(`[refs] cached to: ${cache}`);
  return cache;
}

/** Category & metadata map for the 38 references */
const META = {
  // foundation
  'capability-map':            { cat: 'foundation', title: 'Capability Map', order: 1 },
  'coverage':                  { cat: 'foundation', title: 'Coverage Matrix', order: 2 },
  'app-model':                 { cat: 'foundation', title: 'App Model (Stage Model)', order: 10 },
  'packaging':                 { cat: 'foundation', title: 'Packaging: HAP / HAR / HSP', order: 11 },
  'arkts-language':            { cat: 'foundation', title: 'ArkTS Language', order: 12 },
  'resource-management':       { cat: 'foundation', title: 'Resource Management', order: 13 },
  // ui
  'ui-design':                 { cat: 'ui', title: 'UI Design Principles', order: 1 },
  'ui-implementation-rules':   { cat: 'ui', title: 'UI Implementation Rules', order: 2 },
  'state-management':          { cat: 'ui', title: 'ArkUI State Management', order: 3 },
  'visual-effects-recipes':    { cat: 'ui', title: 'Visual Effects Recipes', order: 4 },
  'animation-and-gesture':     { cat: 'ui', title: 'Animation & Gesture', order: 5 },
  'canvas':                    { cat: 'ui', title: 'Canvas (2D Drawing)', order: 6 },
  'graphics-3d':               { cat: 'ui', title: 'ArkGraphics 3D', order: 7 },
  'component-library-policy':  { cat: 'ui', title: 'Component Library Policy', order: 8 },
  'accessibility':             { cat: 'ui', title: 'Accessibility', order: 9 },
  // widget
  'widget':                    { cat: 'widget', title: 'Widgets (Service Cards) Overview', order: 1 },
  'widget-cookbook':           { cat: 'widget', title: 'Widget Cookbook', order: 2 },
  'atomic-service':            { cat: 'widget', title: 'Atomic Service', order: 3 },
  // platform
  'permissions':               { cat: 'platform', title: 'Permissions', order: 1 },
  'security-and-privacy':      { cat: 'platform', title: 'Security & Privacy', order: 2 },
  'i18n':                      { cat: 'platform', title: 'Internationalization (i18n)', order: 3 },
  'notification':              { cat: 'platform', title: 'Notifications', order: 4 },
  'background-tasks':          { cat: 'platform', title: 'Background Tasks', order: 5 },
  'concurrency':               { cat: 'platform', title: 'Concurrency (TaskPool / Worker)', order: 6 },
  'cross-device':              { cat: 'platform', title: 'Cross-Device', order: 7 },
  'distributed':               { cat: 'platform', title: 'Distributed', order: 8 },
  // data & io
  'persistence':               { cat: 'data-io', title: 'Persistence (Preferences / RDB / KV)', order: 1 },
  'file-management':           { cat: 'data-io', title: 'File Management', order: 2 },
  'network':                   { cat: 'data-io', title: 'Network', order: 3 },
  'media-and-camera':          { cat: 'data-io', title: 'Media & Camera', order: 4 },
  'location':                  { cat: 'data-io', title: 'Location', order: 5 },
  // workflow
  'debugging':                 { cat: 'workflow', title: 'Debugging', order: 1 },
  'testing':                   { cat: 'workflow', title: 'Testing', order: 2 },
  'publishing':                { cat: 'workflow', title: 'Publishing', order: 3 },
  'api-watch':                 { cat: 'workflow', title: 'API Watch', order: 4 },
  'official-search-playbook':  { cat: 'workflow', title: 'Official Search Playbook', order: 5 },
  'official-api-examples':     { cat: 'workflow', title: 'Official API Examples', order: 6 },
  'example-cookbook':          { cat: 'workflow', title: 'Example Cookbook', order: 7 },
};

const CATEGORY_LABELS = {
  foundation: 'Foundation',
  ui: 'UI & ArkUI',
  widget: 'Widget & Service Card',
  platform: 'Platform Capabilities',
  'data-io': 'Data & I/O',
  workflow: 'Workflow & Tooling',
};

function escapeYaml(str) {
  return String(str).replace(/"/g, '\\"');
}

function deriveDescription(body, fallback) {
  const purposeMatch = body.match(/##\s*Purpose\s*\n+([^\n#][^\n]*(?:\n[^\n#][^\n]*)*)/i);
  let para = purposeMatch ? purposeMatch[1] : null;
  if (!para) {
    const lines = body.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i].trim();
      if (!l || l.startsWith('#') || l.startsWith('---')) continue;
      para = l;
      break;
    }
  }
  if (!para) return fallback;
  para = para.replace(/\s+/g, ' ').trim();
  if (para.length > 200) para = para.slice(0, 197) + '…';
  return para;
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function writeCategoryIndex(baseDir, langPrefix) {
  for (const [slug, label] of Object.entries(CATEGORY_LABELS)) {
    const dir = path.join(baseDir, slug);
    await ensureDir(dir);
    const idx = path.join(dir, 'index.md');
    try { await fs.access(idx); continue; } catch {}
    const desc = langPrefix === 'zh'
      ? `${label} — HarmonyOS 开发参考分类。`
      : `${label} — HarmonyOS development references in this category.`;
    const body = `---
title: "${label}"
description: "${desc}"
sidebar:
  order: 0
---

${langPrefix === 'zh'
  ? `本分类汇总 HarmonyOS 在「${label}」方向上的参考文档。`
  : `This section gathers HarmonyOS references in the **${label}** area.`}
`;
    await fs.writeFile(idx, body, 'utf8');
  }
}

async function syncOne(SRC, slug) {
  const meta = META[slug];
  if (!meta) {
    console.warn(`[skip] no meta for ${slug}`);
    return;
  }
  const srcPath = path.join(SRC, `${slug}.md`);
  const raw = await fs.readFile(srcPath, 'utf8');

  const body = raw.replace(/^\s*#\s+[^\n]+\n+/, '');
  const description = deriveDescription(body, meta.title);

  const sourceUrl = `https://github.com/douya-labs/harmony-app-dev/blob/main/references/${slug}.md`;

  const fmEn = `---
title: "${escapeYaml(meta.title)}"
description: "${escapeYaml(description)}"
sidebar:
  order: ${meta.order}
---

> Reference doc — auto-synced from the [\`harmony-app-dev\`](https://github.com/douya-labs/harmony-app-dev) AgentSkill.
> Source: [\`references/${slug}.md\`](${sourceUrl})

`;
  const fmZh = `---
title: "${escapeYaml(meta.title)}"
description: "${escapeYaml(description)}"
sidebar:
  order: ${meta.order}
---

:::caution[Translation pending]
此页中文版本尚未翻译。下方内容暂以英文显示，欢迎在 GitHub 提交翻译 PR。
:::

> Reference doc — auto-synced from the [\`harmony-app-dev\`](https://github.com/douya-labs/harmony-app-dev) AgentSkill.
> Source: [\`references/${slug}.md\`](${sourceUrl})

`;

  const enDir = path.join(OUT_EN, meta.cat);
  const zhDir = path.join(OUT_ZH, meta.cat);
  await ensureDir(enDir);
  await ensureDir(zhDir);
  await fs.writeFile(path.join(enDir, `${slug}.md`), fmEn + body, 'utf8');
  await fs.writeFile(path.join(zhDir, `${slug}.md`), fmZh + body, 'utf8');
}

async function main() {
  const SRC = await resolveRefsDir();
  const files = (await fs.readdir(SRC)).filter((f) => f.endsWith('.md'));
  console.log(`syncing ${files.length} reference files…`);
  await ensureDir(OUT_EN);
  await ensureDir(OUT_ZH);
  await writeCategoryIndex(OUT_EN, 'en');
  await writeCategoryIndex(OUT_ZH, 'zh');
  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    await syncOne(SRC, slug);
  }
  console.log('done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
