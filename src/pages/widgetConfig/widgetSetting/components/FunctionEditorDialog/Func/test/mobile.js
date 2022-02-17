const fs = require('fs');
const path = require('path');
const { Base64 } = require('js-base64');

const bundleFilePath = path.join(__dirname, '../../../../../../../../build/dist/mdfunction.bundle.js');

const data = {
  control: {
    type: 2,
    controlId: '6189ddbe1c2854dd35392437',
    value: '0',
    advancedSetting: {
      // defaultfunc: '{"expression":"SUM($6189ddd91c2854dd35392445$,$6189ddd91c2854dd35392446$)","status":1}',
      defaultfunc: '{"expression":"IF($61ea59556a642ea890f0a214$==\'选项1\',\'A\',\'B\')","status":1}',
    },
  },
  formData: [
    {
      type: 11,
      controlId: '61ea59556a642ea890f0a214',
      value: '["22ac2834-afa8-4717-903a-9ae7026cf48e"]',
      options: [
        {
          key: '22ac2834-afa8-4717-903a-9ae7026cf48e',
          value: '选项1',
        },
      ],
    },
    { type: 6, controlId: '6189ddd91c2854dd35392446', value: '1' },
  ],
};

eval(fs.readFileSync(bundleFilePath).toString());
console.log(executeMdFunction(Base64.encode(JSON.stringify(data))));
