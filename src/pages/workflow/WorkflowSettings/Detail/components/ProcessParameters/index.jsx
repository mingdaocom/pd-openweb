import React from 'react';
import SingleControlValue from '../SingleControlValue';
import { CONTROLS_NAME } from '../../../enum';
import cx from 'classnames';
import _ from 'lodash';

export default ({ companyId, processId, relationId, selectNodeId, data, updateSource }) => {
  return data.fields.map((item, i) => {
    const singleObj = _.find(data.subProcessVariables, obj => obj.controlId === item.fieldId) || {};
    const { controlName, sourceEntityName, alias } = singleObj;
    const parentNode = singleObj.dataSource ? _.find(data.fields, o => o.fieldId === singleObj.dataSource) || {} : {};

    if (
      parentNode.type === 10000007 ||
      (parentNode.type === 10000008 && (parentNode.fieldValueId || !parentNode.nodeId))
    )
      return null;

    return (
      <div key={item.fieldId} className={cx('relative', { mLeft24: singleObj.dataSource })}>
        <div className="mTop15 ellipsis Font13">
          <span className="Gray_75 mRight5">[{CONTROLS_NAME[singleObj.type]}]</span>
          {controlName}
          {singleObj.required && <span className="mLeft5 red">*</span>}
          {singleObj.type === 29 && <span className="Gray_75">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>}
          {alias && <span className="Gray_75">（{alias}）</span>}
        </div>
        <SingleControlValue
          companyId={companyId}
          processId={processId}
          relationId={relationId}
          selectNodeId={selectNodeId}
          sourceNodeId={singleObj.dataSource ? parentNode.nodeId : data.selectNodeId}
          controls={_.cloneDeep(data.subProcessVariables).map(o => {
            if (o.type === 10000008) {
              o.flowNodeAppDtos = data.batchNodes.filter(
                o => o.nodeId !== data.selectNodeId || item.nodeId === data.selectNodeId,
              );
            }
            return o;
          })}
          formulaMap={data.formulaMap}
          fields={data.fields}
          updateSource={updateSource}
          item={item}
          i={i}
        />
        {singleObj.desc && <div className="mTop5 Gray_75">{singleObj.desc}</div>}
      </div>
    );
  });
};
