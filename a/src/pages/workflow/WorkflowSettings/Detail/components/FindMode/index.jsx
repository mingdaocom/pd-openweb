import React, { Fragment } from 'react';
import { Radio } from 'ming-ui';

export default ({ execute, onChange, isFormula = false }) => {
  let TYPE = [
    {
      text: _l('直接获取'),
      value: true,
      desc: _l('执行到本节点时获取，并保存当时的数据供流程中的其他节点使用'),
    },
    {
      text: _l('每次使用时动态获取'),
      value: false,
      desc: _l('每次其他节点使用到本节点数据时，重新获取最新的数据'),
    },
  ];

  if (isFormula) {
    TYPE = [
      {
        text: _l('直接计算'),
        value: true,
        desc: _l('执行到本节点时开始计算，并保存当时的运算结果供流程中的其他节点使用'),
      },
      {
        text: _l('每次使用时动态计算'),
        value: false,
        desc: _l('每次其他节点使用到本节点的运算结果时，重新进行最新的计算'),
      },
    ];
  }

  return (
    <Fragment>
      <div className="mTop20 bold">{isFormula ? _l('运算方式') : _l('获取方式')}</div>
      {TYPE.map(item => (
        <div className="mTop15" key={item.value}>
          <Radio text={item.text} checked={execute === item.value} onClick={() => onChange(item.value)} />
          {item.desc && <div className="mTop5 mLeft30 Gray_9e">{item.desc}</div>}
        </div>
      ))}
    </Fragment>
  );
};
