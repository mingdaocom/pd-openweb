import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { Icon, ScrollView } from 'ming-ui';
import _ from 'lodash';
import { renderTabs } from 'src/components/newCustomFields/components/SectionTableNav.jsx';
import { browserIsMobile } from '../../../../../util';
import { FROM } from 'src/components/newCustomFields/tools/config.js';

const FormSectionWrap = styled.div`
  width: ${props => (props.isUnfold ? '220px' : '55px')};
  height: inherit;
  flex-shrink: 0;
  ${props => (props.isFixedRight ? 'border-left: 1px solid #d9d9d9;' : 'border-right: 1px solid #d9d9d9;')}
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  padding-bottom: 8px;
  .tabContainer {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .sectionTabItem {
    line-height: 50px;
    ${props => (props.isUnfold ? '' : 'flex-direction:column;min-height: 50px;justify-content: center;')}
    ${props => (props.isFixedRight ? 'flex-direction: row-reverse;' : '')}
    &.active {
      color: #2196f3;
      .icon {
        color: #2196f3 !important;
      }
    }
    &.active:before {
      ${props => (props.isFixedRight ? '' : 'margin-left: calc(100% - 3px);')}
      top: 20%;
      width: 3px;
      height: 60%;
      content: ' ';
      position: absolute;
      background-color: #2196f3;
    }
    & > span.ellipsis {
      display: ${props => (props.isUnfold ? 'inline-block' : 'none')};
    }
    & > span:first-child {
      margin-right: ${props => (props.isUnfold ? '' : '0px')};
    }
    & > div {
      ${props => (props.isUnfold ? '' : 'font-size: 12px;margin-left:0px;line-height: 13px;margin-top: 4px;')}
    }
  }
  .expandIcon {
    margin: 6px auto 6px ${props => (props.isUnfold ? '16px' : 'auto')};
    width: 28px;
    height: 28px;
    display: flex;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    &:hover {
      background: #f7f7f7;
    }
  }
`;

export const getDefaultIsUnfold = (value = true, widgetStyle = {}) => {
  let tempIsUnfold = value;
  const localValue = JSON.parse(localStorage.getItem('sheetSectionIsUnfold') || '{}');
  const showIcon = widgetStyle.showicon || '1';
  if (!_.isUndefined(_.get(localValue, [widgetStyle.tabposition]))) {
    tempIsUnfold = _.get(localValue, [widgetStyle.tabposition]);
  }
  if (showIcon !== '1') {
    tempIsUnfold = true;
  }
  return tempIsUnfold;
};

function FormSection(props, ref) {
  const { tabControls = [], widgetStyle = {}, onClick, onUpdateFormSectionWidth = () => {}, from } = props;
  const [activeControlId, setActiveId] = useState();
  const localValue = JSON.parse(localStorage.getItem('sheetSectionIsUnfold') || '{}');
  const showIcon = widgetStyle.showicon || '1';

  const activeControl = _.find(tabControls, i => i.controlId === activeControlId) || tabControls[0];

  const [isUnfold, setUnfold] = useState(getDefaultIsUnfold(undefined, widgetStyle));

  useEffect(() => {
    setActiveId(_.get(activeControl, 'controlId') || '');
    const localIsUnfold = getDefaultIsUnfold(isUnfold, widgetStyle);
    setUnfold(localIsUnfold);
    onUpdateFormSectionWidth(localIsUnfold ? 220 : 55);
  }, []);

  useImperativeHandle(ref, () => ({
    activeControlId,
    setActiveId,
  }));

  // 只有一个标签页时隐藏
  const hideTab =
    _.get(widgetStyle, 'hidetab') === '1' && tabControls.length === 1 && _.get(_.head(tabControls), 'type') === 52;

  if (!activeControl || hideTab || browserIsMobile()) return null;

  const tabProps = {
    controls: tabControls,
    activeControlId,
    widgetStyle,
    showTip: !isUnfold,
    onClick: controlId => {
      onClick(controlId);
      setActiveId(controlId);
    },
  };

  console.log(tabControls);

  return (
    <FormSectionWrap className="formSection" isFixedRight={widgetStyle.tabposition === '4'} isUnfold={isUnfold}>
      {showIcon === '1' && (
        <div className="expandIcon">
          <Tooltip title={isUnfold ? _l('收起') : _l('展开')} popupPlacement="right">
            <Icon
              icon={isUnfold ? (widgetStyle.tabposition === '4' ? 'menu_right' : 'menu_left') : 'menu'}
              className="Font20 Gray_9e pointer"
              onClick={() => {
                setUnfold(!isUnfold);
                safeLocalStorageSetItem(
                  'sheetSectionIsUnfold',
                  JSON.stringify({ ...localValue, [widgetStyle.tabposition]: !isUnfold }),
                );
                onUpdateFormSectionWidth(!isUnfold ? 220 : 55);
              }}
            />
          </Tooltip>
        </div>
      )}

      {_.includes([FROM.PUBLIC_ADD, FROM.NEWRECORD], from) ? (
        <div className="tabContainer">{renderTabs(tabProps)}</div>
      ) : (
        <ScrollView className="tabContainer">{renderTabs(tabProps)}</ScrollView>
      )}
    </FormSectionWrap>
  );
}

export default forwardRef(FormSection);
