const fs = require('fs');
const path = require('path');

const bundleFilePath = path.join(__dirname, '../../../../../../../../build/dist/mdfunction.bundle.js');

const { run, runWithString } = require(bundleFilePath);
console.log(
  'runWithString: ' +
    runWithString(
      JSON.stringify({
        control: {
          type: 2,
          expression: 'SUM($6189ddd91c2-854dd35392445$,$6189ddd91c2-854dd35392446$)',
        },
        formData: [
          { type: 6, controlId: '6189ddd91c2-854dd35392445', value: '1' },
          { type: 6, controlId: '6189ddd91c2-854dd35392446', value: '1' },
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
