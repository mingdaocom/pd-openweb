import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { NODE_TYPE } from '../../../enum';
import { getControlTypeName } from '../../../utils';
import SingleControlValue from '../SingleControlValue';

export default ({
  companyId,
  processId,
  relationId,
  selectNodeId,
  data,
  updateSource,
  selectNodeType,
  hideOtherField = false,
}) => {
  return data.fields.map((item, i) => {
    const singleObj = _.find(data.subProcessVariables, obj => obj.controlId === item.fieldId) || {};
    const { controlName, sourceEntityName } = singleObj;
    const parentNode = singleObj.dataSource ? _.find(data.fields, o => o.fieldId === singleObj.dataSource) || {} : {};

    if (
      parentNode.type === 10000007 ||
      (_.includes([2, 10000008], parentNode.type) && (parentNode.fieldValueId || !parentNode.nodeId))
    )
      return null;

    return (
      <div key={item.fieldId} className={cx('relative', { mLeft24: singleObj.dataSource })}>
        <div className="mTop15 ellipsis Font13">
          {selectNodeType !== NODE_TYPE.PLUGIN && (
            <span className="Gray_75 mRight5">[{getControlTypeName(singleObj)}]</span>
          )}
          <span className={cx({ bold: selectNodeType === NODE_TYPE.PLUGIN })}>{controlName}</span>
          {singleObj.required && <span className="mLeft5 red">*</span>}
          {singleObj.type === 29 && <span className="Gray_75">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>}
        </div>
        {singleObj.type !== 22 && (
          <SingleControlValue
            companyId={companyId}
            processId={processId}
            relationId={relationId}
            selectNodeId={selectNodeId}
            selectNodeType={selectNodeType}
            hideOtherField={hideOtherField}
            sourceNodeId={singleObj.dataSource ? parentNode.nodeId : data.selectNodeId}
            controls={_.cloneDeep(data.subProcessVariables).map(o => {
              if (o.type === 10000008) {
                o.flowNodeAppDtos = (data.batchNodes || []).filter(
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
        )}
        {singleObj.desc && <div className="mTop5 Gray_75 breakAll">{singleObj.desc}</div>}
        {singleObj.type === 22 && <div className="actionFieldsSplit mTop5 mRight0" />}
      </div>
    );
  });
};
