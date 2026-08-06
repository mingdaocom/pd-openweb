const assert = require('assert');
const path = require('path');
const { transformFileSync } = require('@babel/core');

function requireEsm(file) {
  const module = { exports: {} };
  const { code } = transformFileSync(path.join(__dirname, file), {
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });

  new Function('module', 'exports', code)(module, module.exports);
  return module.exports;
}

const {
  CONTENT_TYPE,
  extractMjmlContent,
  getDefaultMjml,
  getEmailContentType,
  getFormulaMapWithInsertedField,
  getMjmlPreviewHtml,
  replaceMjmlFormulaForPreview,
} = requireEsm('./mjmlUtils.js');

assert.deepStrictEqual(CONTENT_TYPE, {
  TEXT: 1,
  RICH_TEXT: 2,
  MJML: 3,
});

assert.strictEqual(getEmailContentType({ emailContentType: 3, isRichText: true }), CONTENT_TYPE.MJML);
assert.strictEqual(getEmailContentType({ emailContentType: 2, isRichText: false }), CONTENT_TYPE.RICH_TEXT);
assert.strictEqual(getEmailContentType({ emailContentType: 1, isRichText: true }), CONTENT_TYPE.TEXT);
assert.strictEqual(getEmailContentType({ emailContentType: 0, isRichText: true }), CONTENT_TYPE.TEXT);
assert.strictEqual(getEmailContentType({ emailContentType: 0, isRichText: false }), CONTENT_TYPE.TEXT);
assert.strictEqual(getEmailContentType({ isRichText: true }), CONTENT_TYPE.TEXT);
assert.strictEqual(getEmailContentType({ isRichText: false }), CONTENT_TYPE.TEXT);

assert.deepStrictEqual(
  getEmailContentType({
    emailContentType: 0,
    fields: [
      {
        fieldId: 'content',
        isRichText: true,
      },
    ],
  }),
  CONTENT_TYPE.RICH_TEXT,
);

assert.strictEqual(
  extractMjmlContent('```xml\n<mjml>\n  <mj-body><mj-section /></mj-body>\n</mjml>\n```'),
  '<mjml>\n  <mj-body><mj-section /></mj-body>\n</mjml>',
);
assert.strictEqual(
  extractMjmlContent('before\n<mjml><mj-body></mj-body></mjml>\nafter'),
  '<mjml><mj-body></mj-body></mjml>',
);
assert.strictEqual(extractMjmlContent('<p>no mjml</p>'), '<p>no mjml</p>');
assert.strictEqual(getDefaultMjml({ backgroundColor: 'theme-bg', textColor: 'theme-text' }).includes('#f2f2f2'), false);
assert.strictEqual(getDefaultMjml({ backgroundColor: 'theme-bg', textColor: 'theme-text' }).includes('#222222'), false);
assert.strictEqual(
  getDefaultMjml({ backgroundColor: 'theme-bg', textColor: 'theme-text' }).includes('background-color="theme-bg"'),
  true,
);
assert.strictEqual(
  getDefaultMjml({ backgroundColor: 'theme-bg', textColor: 'theme-text' }).includes('color="theme-text"'),
  true,
);

assert.deepStrictEqual(
  getFormulaMapWithInsertedField(
    {
      keep: {
        name: '保留',
      },
    },
    {
      nodeId: 'node123',
      nodeTypeId: 2,
      appType: 1,
      actionId: 'action123',
      nodeName: '审批',
      fieldValueId: 'field123',
      fieldValueType: 14,
      fieldValueName: '结果',
      sourceType: 1,
    },
  ),
  {
    keep: {
      name: '保留',
    },
    node123: {
      type: 2,
      appType: 1,
      actionId: 'action123',
      name: '审批',
    },
    'node123-field123': {
      type: 14,
      name: '结果',
      sourceType: 1,
    },
  },
);

assert.strictEqual(
  replaceMjmlFormulaForPreview('内容 $node123-field123$', {
    node123: { name: '审批' },
    'node123-field123': { name: '结果' },
  }),
  '内容 审批-结果',
);
assert.strictEqual(
  replaceMjmlFormulaForPreview('内容 $missing-field123$', {
    node123: { name: '审批' },
    'node123-field123': { name: '结果' },
  }),
  '内容 $missing-field123$',
);
assert.strictEqual(
  replaceMjmlFormulaForPreview('内容 $node123-field123$', {
    node123: { name: '<节点>' },
    'node123-field123': { name: '"字段"&' },
  }),
  '内容 &lt;节点&gt;-&quot;字段&quot;&amp;',
);
assert.strictEqual(
  getMjmlPreviewHtml(
    '<body style="background-color:#f2f2f2;color:#222222">内容 $node123-field123$</body>',
    {
      node123: { name: '审批' },
      'node123-field123': { name: '结果' },
    },
    {
      backgroundColor: 'var-dark-bg',
      textColor: 'var-dark-text',
    },
  ),
  '<body style="background-color:var-dark-bg;color:var-dark-text">内容 审批-结果</body>',
);
assert.strictEqual(
  getMjmlPreviewHtml(
    '<body style="background-color:#ffffff;color:#151515">内容</body>',
    {},
    {
      backgroundColor: 'var-dark-bg',
      textColor: 'var-dark-text',
    },
  ),
  '<body style="background-color:var-dark-bg;color:var-dark-text">内容</body>',
);
assert.strictEqual(
  getMjmlPreviewHtml(
    '<body style="background-color:#161616;color:#e6e6e6">内容</body>',
    {},
    {
      backgroundColor: 'var-light-bg',
      textColor: 'var-light-text',
    },
  ),
  '<body style="background-color:var-light-bg;color:var-light-text">内容</body>',
);
assert.strictEqual(
  getMjmlPreviewHtml(
    '<body style="background-color:#ffffff;color:#333333">内容</body>',
    {},
    {
      backgroundColor: 'var-dark-bg',
      textColor: 'var-dark-text',
    },
  ),
  '<body style="background-color:#ffffff;color:#333333">内容</body>',
);
assert.strictEqual(
  getMjmlPreviewHtml(
    '<body style="background-color:#ffffff;color:#222222">内容</body>',
    {},
    {
      backgroundColor: 'var-dark-bg',
      textColor: 'var-dark-text',
    },
  ),
  '<body style="background-color:#ffffff;color:#222222">内容</body>',
);
assert.strictEqual(
  getMjmlPreviewHtml('<div style="margin:0px auto;max-width:600px;">内容</div>', {}),
  '<div style="margin:0px auto;">内容</div>',
);

console.log('mjmlUtils tests passed');
