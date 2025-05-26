const fs = require('fs');
const path = require('path');

const serverEntryPath = path.join(process.cwd(), 'build', 'server', 'index.js');

// Fix the renderToReadableStream import
const fixRenderImport = (content) => {
  return content.replace(
    /import\s*\{\s*renderToReadableStream\s*\}\s*from\s*['"]react-dom\/server['"]/g,
    'import pkg from \'react-dom/server\';\nconst { renderToReadableStream } = pkg;'
  );
};

// Read the server entry file
let content = fs.readFileSync(serverEntryPath, 'utf-8');

// Apply fixes
content = fixRenderImport(content);

// Write the fixed content back
fs.writeFileSync(serverEntryPath, content, 'utf-8');

console.log('Vercel build fixes applied successfully!');
