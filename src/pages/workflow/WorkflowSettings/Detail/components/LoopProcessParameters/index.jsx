import React, { Fragment } from 'react';
import { Icon, Dropdown } from 'ming-ui';
import { FIELD_TYPE_LIST, ACTION_ID } from '../../../enum';
import _ from 'lodash';
import styled from 'styled-components';
import SingleControlValue from '../SingleControlValue';
import cx from 'classnames';
import { v4 as uuidv4, validate } from 'uuid';

const List = styled.div`
  .w120 {
    width: 120px;
  }
  .w160 {
    width: 160px;
  }
  .w265 {
    width: 265px;
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
`;

export default props => {
  const { companyId, processId, relationId, selectNodeId, data, updateSource, isFirstNode } = props;
  const updateItem = (controlId, key, value) => {
    updateSource({
      controls: data.controls.map(o => {
        if (o.controlId === controlId) {
          o[key] = value;
        }
        return o;
      }),
    });
  };

  return (
    <Fragment>
      <div className="Font13 bold">{_l('参数设置')}</div>
      <div className="Font13 mTop5 Gray_75">
        {_.includes([data.triggerId, data.actionId], ACTION_ID.CONDITION_LOOP)
          ? _l('定义循环中使用的参数，每次循环可以使用前一次循环中更新的参数值。“index”参数每次循环后自动加1。')
          : _l(
              '定义循环中使用的参数，每次循环可以使用前一次循环中更新的参数值。“start”参数每次循环自动增加“step”的值。',
            )}
      </div>

      <List className="mTop15">
        <div className="flexRow">
          <div className="w120">{_l('参数类型')}</div>
          <div className="flex mLeft10">{_l('参数名称')}</div>
          <div className="w160 mLeft10">{_l('说明')}</div>
          <div className="w265 mLeft10">{isFirstNode ? _l('默认值') : _l('参数值')}</div>
          {isFirstNode && <div className="w45 mLeft10"></div>}
        </div>
        {data[isFirstNode ? 'controls' : 'fields'].map((item, index) => {
          const isDisabled = item.processVariableType === 3 || !isFirstNode;

          return (
            <div key={index} className="flexRow mTop4 relative">
              <Dropdown
                className="w120 mTop8"
                menuStyle={{ width: '100%' }}
                data={FIELD_TYPE_LIST.filter(o => _.includes([2, 6, 16, 26, 27, 48], o.value))}
                value={item.type}
                disabled={isDisabled || !validate(item.controlId)}
                border
                onChange={value => updateItem(item.controlId, 'type', value)}
              />
              <input
                type="text"
                className="mLeft10 fieldName flex mTop8 minWidth0"
                disabled={isDisabled}
                value={item.controlName}
                onChange={e => updateItem(item.controlId, 'controlName', e.target.value)}
                onBlur={e => {
                  let value = e.target.value.trim();

                  if (value && !/^[a-zA-Z]{1}/.test(value)) {
                    value = 'loop' + value;
                  }

                  if (
                    value &&
                    data.controls.find(o => value && o.controlName === value && o.controlId !== item.controlId)
                  ) {
                    value =
                      value +
                      Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, '0');
                  }

                  updateItem(item.controlId, 'controlName', value);
                }}
              />
              <input
                type="text"
                className="mLeft10 fieldName w160 mTop8"
                disabled={isDisabled}
                placeholder={_l('请输入说明')}
                value={item.desc}
                maxLength={64}
                onChange={e => updateItem(item.controlId, 'desc', e.target.value)}
                onBlur={e => updateItem(item.controlId, 'desc', e.target.value.trim())}
              />

              {!isFirstNode ? (
                <div className="mLeft10 w265">
                  <SingleControlValue
                    companyId={companyId}
                    processId={processId}
                    relationId={relationId}
                    selectNodeId={selectNodeId}
                    controls={data.controls}
                    formulaMap={data.formulaMap}
                    fields={data.fields}
                    updateSource={updateSource}
                    item={item}
                    i={index}
                    moreNodesMenuStyle={{ marginLeft: -83, width: 227 }}
                  />
                </div>
              ) : (
                <Fragment>
                  <input
                    type="text"
                    className="mLeft10 fieldName w265 mTop8"
                    disabled={item.type !== 6}
                    placeholder={item.type !== 6 ? '' : _l('请输入默认值')}
                    value={item.workflowDefaultValue}
                    onChange={e => updateItem(item.controlId, 'workflowDefaultValue', e.target.value)}
                    onBlur={e => updateItem(item.controlId, 'workflowDefaultValue', e.target.value.trim())}
                  />
                  <div className="mLeft10 w45 flexRow mTop8 Font16 alignItemsCenter">
                    <Icon
                      icon={item.attribute === 1 ? 'ic_title' : 'title'}
                      className={cx('Gray_75 ThemeHoverColor3 pointer', { ThemeColor3: item.attribute === 1 })}
                      onClick={() => {
                        updateSource({
                          controls: data.controls.map(o => {
                            o.attribute = o.controlId === item.controlId ? 1 : 0;
                            return o;
                          }),
                        });
                      }}
                    />
                    <Icon
                      icon="task-new-delete"
                      className={cx('mLeft10 Gray_75 fieldDelBtn', { 'disabled Alpha5': isDisabled })}
                      onClick={() => {
                        if (item.processVariableType !== 3) {
                          updateSource({ controls: data.controls.filter(o => o.controlId !== item.controlId) });
                        }
                      }}
                    />
                  </div>
                </Fragment>
              )}
            </div>
          );
        })}
      </List>

      {isFirstNode && (
        <div className="mTop10">
          <span
            className="ThemeHoverColor2 pointer ThemeColor3"
            onClick={() =>
              updateSource({
                controls: data.controls.concat({
                  controlId: uuidv4(),
                  controlName: '',
                  type: 2,
                  desc: '',
                  workflowDefaultValue: '',
                  attribute: 0,
                }),
              })
            }
          >
            + {_l('新参数')}
          </span>
        </div>
      )}
    </Fragment>
  );
};
