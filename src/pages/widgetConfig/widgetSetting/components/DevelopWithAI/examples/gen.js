const fs = require('fs');
const path = require('path');

const examples = fs.readdirSync(path.join(__dirname)).filter(file => file.startsWith('default_'));

let result = '';

function firstUppercase(word) {
  return word[0].toUpperCase() + word.slice(1);
}

examples.forEach(example => {
  let content = fs.readFileSync(path.join(__dirname, example), 'utf8');
  if (!content) return;
  const componentName = example.replace('default_', '').replace('.js', '');
  result += `export const ${firstUppercase(componentName)} = \`${content
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')}\`;\n\n`;
});

console.log(result);
fs.writeFileSync(path.join(__dirname, 'index.js'), result);
