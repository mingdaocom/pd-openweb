import React, { Fragment } from 'react';
import { Radio } from 'ming-ui';
import { NODE_TYPE } from '../../../enum';
import _ from 'lodash';

export default ({ executeType, switchExecuteType, allowAdd = false, nodeType }) => {
  const EXECUTE_TYPE = [
    {
      text: _l('继续执行'),
      value: 2,
      desc: _.includes([NODE_TYPE.WEBHOOK, NODE_TYPE.API], nodeType)
        ? _l('之后节点在使用本节点对象或数据时将跳过无法匹配值的项')
        : _l('之后节点在使用本节点对象或数据时将跳过执行'),
    },
    { text: _l('在工作表中新增记录后继续执行'), value: 1 },
    {
      text: _.includes([NODE_TYPE.WEBHOOK, NODE_TYPE.JSON_PARSE, NODE_TYPE.API], nodeType)
        ? _l('中止流程')
        : _l('中止流程，或继续执行查找结果分支'),
      value: 0,
    },
  ];

  if (!allowAdd) {
    _.remove(EXECUTE_TYPE, item => item.value === 1);
  }

  return (
    <Fragment>
      <div className="mTop20 bold">
        {_.includes([NODE_TYPE.WEBHOOK, NODE_TYPE.API], nodeType)
          ? _l('请求超时或请求失败时')
          : nodeType === NODE_TYPE.JSON_PARSE
          ? _l('触发错误时')
          : _l('未获取到数据时')}
      </div>
      {EXECUTE_TYPE.map(item => (
        <div className="mTop15" key={item.value}>
          <Radio text={item.text} checked={executeType === item.value} onClick={() => switchExecuteType(item.value)} />
          {item.desc && <div className="mTop5 mLeft30 Gray_75">{item.desc}</div>}
        </div>
      ))}
    </Fragment>
  );
};
