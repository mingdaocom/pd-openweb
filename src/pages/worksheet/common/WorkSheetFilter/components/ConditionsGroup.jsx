import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { isOtherShowFeild } from 'src/utils/domain/control/filters';
import { getTypeKey } from 'src/utils/domain/worksheet/filterCondition';
import { CONTROL_FILTER_WHITELIST, FILTER_RELATION_TYPE } from 'src/utils/domain/worksheet/filterConstants';
import AddCondition from './AddCondition';
import Condition from './ConditionV2';

const Con = styled.div`
  .conditionItem {
    width: calc(100% - 44px);
    font-size: 13px;
    .errorName {
      color: var(--color-error);
    }
    .conditionItemHeader {
      position: relative;
      margin-bottom: 2px;
      .deletedColumn {
        color: var(--color-error);
        margin-bottom: 6px;
        .icon {
          transform: rotate(90deg);
          font-size: 16px;
          margin-right: 3px;
        }
      }
      .controlIcon {
        font-size: 15px;
        color: var(--color-text-tertiary);
        margin-right: 6px;
      }
      .columnName {
        display: inline-block;
        font-weight: bold;
        max-width: calc(100% - 200px);
      }
      .relation {
        margin-left: 14px;
      }
      .deleteBtn {
        cursor: pointer;
        position: absolute;
        right: 0px;
        color: var(--color-text-tertiary);
        margin-top: 5px;
        visibility: hidden;
        i {
          font-size: 16px;
        }
      }
      &.isbool {
        line-height: 24px;
      }
    }
    .conditionItemContent {
      position: relative;
      .conditionValue {
        flex: 1;
        min-width: 0;
        .numberRange {
          input {
            width: 100%;
          }
        }
      }
      .deletedColumn {
        width: 100%;
        background: var(--color-error-bg) !important;
        border-color: var(--color-error) !important;
      }
    }
    &:not(.readonly):hover {
      .conditionItemHeader .deleteBtn {
        visibility: visible;
      }
    }
    &:first-child {
      margin-top: 0px;
    }
  }
  &.isSingleFilter {
    .conditionItemHeader,
    .conditionItemContent {
      padding-right: 0px;
    }
  }
`;

const ConditionCon = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 12px;
  padding: ${({ $isSingleFilter }) => ($isSingleFilter ? '0px' : '0 24px 0 18px')};
`;

const ConditionHeader = styled.div`
  color: var(--color-text-secondary);
  width: 44px;
  .text {
    display: inline-block;
    margin: 2px 0 0 6px;
  }
  .conditionSpliceTypeSelect {
    width: 52px;
  }
`;

const AddButton = styled.div`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-weight: bold;
  .Icon {
    font-size: 18px;
    margin-right: 4px;
  }
  .text {
    font-size: 13px;
  }
`;

const RELATION_OPTIONS = [
  { label: _l('且%25000'), value: FILTER_RELATION_TYPE.AND },
  { label: _l('或'), value: FILTER_RELATION_TYPE.OR },
];

export default function ConditionsGroup(props) {
  const {
    from,
    isSingleFilter,
    appId,
    worksheetId,
    projectId,
    isGroup,
    conditionsGroupsLength,
    conditionSpliceType,
    conditions,
    controls,
    canEdit,
    conditionProps = {},
    onAdd,
    onChange,
    onDelete,
    onUpdateGroup,
    filterResigned = true,
    filterAddConditionControls = () => {},
    filterError = [],
    isRules,
    showCustom,
    widgetControlData,
  } = props;
  return (
    <Con className={cx({ isSingleFilter })}>
      {conditions.map((condition, i) => {
        let control = _.find(controls, column => condition.controlId === column.controlId);

        if (!_.isUndefined(control)) {
          control = { ...control };
        }

        const conditionGroupKey = getTypeKey((control || {}).type);
        const conditionGroupType = control ? CONTROL_FILTER_WHITELIST[conditionGroupKey].value : '';
        const isSheetFieldError = from !== 'rule' && isOtherShowFeild(control);
        return (
          <ConditionCon key={condition.id} $isSingleFilter={isSingleFilter}>
            <ConditionHeader>
              {i === 0 && <span className="text">{_l('当')}</span>}
              {i === 1 && (
                <Select
                  className="conditionSpliceTypeSelect"
                  disabled={!canEdit}
                  value={conditionSpliceType}
                  options={RELATION_OPTIONS}
                  popupMatchSelectWidth={false}
                  showSearch={false}
                  size="small"
                  variant="borderless"
                  suffixIcon={<Icon icon="task_custom_btn_unfold" className="Font14" />}
                  onChange={value => {
                    onUpdateGroup({ conditionSpliceType: value });
                  }}
                />
              )}
              {i > 1 && (
                <span className="text">
                  {
                    {
                      [FILTER_RELATION_TYPE.AND]: _l('且%25000'),
                      [FILTER_RELATION_TYPE.OR]: _l('或'),
                    }[conditionSpliceType]
                  }
                </span>
              )}
            </ConditionHeader>
            <Condition
              from={from}
              canEdit
              projectId={projectId}
              appId={appId}
              worksheetId={worksheetId}
              key={condition.keyStr}
              showCustom={showCustom}
              widgetControlData={widgetControlData}
              index={i}
              condition={condition}
              conditionGroupType={conditionGroupType}
              isSheetFieldError={isSheetFieldError}
              control={control}
              onDelete={() => onDelete(i)}
              onChange={value => onChange(value, i)}
              conditionError={filterError[i] || ''}
              filterResigned={filterResigned}
              isRules={isRules}
              {...conditionProps}
            />
          </ConditionCon>
        );
      })}
      {isGroup && conditionsGroupsLength !== 1 && (
        <ConditionCon $isSingleFilter={isSingleFilter}>
          <ConditionHeader />
          <div className="flex">
            <AddCondition
              columns={filterAddConditionControls(controls)}
              onAdd={onAdd}
              from={from}
              widgetControlData={_.get(conditionProps, 'widgetControlData')}
            >
              <AddButton className="mRight30 hoverColorPrimary">
                <Icon icon="add" />
                <span className="text">{_l('条件')}</span>
              </AddButton>
            </AddCondition>
          </div>
        </ConditionCon>
      )}
    </Con>
  );
}

ConditionsGroup.propTypes = {
  from: string,
  appId: string,
  isSingleFilter: bool,
  projectId: string,
  isGroup: bool,
  conditionSpliceType: number,
  conditions: arrayOf(shape({})),
  controls: arrayOf(shape({})),
  canEdit: bool,
  conditionProps: shape({}),
  onAdd: func,
  onChange: func,
  onDelete: func,
  onUpdateGroup: func,
};
