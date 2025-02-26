import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CustomFields from 'src/components/newCustomFields';
import { getDisabledTabs } from './controller';
import { includes } from 'lodash';
const TabContainer = styled.div`
  height: 36px;
  display: flex;
  flex-shrink: 0;
  padding: 2px;
  border-radius: 4px;
  background: #f5f5f5;
`;

const Tab = styled.div`
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: ${props => (props.active ? '#151515' : '#757575')};
  background: ${props => (props.active ? '#fff' : 'transparent')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

function Tabs({ disabledTabs, activeTab = 'modify', onTabChange }) {
  return (
    <TabContainer>
      <Tab
        disabled={disabledTabs.includes('modify')}
        active={activeTab === 'modify'}
        onClick={disabledTabs.includes('modify') ? undefined : () => onTabChange('modify')}
      >
        {_l('修改')}
      </Tab>
      <Tab
        disabled={disabledTabs.includes('clear')}
        active={activeTab === 'clear'}
        onClick={disabledTabs.includes('clear') ? undefined : () => onTabChange('clear')}
      >
        {_l('清空')}
      </Tab>
    </TabContainer>
  );
}

Tabs.propTypes = {
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  disabledTabs: PropTypes.arrayOf(PropTypes.string),
};

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
  color: #9e9e9e;
  &:hover {
    color: #f44336;
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
  color: #9e9e9e;
  height: 6px;
  width: 22px;
  background: #eaeaea;
  border-radius: 3px;
`;

export default function EditControlItem(props) {
  const { isCharge, appId, worksheetId, projectId, control, type, onChange, onDelete, setRef } = props;
  const disabledTabs = getDisabledTabs(control);
  return (
    <Con className="mTop10">
      <div className="Font13 Bold">{control.controlName}</div>
      <div className="mTop4 flexRow">
        <Tabs
          disabledTabs={disabledTabs}
          activeTab={type}
          onTabChange={newType => {
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
          <DeleteIcon className="delete icon icon-task-new-delete Font18 Hand" onClick={onDelete} />
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
