import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Radio } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { APP_TYPE, NODE_TYPE } from '../../../enum';

export default ({ executeType, updateSource, allowAdd = false, nodeType, appType, ignoreError }) => {
  const EXECUTE_TYPE = [
    {
      text: _l('继续执行'),
      value: 2,
      desc:
        _.includes([NODE_TYPE.WEBHOOK, NODE_TYPE.API], nodeType) || _.includes([APP_TYPE.REFUND, appType])
          ? _l('之后节点在使用本节点对象或数据时将跳过无法匹配值的项')
          : _l('之后节点在使用本节点对象或数据时将跳过执行'),
    },
    { text: _l('在工作表中新增记录后继续执行'), value: 1 },
    {
      text:
        _.includes([NODE_TYPE.WEBHOOK, NODE_TYPE.JSON_PARSE, NODE_TYPE.API], nodeType) ||
        _.includes([APP_TYPE.REFUND, appType])
          ? _l('中止流程')
          : _l('中止流程，或继续执行查找结果分支'),
      value: 0,
    },
  ];
  const TEXT = {
    8: _l('请求超时或请求失败时'),
    21: _l('触发错误时'),
    25: _l('请求超时或请求失败时'),
    51: _l('退款失败时'),
  };

  if (!allowAdd) {
    _.remove(EXECUTE_TYPE, item => item.value === 1);
  }

  return (
    <Fragment>
      <div className="mTop20 bold">
        {_.includes([NODE_TYPE.WEBHOOK, NODE_TYPE.JSON_PARSE, NODE_TYPE.API], nodeType)
          ? TEXT[nodeType]
          : TEXT[appType] || _l('未获取到数据时')}
      </div>
      {EXECUTE_TYPE.map(item => (
        <div className="mTop15" key={item.value}>
          <div className="flexRow alignItemsCenter">
            <Radio
              text={item.text}
              checked={executeType === item.value}
              onClick={() => updateSource({ executeType: item.value })}
            />
            <div className="flex " />
            {item.value === 1 && executeType === 1 && (
              <Fragment>
                <Checkbox
                  className="InlineFlex mRight5"
                  text={_l('新增失败时继续执行')}
                  checked={ignoreError}
                  onClick={checked => updateSource({ ignoreError: !checked })}
                />
                <Tooltip
                  placement="topLeft"
                  title={_l(
                    '未勾选时，如果新增失败（如工作表中配置了唯一索引）则中止流程。勾选后，则仍继续执行，此时本节点数据对象为空，后续节点在使用本节点时将跳过。',
                  )}
                >
                  <i className="Font14 icon-info textTertiary" />
                </Tooltip>
              </Fragment>
            )}
          </div>

          {item.desc && <div className="mTop5 mLeft30 textSecondary">{item.desc}</div>}
        </div>
      ))}
    </Fragment>
  );
};
