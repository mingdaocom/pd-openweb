import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { getTitleTextFromRelateControl } from '../../../core/utils';

const MobileTextWrap = styled.div`
  display: flex;

  .customFormControlCapsuleBox {
    background: var(--gray-f9) !important;
  }

  .mobileRecordTextAdd {
    width: 40px;
    height: 40px;
    background: var(--color-third);
    border: 1px solid var(--gray-e0);
    border-radius: 3px;
    color: var(--gray-75);
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
        <div
          className="mobileRecordTextAdd"
          data-tip={entityName ? _l('新建') + entityName : undefined}
          onClick={onAdd}
        >
          <i className="icon icon-add"></i>
        </div>
      )}
    </MobileTextWrap>
  );
}
