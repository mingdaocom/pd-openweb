import React from 'react';
import { arrayOf, shape, string, func, bool, number } from 'prop-types';
import styled from 'styled-components';
import { Dropdown, VCenterIconText } from 'ming-ui';
import cx from 'classnames';
import AddCondition from './AddCondition';
import { getTypeKey } from '../util';
import { CONTROL_FILTER_WHITELIST, FILTER_RELATION_TYPE } from '../enum';
import { filterOnlyShowField, isOtherShowFeild } from 'src/pages/widgetConfig/util';
import Condition from './ConditionV2';
import _ from 'lodash';

const Con = styled.div`
  .conditionItem {
    width: calc(100% - 44px);
    font-size: 13px;
    .errorName {
      color: #f44336;
    }
    .conditionItemHeader {
      position: relative;
      margin-bottom: 2px;
      .deletedColumn {
        color: #f44336;
        margin-bottom: 6px;
        .icon {
          transform: rotate(90deg);
          font-size: 16px;
          margin-right: 3px;
        }
      }
      .controlIcon {
        font-size: 15px;
        color: #9e9e9e;
        margin-right: 6px;
      }
      .columnName {
        display: inline-block;
        font-weight: bold;
        max-width: calc(100% - 200px);
      }
      .relation {
        margin-left: 14px;
        .Dropdown--input {
          padding: 2px 6px !important;
          border-radius: 4px;
          .icon {
            margin-left: 4px !important;
            vertical-align: middle;
          }
          &:hover {
            background: #f2f2f2;
          }
        }
      }
      .deleteBtn {
        cursor: pointer;
        position: absolute;
        right: 0px;
        color: #9e9e9e;
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
        input {
          font-size: 13px;
        }
        .numberRange {
          input {
            width: 100%;
          }
        }
      }
      .deletedColumn {
        width: 100%;
        background: #ffebeb !important;
        border-color: #f44336 !important;
      }
    }
    &.readonly {
      .relation {
        &:hover {
          background-color: transparent;
        }
      }
      .conditionRelation {
        .Dropdown--input .icon {
          visibility: hidden;
        }
      }
    }

    &:not(.readonly):hover {
      .conditionItemHeader .deleteBtn {
        visibility: visible;
      }

      .relation .Dropdown--input .icon {
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
  padding: ${({ isSingleFilter }) => (isSingleFilter ? '0px' : '0 24px 0 18px')};
`;

const ConditionHeader = styled.div`
  color: #757575;
  width: 44px;
  .text {
    display: inline-block;
    margin: 2px 0 0 6px;
  }
  .Dropdown .Dropdown--input {
    padding: 2px 6px !important;
    border-radius: 4px;
    .icon {
      margin-left: 4px !important;
      vertical-align: middle;
    }
    &:hover {
      background: #f2f2f2;
    }
  }
`;

const AddButton = styled(VCenterIconText)`
  cursor: pointer;
  color: #757575;
  font-weight: bold;
`;

export default function ConditionsGroup(props) {
  const {
    from,
    isSingleFilter,
    appId,
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
  } = props;
  return (
    <Con className={cx({ isSingleFilter })}>
      {conditions.map((condition, i) => {
        const control = _.find(controls, column => condition.controlId === column.controlId);
        const conditionGroupKey = getTypeKey((control || {}).type);
        const conditionGroupType = control ? CONTROL_FILTER_WHITELIST[conditionGroupKey].value : '';
        const isSheetFieldError = isOtherShowFeild(control);
        return (
          <ConditionCon key={condition.id} isSingleFilter={isSingleFilter}>
            <ConditionHeader>
              {i === 0 && <span className="text">{_l('当')}</span>}
              {i === 1 && (
                <Dropdown
                  dropIcon="task_custom_btn_unfold"
                  disabled={!canEdit}
                  defaultValue={conditionSpliceType}
                  isAppendToBody
                  menuStyle={{ width: 'auto' }}
                  data={[
                    { text: _l('且%25000'), value: FILTER_RELATION_TYPE.AND },
                    { text: _l('或'), value: FILTER_RELATION_TYPE.OR },
                  ]}
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
              key={condition.keyStr}
              showCustom={showCustom}
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
        <ConditionCon isSingleFilter={isSingleFilter}>
          <ConditionHeader />
          <div className="flex">
            <AddCondition columns={filterAddConditionControls(controls)} onAdd={onAdd}>
              <AddButton
                className="mRight30 ThemeHoverColor3"
                icon="add"
                textLeft={4}
                iconSize={18}
                text={_l('条件')}
                textSize={13}
              />
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
