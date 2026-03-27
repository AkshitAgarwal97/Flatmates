const { ESLint } = require("eslint");
(async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["src/**/*.{js,jsx,ts,tsx}"]);
  for (const r of results) {
    for (const m of r.messages) {
      if (m.ruleId === 'import/first' || m.severity === 2) {
        console.log(`${r.filePath}:${m.line} - ${m.ruleId}`);
      }
    }
  }
})().catch(console.error);
