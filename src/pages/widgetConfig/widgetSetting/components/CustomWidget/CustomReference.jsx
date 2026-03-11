import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { ALL_SYS, SYSTEM_CONTROL, WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { isCustomWidget } from 'src/pages/widgetConfig/util';
import { getUnUniqName } from 'src/utils/common';
import AddFields from '../CustomEvent/CustomAction/AddFields';

const CustomReferenceWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  div:last-child {
    padding: 0;
    background: var(--color-background-primary);
  }
  .customItem {
    width: 100%;
    height: 36px;
    line-height: 36px;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    &:first-child {
      margin-bottom: 0px;
      .fieldName,
      .customField {
        border: none;
        padding: 0;
        background: var(--color-background-primary);
        color: var(--color-text-secondary);
      }
    }
    .fieldName,
    .customField {
      flex: 1;
      min-width: 0;
      background: var(--color-background-primary);
      border-radius: 4px;
      border: 1px solid var(--color-border-primary);
      padding: 0 12px;
      &.isDel {
        color: var(--color-error);
      }
    }
    .customField {
      background: var(--color-background-secondary);
      margin-right: 10px;
    }
    .fieldName {
      &:hover {
        border-color: var(--color-border-tertiary);
      }
      &:focus {
        border-color: var(--color-primary);
      }
    }
    .showValue,
    .deleteIcon {
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    .deleteIcon {
      margin-left: 16px;
      font-size: 20px;
      &:hover {
        color: var(--color-error);
      }
    }
    .showValue {
      font-size: 17px;
      margin: 0 -10px 0 16px;
    }
  }
`;

export default function CustomReference(props) {
  const {
    data = {},
    allControls = [],
    reference = [],
    envValueAvailable,
    handleChange,
    customButton,
    onEnvValueClick = _.noop,
    onAddReference = _.noop,
  } = props;
  const showEnvIcon = typeof envValueAvailable !== 'undefined';
  const [errors, setErrors] = useState([]);

  const referenceControls = _.uniqBy([...allControls, ...SYSTEM_CONTROL, ...WORKFLOW_SYSTEM_CONTROL], 'controlId');
  const selectControls = referenceControls.filter(i => {
    return !_.find(reference, a => a.cid === i.controlId) && i.controlId !== data.controlId;
  });

  return (
    <CustomReferenceWrap className={props.className}>
      <div className="customItem pRight36">
        <div className="customField">{_l('字段')}</div>
        <div className="fieldName">{_l('变量名 (env.*)')}</div>
      </div>
      {reference.map((item, index) => {
        const control = _.find(referenceControls, a => a.controlId === item.cid);
        return (
          <div className="customItem" key={`${data.controlId}-${index}`}>
            <div className={cx('customField overflow_ellipsis', { isDel: !control })}>
              {_.get(control, 'controlName') || _l('已删除')}
            </div>
            <input
              className={cx('fieldName', { error: _.includes(errors, [item.cid]) })}
              value={item.name}
              onChange={e => {
                handleChange(reference.map((i, idx) => (idx === index ? { ...i, name: e.target.value } : i)));
                setErrors(errors.filter(i => i !== item.cid));
              }}
              onBlur={e => {
                if (!e.target.value) {
                  setErrors(errors.concat(item.cid));
                }
              }}
            />
            {showEnvIcon && (
              <Icon
                icon="database"
                className="showValue"
                style={{
                  color: envValueAvailable ? 'var(--color-text-secondary)' : 'var(--color-text-placeholder)',
                  cursor: envValueAvailable ? 'pointer' : 'default',
                }}
                onClick={envValueAvailable ? () => onEnvValueClick(item.cid) : _.noop}
              />
            )}

            <Icon
              icon="hr_delete"
              className="deleteIcon"
              onClick={() => handleChange(reference.filter((i, idx) => idx !== index))}
            />
          </div>
        );
      })}
      <div className="flexRow">
        <AddFields
          showSys={true}
          handleClick={value => {
            const totalReference = allControls.reduce((total = [], cur) => {
              if (isCustomWidget(cur)) {
                return total.concat(JSON.parse(_.get(cur, 'advancedSetting.reference') || '[]'));
              }
            }, []);
            const alias = _.includes(ALL_SYS, value.controlId)
              ? getUnUniqName(totalReference, value.controlId, 'name')
              : value.alias;

            handleChange(reference.concat([{ cid: value.controlId, name: alias }]));
            onAddReference();
          }}
          selectControls={selectControls}
          disabled={!selectControls.length}
        />
        {customButton}
      </div>
    </CustomReferenceWrap>
  );
}
