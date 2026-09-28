import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { getTitleTextFromRelateControl } from 'src/utils/domain/control/display';

const MobileTextWrap = styled.div`
  display: flex;
  flex-direction: column;

  .customFormControlCapsuleBox {
    background: var(--color-background-secondary) !important;
  }
`;

export default function Texts(props) {
  const { control, entityName, allowOpenRecord, allowNewRecord, records = [], onAdd, onOpen, disabled } = props;

  return (
    <MobileTextWrap>
      {!disabled && allowNewRecord && (
        <div className="customFormControlBox customFormButton mBottom12" onClick={onAdd}>
          <i className="icon icon-plus Font16 mRight6" />
          <span>{entityName || _l('记录')}</span>
        </div>
      )}
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
    </MobileTextWrap>
  );
}
