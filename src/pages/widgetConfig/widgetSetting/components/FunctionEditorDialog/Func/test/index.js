const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Base64 } = require('js-base64');

const bundleFilePath = path.join(__dirname, '../../../../../../../../build/dist/mdfunction.bundle.js');
const { run } = require(bundleFilePath);

function runAndOutput(description = '', data) {
  console.log(`calculate ${description} in nodejs:`);
  console.log('result:', run(data));
}
function runInSwift(description = '', data) {
  return new Promise((resolve, reject) => {
    const runner = spawn('swift', ['test.swift', Base64.encode(JSON.stringify(data))]);
    console.log(`calculate ${description} in swift:`);
    runner.stdout.on('data', out => console.log(String(out)));
    runner.stderr.on('data', err => console.log('\x1b[31m%s\x1b[0m', String(err)));
    runner.stderr.on('close', code => (!code ? resolve() : reject()));
  });
}

const concatDepartmentAndUserData = {
  control: {
    type: 2,
    expression: 'CONCAT($6189ddd91c2854dd35392445$, "/", $6189ddd91c2854dd35392444$)',
  },
  formData: [
    { type: 26, controlId: '6189ddd91c2854dd35392444', value: '["人员"]' },
    { type: 27, controlId: '6189ddd91c2854dd35392445', value: '["部门"]' },
  ],
};

const dateaddData = {
  control: {
    type: 2,
    expression: 'DATEADD(DATENOW(), "+1Y")',
  },
  formData: [],
};

const sumData = {
  control: {
    type: 2,
    expression: 'SUM($6189ddd91c2854dd35392445$,$6189ddd91c2854dd35392446$,)',
  },
  formData: [
    { type: 6, controlId: '6189ddd91c2854dd35392445', value: 2 },
    { type: 6, controlId: '6189ddd91c2854dd35392446', value: 1000 },
  ],
};
const jsData = {
  control: JSON.parse(
    `{"controlId":"6233e5dee45e6b32e6399022","type":2,"advancedSetting":{"dismanual":"0","getinput":"0","getsave":"0","defaulttype":"1","dynamicsrc":"","defaultfunc":"{\\"type\\":\\"javascript\\",\\"expression\\":\\"var a = $6233e5dee45e6b32e6399021$;\\\\nreturn [...new Array(5)].fill(a).join('-');\\",\\"status\\":1}","min":"","max":""}}`,
  ),
  formData: [JSON.parse('{"type":2,"controlId":"6233e5dee45e6b32e6399021","value":"cc"}')],
};

async function test(prefix, data) {
  await runAndOutput(prefix, data);
  await runInSwift(prefix, data);
}

(async () => {
  await test('部门人员拼接', concatDepartmentAndUserData);
  await test('日期计算 DATEADD(DATENOW(), "+1Y")', dateaddData);
  await test('求和', sumData);
  await test('javascript', jsData);
})();
