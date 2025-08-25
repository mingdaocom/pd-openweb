import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, Switch } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { ACTION_DISPLAY, deepSearch, RELATE_PERMISSION_DISPLAY, SUBLIST_PERMISSION_DISPLAY } from '../config';

const SectionConfirmWrap = styled.div`
  display: flex;
  flex-direction: column;
  .title {
    font-weight: 600;
    font-size: 14px;
    color: #151515;
    margin-bottom: 8px;
    &.labelBetween {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .optionContainer {
    .Checkbox {
      width: 50%;
      display: inline-block;
    }
  }
  .editContainer {
    max-height: 400px;
    overflow-x: hidden;
    .rowItem {
      display: flex;
      align-items: center;
      line-height: 40px;
      border-bottom: 1px solid #dddddd;
    }
  }
`;

function SettingDialog(props) {
  const { data, values, id, onChange, actionType } = props;
  const [visible, setVisible] = useState(true);
  const parentItem = deepSearch(data, id);
  const parentValue = _.find(values, v => v.controlId === id && _.isEmpty(v.childControlIds)) || {};
  const childValue = _.find(values, v => v.controlId === id && !_.isEmpty(v.childControlIds)) || {};
  const [parentConfig, setParentConfig] = useState(parentValue);
  const [childConfig, setChildConfig] = useState(childValue);
  const permission = parentConfig.permission || [];
  const childControlIds = childConfig.childControlIds || [];
  const actionItem = _.find(ACTION_DISPLAY, a => a.value === actionType);

  return (
    <Dialog
      visible={visible}
      width={640}
      overlayClosable={false}
      title={
        parentItem.type === 34
          ? _l('子表%0动作设置', _.get(actionItem, 'titleLabel'))
          : _l('关联记录%0动作设置', _.get(actionItem, 'titleLabel'))
      }
      okText={_l('确认')}
      onOk={() => {
        const newControls = values.filter(v => v.controlId !== parentItem.controlId);
        const index = _.findIndex(values, v => v.controlId === parentItem.controlId);
        const addControls = [].concat(parentConfig);
        if (!_.isEmpty(childConfig.childControlIds)) {
          addControls.push(childConfig);
        }
        newControls.splice(index + 1, 0, ...addControls);

        onChange('controls', newControls);
        setVisible(false);
      }}
      onCancel={() => setVisible(false)}
    >
      <SectionConfirmWrap>
        {actionType === 3 && (
          <div className="optionContainer">
            <div className="title labelBetween">
              {_l('操作设置')}
              <Switch
                checked={parentConfig.isCustom}
                onClick={checked => {
                  setParentConfig({ ...parentConfig, isCustom: !checked, ...(checked ? { permission: [] } : {}) });
                }}
              />
            </div>
            <div className="Gray_75 mBottom12">
              {_l('未开启时，按%0本身设置；开启后可配置细分操作', parentItem.type === 34 ? _l('子表') : _l('关联记录'))}
            </div>
            {parentConfig.isCustom && (
              <Fragment>
                {(parentItem.type === 34 ? SUBLIST_PERMISSION_DISPLAY : RELATE_PERMISSION_DISPLAY).map(i => {
                  return (
                    <Checkbox
                      className="mBottom8"
                      text={i.text}
                      checked={_.includes(permission, i.value)}
                      onClick={checked => {
                        setParentConfig({
                          ...parentConfig,
                          permission: checked ? permission.filter(p => p !== i.value) : permission.concat(i.value),
                        });
                      }}
                    />
                  );
                })}
              </Fragment>
            )}
          </div>
        )}
        <div className="editContainer">
          <div className="title">{_l('字段设置')}</div>
          <div className="Gray_75">{_l('未勾选时，按字段原属性；勾选后，字段%0', _.get(actionItem, 'label'))}</div>
          <div className="rowItem">
            <div className="rowTitle flex Bold">{_l('全选')}</div>
            <Checkbox
              className="flex"
              clearselected={
                !!childControlIds.length && childControlIds.length !== (parentItem.relationControls || []).length
              }
              checked={childControlIds.length === (parentItem.relationControls || []).length}
              onClick={checked => {
                setChildConfig(
                  checked
                    ? {}
                    : {
                        controlId: parentItem.controlId,
                        childControlIds: (parentItem.relationControls || []).map(i => i.controlId),
                      },
                );
              }}
            />
          </div>
          {(parentItem.relationControls || []).map(i => {
            return (
              <div className="rowItem">
                <div className="rowTitle flex">{i.controlName}</div>
                <Checkbox
                  className="flex"
                  checked={_.includes(childControlIds, i.controlId)}
                  onClick={checked => {
                    setChildConfig({
                      controlId: parentItem.controlId,
                      childControlIds: checked
                        ? childControlIds.filter(c => c !== i.controlId)
                        : childControlIds.concat(i.controlId),
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      </SectionConfirmWrap>
    </Dialog>
  );
}

export default function openSettingDialog(props) {
  return functionWrap(SettingDialog, props);
}
