import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Segmented } from 'ming-ui/antd-components';
import CustomFields from 'src/components/Form';
import { getDisabledTabs } from './controller';

const Con = styled.div`
  .delete {
    visibility: hidden;
  }
  .contentCon {
    max-width: calc(100% - 138px);
  }
  &:hover {
    .delete {
      visibility: visible;
    }
  }
`;

const DeleteIcon = styled.i`
  margin-top: 9px;
  display: inline-block;
  color: var(--color-text-tertiary);
  &:hover {
    color: var(--color-error);
  }
`;

const WidgetCon = styled.div`
  .customFormItemLabel {
    display: none !important;
  }
  // .customFieldsContainer {
  //   margin: 0px !important;
  // }
  .customFormItem {
    padding-top: 0px !important;
    padding-bottom: 0px !important;
  }
`;

const EmptyTag = styled.div`
  margin-top: 15px;
  color: var(--color-text-tertiary);
  height: 6px;
  width: 22px;
  background: var(--color-border-secondary);
  border-radius: 3px;
`;

export default function EditControlItem(props) {
  const { isCharge, appId, worksheetId, projectId, control, type, onChange, onDelete, setRef } = props;
  const disabledTabs = getDisabledTabs(control);
  return (
    <Con className="mTop10">
      <div className="Font13 Bold">{control.controlName}</div>
      <div className="mTop4 flexRow">
        <Segmented
          value={type}
          options={[
            { label: _l('修改'), value: 'modify', disabled: disabledTabs.includes('modify') },
            { label: _l('清空'), value: 'clear', disabled: disabledTabs.includes('clear') },
          ]}
          styles={{
            root: { height: 40, flexShrink: 0 },
            label: { minHeight: 30 },
          }}
          onChange={newType => {
            if (newType === 'clear') {
              setRef(undefined);
            }

            onChange({ type: newType });
          }}
        />
        <div className="contentCon flex mLeft12">
          {type === 'modify' ? (
            <WidgetCon>
              <CustomFields
                from={3}
                hideControlName
                disableRules
                disabledTabs
                isCharge={isCharge}
                recordId="FAKE_RECORD_ID_FROM_BATCH_EDIT"
                showTitle={false}
                ref={ref => {
                  setRef(ref);
                }}
                data={[control].map(c => ({
                  ...c,
                  size: 12,
                  sectionId: undefined,
                  required: false,
                  controlId: control.controlId === 'ownerid' ? '_ownerid' : control.controlId,
                }))}
                projectId={projectId}
                appId={appId}
                worksheetId={worksheetId}
                onChange={data => {
                  if (data && data[0]) {
                    onChange({ type: 'modify', value: data[0].value });
                  }
                }}
              />
            </WidgetCon>
          ) : (
            <EmptyTag />
          )}
        </div>
        <div className="mLeft12">
          <DeleteIcon className="delete icon icon-trash Font18 Hand" onClick={onDelete} />
        </div>
      </div>
    </Con>
  );
}

EditControlItem.propTypes = {
  appId: PropTypes.string,
  worksheetId: PropTypes.string,
  projectId: PropTypes.string,
  control: PropTypes.shape({}),
  type: PropTypes.string,
  onChange: PropTypes.func,
};
