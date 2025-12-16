import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui/antd-components';
import { getTitleTextFromRelateControl } from '../../../core/utils';

const MobileTextWrap = styled.div`
  display: flex;

  .customFormControlCapsuleBox {
    background: var(--color-background-secondary) !important;
  }

  .mobileRecordTextAdd {
    width: 40px;
    height: 40px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    color: var(--color-text-secondary);
    text-align: center;
    line-height: 38px;
    margin-left: 6px;
  }
`;

export default function Texts(props) {
  const { control, entityName, allowOpenRecord, allowNewRecord, records = [], onAdd, onOpen, disabled } = props;

  return (
    <MobileTextWrap>
      {!_.isEmpty(records) && (
        <div
          className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
            controlDisabled: disabled,
          })}
        >
          {records.map((record, i) => {
            return (
              <span
                key={i}
                className={cx('customFormCapsule', { capsuleLink: allowOpenRecord })}
                onClick={() => {
                  if (!allowOpenRecord) {
                    return;
                  }
                  onOpen(record.rowid);
                }}
              >
                {getTitleTextFromRelateControl(control, record)}
              </span>
            );
          })}
        </div>
      )}
      {!disabled && allowNewRecord && (
        <Tooltip title={entityName ? _l('新建') + entityName : undefined}>
          <div className="mobileRecordTextAdd" onClick={onAdd}>
            <i className="icon icon-add"></i>
          </div>
        </Tooltip>
      )}
    </MobileTextWrap>
  );
}
