import React, { Fragment } from 'react';
import _ from 'lodash';
import { Radio } from 'ming-ui';
import { FindResult, SelectNodeObject, SingleControlValue } from '../components';

export default props => {
  const { data, SelectNodeObjectChange, updateSource } = props;
  const REFUND_TYPES = [
    { text: _l('全额退款'), desc: _l('系统将退还该订单已支付的全部金额'), value: '1' },
    { text: _l('部分退款'), desc: _l('部分退款金额(动态值)不得大于订单实付金额'), value: '2' },
  ];
  const refundType = data.fields.find(o => o.fieldId === 'refundType').fieldValue;

  return (
    <Fragment>
      <div className="textSecondary workflowDetailDesc pTop15 pBottom15">
        {_l(
          '系统将根据当前节点的记录对象，自动对其关联的支付订单发起退款（仅支持已产生支付订单的记录）；当退款金额大于订单实付金额时，本节点将自动跳过，不发起退款。',
        )}
      </div>

      <div className="Font13 bold mTop20">{_l('选择退款对象')}</div>
      <div className="Font13 textSecondary mTop10">{_l('当前流程中的节点对象')}</div>

      <SelectNodeObject
        appList={data.flowNodeList}
        selectNodeId={data.selectNodeId}
        selectNodeObj={data.selectNodeObj}
        onChange={SelectNodeObjectChange}
      />

      <div className="Font13 bold mTop20">{_l('退款金额')}</div>
      {REFUND_TYPES.map(item => (
        <div className="mTop15" key={item.value}>
          <Radio
            text={item.text}
            checked={refundType === item.value}
            onClick={() =>
              updateSource({
                fields: data.fields.map(o => {
                  if (o.fieldId === 'refundType') {
                    o.fieldValue = item.value;
                  } else {
                    o.fieldValue = '';
                    o.fieldValueId = '';
                    o.nodeId = '';
                  }

                  return o;
                }),
              })
            }
          />
          <div className="mTop5 mLeft30 textSecondary">{item.desc}</div>
        </div>
      ))}

      {refundType === '2' && (
        <div className="mTop5 mLeft30">
          <SingleControlValue
            companyId={props.companyId}
            relationId={props.relationId}
            processId={props.processId}
            selectNodeId={props.selectNodeId}
            sourceNodeId={data.selectNodeId}
            controls={data.controls}
            formulaMap={data.formulaMap}
            fields={data.fields}
            updateSource={updateSource}
            item={data.fields.find(o => o.fieldId === 'amount')}
            i={_.findIndex(data.fields, { fieldId: 'amount' })}
          />
        </div>
      )}

      <FindResult
        appType={data.appType}
        executeType={data.executeType}
        switchExecuteType={executeType => updateSource({ executeType })}
      />
    </Fragment>
  );
};
