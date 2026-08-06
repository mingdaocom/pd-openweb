const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, 'index.jsx'), 'utf8');

assert.strictEqual(source.includes('const textMode = ['), false);
assert.match(source, /日期、时间、数值、金额字段做为文本时，按字段格式显示，如：3,141\.592\.6/);
assert.match(source, /<Switch[\s\S]*checked={data\.textShowType === 1}/);
assert.match(source, /text={data\.textShowType === 1 \? _l\('开启'\) : _l\('关闭%03087'\)}/);
assert.match(source, /textShowType: checked \? 0 : 1/);

console.log('process config text format tests passed');
