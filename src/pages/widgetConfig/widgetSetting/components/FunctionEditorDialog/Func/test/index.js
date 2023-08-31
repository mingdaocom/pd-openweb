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

const dateifTimeData = {
  control: {
    type: 2,
    expression: "DATEIF($646c73339447b23a08da2526$,$646c73339447b23a08da2527$,'2','m')",
  },
  formData: [
    { controlId: '646c73339447b23a08da2526', type: 46, value: '07:00' },
    { controlId: '646c73339447b23a08da2527', type: 46, value: '22:00' },
  ],
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
const countArrayData = {
  control: {
    type: 2,
    expression: 'COUNTARRAY($6189ddd91c2854dd35392445$)',
  },
  formData: [{ type: 26, controlId: '6189ddd91c2854dd35392445', value: '[1]' }],
};
const distanceData = {
  control: {
    type: 2,
    expression: 'DISTANCE($64ba3c8d743a9579030d2498$,$64c0d8d14443151e8536f5a8$) * 1000',
  },
  formData: [
    {
      type: 40,
      controlId: '64ba3c8d743a9579030d2498',
      value:
        '{\n  "title": "磨憨口岸",\n  "address": "云南省西双版纳傣族自治州勐腊县磨憨镇磨憨口岸",\n  "x": 101.683764,\n  "y": 21.18293,\n  "coordinate": null\n}',
    },
    {
      type: 40,
      controlId: '64c0d8d14443151e8536f5a8',
      value:
        '{\n  "title": "磨憨口岸 - wgs84",\n  "address": "云南省西双版纳傣族自治州勐腊县磨憨镇磨憨口岸",\n  "x": 101.68239271683325,\n  "y": 21.18558295211555,\n  "coordinate": "wgs84"\n}',
    },
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
  await test('dateif时间字段', dateifTimeData);
  await test('地点之间的距离', distanceData);
  await test('countArray', countArrayData);
  await test('javascript', jsData);
})();
