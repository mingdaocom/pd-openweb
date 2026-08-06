const assert = require('assert');
const fs = require('fs');
const path = require('path');

function loadAgentApiGenInternals() {
  const filename = path.join(__dirname, 'agentApiGen.js');
  const source = `${fs.readFileSync(filename, 'utf8')}\nmodule.exports.__test = { parseSwagger };`;
  const moduleLike = { exports: {} };

  new Function('require', 'module', 'exports', '__dirname', '__filename', source)(
    require,
    moduleLike,
    moduleLike.exports,
    __dirname,
    filename,
  );

  return moduleLike.exports.__test;
}

const { parseSwagger } = loadAgentApiGenInternals();
const fns = parseSwagger({
  paths: {
    '/api/chat/stream': {
      post: {
        summary: '以 SSE 协议执行请求',
        parameters: [],
      },
    },
  },
  components: {
    schemas: {},
  },
});

assert.strictEqual(fns.length, 1);
assert.strictEqual(fns[0].name, 'chatStream');
assert.strictEqual(fns[0].isStream, true);

console.log('agentApiGen tests passed');
