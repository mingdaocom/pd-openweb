# 函数运行 JavaScript 库

提供的为名为 mdfunction.bundle.js 的 js 文件

## For Mobile

函数文件最外层声明了名为 `executeMdFunction` 函数变量

函数接受一个参数，参数为 Base64 转码后的字符串，字符串原始值为序列化后的对象{control: ..., formData: ...}

函数正常返回一个 数值 或 字符串，计算错误时返回 undefined

### 对象示例

```javascript
 {
  control: {
    type: 2,
    advancedSetting: {
      defaultfunc: '{"expression":"SUM($6189ddd91c2854dd35392445$,$6189ddd91c2854dd35392446$)","status":1}',
    },
  },
  formData: [
    { type: 6, controlId: '6189ddd91c2854dd35392445', value: '10000', ... },
    { type: 6, controlId: '6189ddd91c2854dd35392446', value: '1', ... },
  ],
}
```

> formData 里的对象建议直接传后端返回的控件对象，后续支持复杂字段计算时可能会需要一些属性值。

## For Nodejs

直接 require mdfunction.bundle.js 文件
模块返回两个方法 run 和 runWithString，
run 参数为 `{ control: ..., formData: ... }` 对象，runWithString 方法参数为序列化过的 `{ control: ..., formData: ... }` 字符串  
计算正确返回一个数值或字符串，计算错误返回 `undefined`

### 示例

```javascript
const fs = require('fs');
const path = require('path');

const bundleFilePath = 'mdfunction.bundle.js';

const { run, runWithString } = require(bundleFilePath);
console.log(
  'runWithString: ' +
    runWithString(
      JSON.stringify({
        control: {
          type: 2,
          expression: 'SUM($6189ddd91c2854dd35392445$,$6189ddd91c2854dd35392446$)',
        },
        formData: [
          { type: 6, controlId: '6189ddd91c2854dd35392445', value: '10000' },
          { type: 6, controlId: '6189ddd91c2854dd35392446', value: '1' },
        ],
      }),
    ),
);

console.log(
  'run: ' +
    run({
      control: {
        type: 2,
        expression: 'SUM($6189ddd91c2854dd35392445$,$6189ddd91c2854dd35392446$)',
      },
      formData: [
        { type: 6, controlId: '6189ddd91c2854dd35392445', value: '10000' },
        { type: 6, controlId: '6189ddd91c2854dd35392446', value: '1' },
      ],
    }),
);
```
