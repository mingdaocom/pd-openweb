import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Dialog, UpgradeIcon, VCenterIconText } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { FlexCenter, VerticalMiddle } from 'worksheet/components/Basics';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { saveWorksheetFilter } from '../../SaveWorksheetFilter';
import { FILTER_TYPE } from '../enum';
import { formatForSave } from '../model';
import AddCondition from './AddCondition';
import ConditionsGroup from './ConditionsGroup';
import FilterDetailName from './FilterDetailName';
import SaveButton from './SaveButton';
import SplitDropdown from './SplitDropdown';

const Con = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .readOnlyFilters {
    cursor: default;
    border: none;
    &:hover {
      background: inherit;
    }
    .editFilter {
      display: none;
    }
  }
  &.isSingleFilter {
    overflow: visible;
  }
  .addGroupTip {
    color: #9e9e9e;
    &:hover {
      color: #757575;
    }
  }
`;
const Header = styled(FlexCenter)`
  position: relative;
  height: 32px;
`;
const BackBtn = styled(FlexCenter)`
  cursor: pointer;
  position: absolute;
  left: 10px;
  top: 0;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: #757575;
`;
const Content = styled.div`
  &:not(.isSingleFilter) {
    max-height: 420px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  &:not(.canEdit) {
    padding: 0px 6px;
  }
`;

const Footer = styled(VerticalMiddle)`
  margin-bottom: 24px;
  font-size: 0px;
  margin-top: 19px;
  padding: ${({ isSingleFilter }) => (isSingleFilter ? '0px 4px' : '0 24px')};
`;

const AddButton = styled(VCenterIconText)`
  cursor: pointer;
  color: #757575;
  font-weight: bold;
  &:hover {
    color: #1677ff;
  }
`;

export default function FilterDetail(props) {
  const {
    maxHeight,
    supportGroup,
    isSingleFilter,
    from,
    actions,
    base = {},
    filter = {},
    controls,
    nameIsUpdated,
    conditionProps,
    onBack,
    hideSave = false,
    filterAddConditionControls = () => {},
    setActiveTab = () => {},
    onAddCondition = () => {},
    handleTriggerFilter = () => {},
    filterResigned = true,
    filterError = [],
    isRules,
    showCustom,
  } = props;
  const formattedCondition = formatForSave(filter);
  const canSave = !!_.sum(formattedCondition.map(c => (c.isGroup ? _.get(c, 'groupFilters.length') : 1)));
  const needSave = props.needSave || nameIsUpdated;
  const isNew = filter.id.startsWith('new');
  const saveButtonDisabled = !(isNew || needSave) || !canSave;
  const { conditionsGroups = [] } = filter;
  const scrollRef = useRef();
  const [foldedMap, setFoldedMap] = useState({});
  const { projectId, appId, worksheetId, isCharge } = base;
  const featureType = supportGroup ? getFeatureStatus(projectId, VersionProductType.filterGroup) : '';
  let canEdit = props.canEdit;
  if (_.isUndefined(canEdit)) {
    canEdit = filter.type === FILTER_TYPE.PUBLIC ? isCharge : filter.createAccountId === md.global.Account.accountId;
  }
  function handleSave({ saveAsNew = false } = {}) {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (isNew || saveAsNew) {
      saveWorksheetFilter({
        title: saveAsNew ? _l('另存为筛选器') : _l('保存筛选器'),
        filterName: filter.name,
        filterType: filter.type,
        isCharge,
        onSave: ({ filterName, filterType }) => {
          actions.saveFilter(
            {
              appId,
              worksheetId,
              filter: { ...filter, name: filterName, type: filterType, id: saveAsNew ? undefined : filter.id },
            },
            newFilter => {
              setActiveTab(2);
              handleTriggerFilter(newFilter);
            },
          );
        },
      });
    } else {
      actions.saveFilter(
        {
          appId,
          worksheetId,
          filter: { ...filter },
        },
        newFilter => {
          handleTriggerFilter(newFilter);
        },
      );
    }
  }
  function scrollToEnd() {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.scrollTop = 9999;
      }, 10);
    }
  }
  function handleBack() {
    if (needSave) {
      Dialog.confirm({
        title: _l('存在未保存的变更，是否需要保存？'),
        okDisabled: saveButtonDisabled,
        onOk: handleSave,
        onCancel: () => onBack(true),
        okText: _l('保存'),
        cancelText: _l('不保存'),
      });
    } else {
      onBack();
    }
  }
  return (
    <Con className={cx({ isSingleFilter, canEdit })}>
      {!isSingleFilter && !isNew && (
        <Header>
          <BackBtn onClick={handleBack}>
            <i className="icon icon-backspace"></i>
          </BackBtn>
          <FilterDetailName
            editable={canEdit}
            name={filter.name}
            withStar={needSave && !nameIsUpdated}
            onChange={value => {
              if (value.trim() === '') {
                alert(_l('名称不能为空'), 3);
                return;
              }
              if (filter.name !== value.trim()) {
                actions.changeEditingFilter({ name: value.trim() });
                return true;
              }
            }}
          />
        </Header>
      )}
      <Content
        className={cx({ isSingleFilter, canEdit })}
        ref={scrollRef}
        style={maxHeight ? { maxHeight: maxHeight - 120 } : {}}
      >
        {!canEdit && (
          <FilterItemTexts className="readOnlyFilters" filters={conditionsGroups} controls={controls} loading={false} />
        )}
        {canEdit &&
          conditionsGroups.map((conditionsGroup, groupIndex) => (
            <Fragment>
              <ConditionsGroup
                from={from}
                isRules={isRules}
                isSingleFilter={isSingleFilter}
                canEdit={isNew ? true : canEdit}
                appId={appId}
                worksheetId={worksheetId}
                showCustom={showCustom}
                projectId={projectId}
                isGroup={filter.isGroup}
                filterError={filterError[groupIndex] || []}
                filterResigned={filterResigned}
                filterAddConditionControls={filterAddConditionControls}
                conditionSpliceType={conditionsGroup.conditionSpliceType}
                conditions={conditionsGroup.conditions.map((c, i) => ({
                  ...c,
                  folded: foldedMap[`${c.controlId}-${groupIndex + '' + i}`],
                }))}
                controls={controls}
                conditionProps={conditionProps}
                conditionsGroupsLength={conditionsGroups.length}
                onAdd={control => {
                  actions.addCondition(control, groupIndex, from);
                }}
                onChange={(value = {}, conditionIndex) => {
                  actions.updateCondition(value, groupIndex, conditionIndex);
                  const condition = conditionsGroup.conditions[conditionIndex];
                  if (condition && !_.isUndefined(value.folded)) {
                    setFoldedMap({
                      ...foldedMap,
                      [`${condition.controlId}-${groupIndex + '' + conditionIndex}`]: value.folded,
                    });
                  }
                }}
                onDelete={deleteIndex => {
                  if (conditionsGroup.conditions.length === 1 && conditionsGroups.length !== 1) {
                    actions.deleteConditionsGroup(groupIndex);
                  } else {
                    actions.deleteCondition(deleteIndex, groupIndex);
                  }
                }}
                onUpdateGroup={value => actions.updateConditionsGroup(value, groupIndex)}
              />
              {groupIndex !== conditionsGroups.length - 1 && (
                <SplitDropdown
                  canEdit={canEdit && groupIndex === 0}
                  type={conditionsGroup.spliceType}
                  onChange={value => actions.updateConditionsGroup({ spliceType: value }, '*')}
                  onDelete={() => actions.deleteGroup(groupIndex + 1)}
                />
              )}
            </Fragment>
          ))}
      </Content>
      {canEdit && (
        <Footer className="flexRow" isSingleFilter={isSingleFilter}>
          {(!filter.isGroup || (filter.isGroup && conditionsGroups.length === 1)) && (
            <AddCondition
              columns={filterAddConditionControls(controls)}
              from={from}
              widgetControlData={_.get(conditionProps, 'widgetControlData')}
              onAdd={control => {
                if (filter.isGroup) {
                  actions.addCondition(control, undefined, from);
                } else {
                  actions.addCondition(control, 0, from);
                }
                onAddCondition();
                scrollToEnd();
              }}
            >
              <AddButton
                className="mRight30"
                icon="add"
                textLeft={4}
                iconSize={18}
                text={_l('添加筛选条件')}
                textSize={13}
              />
            </AddCondition>
          )}
          {supportGroup && featureType && (
            <Tooltip placement="bottom" title={featureType === '2' ? _l('条件组为专业版功能') : ''}>
              <AddButton
                icon="add"
                textLeft={4}
                iconSize={18}
                text={_l('条件组')}
                afterElement={featureType === '2' && <UpgradeIcon />}
                textSize={13}
                onClick={() => {
                  if (featureType === '2') {
                    if (window.isPublicApp) {
                      alert(_l('预览模式下，不能操作'), 3);
                      return;
                    }
                    buriedUpgradeVersionDialog(projectId, VersionProductType.filterGroup);
                  } else {
                    const spliceType = _.get(conditionsGroups, '0.spliceType');
                    actions.addGroup(spliceType);
                    onAddCondition();
                    scrollToEnd();
                  }
                }}
              />
            </Tooltip>
          )}
          {supportGroup && (
            <Tooltip title={_l('添加条件组，结合 且/或 条件进行筛选')}>
              <i className="addGroupTip icon icon-help Font16 mLeft6"></i>
            </Tooltip>
          )}
          <div className="flex"></div>
          {!isSingleFilter && !hideSave && (
            <SaveButton
              disabled={saveButtonDisabled}
              onClick={handleSave}
              downList={
                isNew || saveButtonDisabled
                  ? []
                  : [
                      { name: _l('保存'), disabled: !needSave, onClick: handleSave },
                      { name: _l('保存为'), disabled: !needSave, onClick: () => handleSave({ saveAsNew: true }) },
                    ]
              }
            />
          )}
        </Footer>
      )}
    </Con>
  );
}

FilterDetail.propTypes = {
  supportGroup: bool,
  from: string,
  isSingleFilter: bool,
  canEdit: bool,
  needSave: bool,
  base: shape({}),
  filter: shape({}),
  actions: arrayOf(shape({})),
  controls: arrayOf(shape({})),
  conditionProps: shape({}),
  onBack: func,
  setActiveTab: func,
};
