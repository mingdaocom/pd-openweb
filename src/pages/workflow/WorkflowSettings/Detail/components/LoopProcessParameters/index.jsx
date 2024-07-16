import React, { Fragment, useState } from 'react';
import { Icon, Dropdown } from 'ming-ui';
import { v4 as uuidv4, validate } from 'uuid';
import { FIELD_TYPE_LIST } from '../../../enum';
import _ from 'lodash';
import styled from 'styled-components';
import SingleControlValue from '../SingleControlValue';
import cx from 'classnames';
import process from '../../../../api/process';

const List = styled.div`
  .w120 {
    width: 120px;
  }
  .w160 {
    width: 160px;
  }
  .w250 {
    width: 250px;
  }
  .w45 {
    width: 45px;
  }
  .fieldName {
    padding: 5px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    height: 36px;
    line-height: 36px;
    font-size: 13px;
    &:focus {
      border-color: #2196f3;
    }
  }
  .fieldDelBtn {
    cursor: pointer;
    &:not(.disabled):hover {
      color: #f44336 !important;
    }
  }
  .parameterErrorMessage {
    position: absolute;
    bottom: 25px;
    transform: translateY(-7px);
    z-index: 1;
    left: 135px;
    border-radius: 3px;
    color: #fff;
    padding: 5px 12px;
    white-space: nowrap;
    background: #f44336;
    font-size: 12px;
    .parameterErrorArrow {
      position: absolute;
      transform: translateY(-5px);
      z-index: 1;
      left: 12px;
      background: transparent;
      border: 6px solid transparent;
      border-top-color: #f44336;
      bottom: -17px;
    }
  }
`;

export default props => {
  const { companyId, processId, relationId, selectNodeId, data, updateSource, onDelete } = props;

  return (
    <List className="mTop15">
      <div className="flexRow">
        <div className="w120">{_l('参数类型')}</div>
        <div className="flex mLeft10">{_l('参数名称')}</div>
        <div className="w160 mLeft10">{_l('说明')}</div>
        <div className="w250 mLeft10">{_l('参数值')}</div>
        <div className="w45 mLeft10"></div>
      </div>
      {data.subProcessVariables.map((item, index) => (
        <div key={index} className="flexRow mTop4 relative">
          <Dropdown
            className="w120 mTop8"
            menuStyle={{ width: '100%' }}
            data={FIELD_TYPE_LIST.filter(o => _.includes([2, 6, 16, 26, 27, 48], o.value))}
            value={item.type}
            disabled
            border
          />

          <input type="text" className="mLeft10 fieldName flex mTop8 minWidth0" disabled value={item.controlName} />

          <input
            type="text"
            className="mLeft10 fieldName w160 mTop8"
            disabled={item.processVariableType === 3}
            placeholder={_l('请输入说明')}
            value={item.desc}
            maxLength={64}
            onChange={e => {
              updateSource({
                subProcessVariables: data.subProcessVariables.map(o => {
                  if (o.controlId === item.controlId) {
                    o.desc = e.target.value.trim();
                  }
                  return o;
                }),
              });
            }}
          />

          <div className="mLeft10 w250">
            <SingleControlValue
              companyId={companyId}
              processId={processId}
              relationId={relationId}
              selectNodeId={selectNodeId}
              controls={data.subProcessVariables}
              formulaMap={data.formulaMap}
              fields={data.fields}
              updateSource={updateSource}
              item={_.find(data.fields, o => o.fieldId === item.controlId)}
              i={index}
            />
          </div>

          <div className="mLeft10 w45 flexRow mTop8 Font16 alignItemsCenter">
            <Icon
              icon={item.attribute === 1 ? 'ic_title' : 'title'}
              className={cx('Gray_75 ThemeHoverColor3 pointer', { ThemeColor3: item.attribute === 1 })}
              onClick={() => {
                updateSource({
                  subProcessVariables: data.subProcessVariables.map(o => {
                    o.attribute = o.controlId === item.controlId ? 1 : 0;
                    return o;
                  }),
                });
              }}
            />
            <Icon
              icon="task-new-delete"
              className={cx('mLeft10 Gray_75 fieldDelBtn', { 'disabled Alpha5': item.processVariableType === 3 })}
              onClick={() => {
                if (item.processVariableType !== 3) {
                  onDelete(data.subProcessVariables.filter(o => o.controlId !== item.controlId));
                }
              }}
            />
          </div>
        </div>
      ))}
    </List>
  );
};
