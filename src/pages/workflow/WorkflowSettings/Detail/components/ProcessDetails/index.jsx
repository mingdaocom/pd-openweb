import React, { Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
import SingleControlValue from '../SingleControlValue';
import { OPERATION_TYPE } from '../../../enum';

export default props => {
  const { data, getNodeDetail, updateSource } = props;
  const fieldId = ((data.fields || [])[0] || {}).fieldId || '';
  const item = data.controls.find(({ controlId }) => controlId === fieldId);
  const list = data.controls.map(({ controlId, controlName, sourceEntityName }) => ({
    text: (
      <span>
        {controlName}
        <span className="Gray_75">（{_l('关联表“%0”', sourceEntityName)}）</span>
      </span>
    ),
    value: controlId,
  }));
  const detailSource = (data.flowNodeMap || {})[OPERATION_TYPE.GET_OPERATION] || {};

  if (fieldId) {
    list.unshift({
      text: _l('清除选择'),
      value: '',
    });
  }

  return (
    <Fragment>
      <div className="Font13 mTop20 bold">{_l('更新流程操作明细（每个节点完成后）')}</div>
      <div className="Font13 Gray_9e mTop10">
        {_l('选择一个子表或关联表，系统将于每个节点完成后，自动同步本流程的各人工节点的操作明细至该表')}
      </div>
      <Dropdown
        className={cx('flowDropdown mTop10', { 'errorBorder errorBG': fieldId && !item })}
        data={list}
        value={fieldId}
        renderTitle={
          !fieldId
            ? () => <span className="Gray_9e">{_l('请选择')}</span>
            : fieldId && !item
            ? () => <span className="errorColor">{_l('字段不存在或已删除')}</span>
            : () => (
                <span>
                  {item.controlName}
                  <span className="Gray_75">（{_l('关联表“%0”', item.sourceEntityName)}）</span>
                </span>
              )
        }
        border
        onChange={fieldId =>
          fieldId
            ? getNodeDetail({ fields: [{ fieldId }] })
            : updateSource({
                fields: [],
                flowNodeMap: Object.assign({}, data.flowNodeMap, { [OPERATION_TYPE.GET_OPERATION]: {} }),
              })
        }
      />

      {(detailSource.fields || []).map((item, i) => {
        const singleObj = _.find(detailSource.controls, obj => obj.controlId === item.fieldId) || {};
        const { controlName, sourceEntityName } = singleObj;

        if (item.type === 29) return null;

        return (
          <div key={item.fieldId} className="relative">
            <div className="flexRow alignItemsCenter mTop15">
              <div className="ellipsis Font13 flex mRight20">
                {controlName}
                {singleObj.required && <span className="mLeft5 red">*</span>}
                {singleObj.type === 29 && <span className="Gray_9e">{`（${_l('工作表')}“${sourceEntityName}”）`}</span>}
              </div>
            </div>
            <SingleControlValue
              companyId={props.companyId}
              processId={props.processId}
              relationId={props.relationId}
              selectNodeId={props.selectNodeId}
              sourceNodeId={detailSource.selectNodeId}
              controls={detailSource.controls}
              formulaMap={detailSource.formulaMap}
              fields={detailSource.fields}
              showCurrent
              updateSource={(obj, callback = () => {}) =>
                updateSource(
                  {
                    flowNodeMap: Object.assign({}, data.flowNodeMap, {
                      [OPERATION_TYPE.GET_OPERATION]: Object.assign(
                        {},
                        data.flowNodeMap[OPERATION_TYPE.GET_OPERATION],
                        obj,
                      ),
                    }),
                  },
                  callback,
                )
              }
              item={item}
              i={i}
            />
          </div>
        );
      })}
    </Fragment>
  );
};
