import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, PopupWrapper, SvgIcon } from 'ming-ui';
import { segmentsFromView } from 'worksheet/common/ViewConfig/components/customBtn/groupedLayout/layoutUtils';
import { getTranslateInfo } from 'src/utils/app';
import { getButtonColor } from 'src/utils/control';

const BtnCon = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: left;
  border-radius: 18px;
  padding: 0 10px;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  .opcIcon {
    color: rgba(117, 117, 117, 0.5) !important;
  }
  &.disabled {
    background-color: var(--color-background-secondary) !important;
    color: var(--color-text-secondary) !important;
    border: 1px solid var(--color-border-secondary) !important;
  }
  .groupBtnName {
    flex: 1;
    min-width: 0;
  }
  .groupBtnArrow {
    flex-shrink: 0;
    margin-left: 4px;
  }
`;

const PopupBtnCon = styled.div`
  display: flex;
  align-items: center;
  height: 50px;
  ${props => props.disabled && 'opacity: 0.5;'}
  .icon {
    font-size: 20px;
  }
  .operateButtonText {
    flex: 1;
    min-width: 0;
    margin-left: 25px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const GroupPopupContent = styled.div`
  padding: 0 18px 12px;
  .emptyGroupTip {
    height: 50px;
    line-height: 50px;
    color: var(--color-text-tertiary);
    font-size: 14px;
  }
`;

export default class CustomButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeGroup: null,
    };
  }

  buildButtons = customBtns => {
    const { view = {}, worksheetInfo = {}, enableGroup = true, isBatch } = this.props;
    const advancedSetting = _.get(view, 'advancedSetting') || _.get(worksheetInfo, 'advancedSetting') || {};
    const btnGroups = isBatch ? advancedSetting.listgroup : advancedSetting.detailgroup;
    const flatBtnOrder = isBatch ? advancedSetting.listbtns : advancedSetting.detailbtns;

    if (!enableGroup || !btnGroups) {
      return customBtns;
    }

    const btnById = _.keyBy(customBtns, 'btnId');

    return segmentsFromView(customBtns, flatBtnOrder, btnGroups).reduce((result, segment) => {
      if (segment.type === 'group') {
        const groupButtons = (segment.ids || [])
          .map(id => btnById[id])
          .filter(Boolean)
          .filter(this.filterButton);

        if (!groupButtons.length) {
          return result;
        }

        result.push({
          type: 'group_ref',
          btnId: `group:${isBatch ? 'list' : 'detail'}:${segment.id}`,
          id: segment.id,
          name: segment.name,
          icon: segment.icon,
          iconUrl: segment.iconUrl,
          iconColor: segment.iconColor,
          buttons: groupButtons,
        });
      } else {
        (segment.ids || []).forEach(id => {
          const button = btnById[id];

          if (button) {
            result.push(button);
          }
        });
      }

      return result;
    }, []);
  };

  filterButton = button => {
    const { isBatch, viewId } = this.props;

    if (button.type === 'group_ref') {
      return true;
    }

    return isBatch || !viewId ? !button.disabled : true;
  };

  getButtonName = button => {
    const { appId } = this.props;

    const translateInfo = getTranslateInfo(appId, null, button.btnId);

    return translateInfo.name || button.name;
  };

  renderGroupButton = button => {
    const { classNames, btnDisable = {} } = this.props;
    const disabled = btnDisable[button.btnId] || button.disabled;
    const iconColor = button.iconColor || '#757575';

    return (
      <BtnCon
        key={button.btnId}
        className={cx(`LineHeight36 ${classNames}`, { disabled })}
        style={{
          color: 'var(--color-text-primary)',
          background: 'var(--color-background-primary)',
          border: '1px solid var(--color-border-primary)',
        }}
        onClick={() => {
          if (disabled) return;
          this.setState({ activeGroup: button });
        }}
        data-action-btn
      >
        {!!button.iconUrl &&
        !!button.icon &&
        (String(button.icon).endsWith('_svg') || String(button.icon).startsWith('sys_')) ? (
          <SvgIcon
            className="InlineBlock icon mRight6"
            addClassName="TxtMiddle"
            url={button.iconUrl}
            fill={iconColor}
            size={18}
          />
        ) : (
          <Icon icon={button.icon || 'custom_actions'} className="mRight6 Font20" style={{ color: iconColor }} />
        )}
        <span className="groupBtnName breakAll overflow_ellipsis Font13">{button.name}</span>
        <Icon icon="arrow-right-tip" className="groupBtnArrow Font12 textTertiary" />
      </BtnCon>
    );
  };

  render() {
    const {
      classNames,
      customBtns = [],
      isSlice,
      handleClick = () => {},
      btnDisable = {},
      isBatch,
      isEditLock,
      isRecordLock,
      entityName = _l('记录'),
      viewId,
      isGroupPopup,
    } = this.props;
    const { activeGroup } = this.state;
    const groupedBtns = this.buildButtons(customBtns);
    const buttons = isSlice ? groupedBtns.slice(0, 2) : groupedBtns;

    const renderButton = btn => {
      if (btn.type === 'group_ref') {
        return this.renderGroupButton(btn);
      }

      if (isGroupPopup) {
        const disabled = btnDisable[btn.btnId] || btn.disabled;

        return (
          <PopupBtnCon
            key={btn.btnId}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              if (
                (isRecordLock && !_.includes(['copy', 'print', 'sysprint', 'share'], btn.type)) ||
                (isEditLock && btn.clickType === 3)
              ) {
                alert(isRecordLock ? _l('%0已锁定', entityName) : _l('不允许多人同时编辑，稍后重试'), 3);
                return;
              }

              handleClick(btn);
            }}
          >
            {!!btn.iconUrl && !!btn.icon && (btn.icon.endsWith('_svg') || btn.icon.startsWith('sys_')) ? (
              <SvgIcon
                className="InlineBlock icon"
                addClassName="TxtMiddle"
                url={btn.iconUrl}
                fill={disabled || !btn.color || btn.color === 'transparent' ? 'var(--color-text-disabled)' : btn.color}
                size={18}
              />
            ) : (
              <Icon
                icon={btn.icon || 'custom_actions'}
                style={{ color: btn.color === 'transparent' ? 'var(--color-text-primary)' : btn.color }}
                className={cx({ textDisabled: !btn.icon || disabled })}
              />
            )}
            <div className={cx('operateButtonText', { textDisabled: btn.disabled })}>{this.getButtonName(btn)}</div>
          </PopupBtnCon>
        );
      }

      return (
        <BtnCon
          key={btn.btnId}
          className={cx(`LineHeight36 ${classNames}`, { disabled: btnDisable[btn.btnId] || btn.disabled })}
          style={{ ...getButtonColor(btn.color) }}
          onClick={() => {
            if (btnDisable[btn.btnId] || btn.disabled) return;
            if (
              (isRecordLock && !_.includes(['copy', 'print', 'sysprint', 'share'], btn.type)) ||
              (isEditLock && btn.clickType === 3)
            ) {
              alert(isRecordLock ? _l('%0已锁定', entityName) : _l('不允许多人同时编辑，稍后重试'), 3);
              return;
            }

            handleClick(btn);
          }}
          data-action-btn
        >
          {!!btn.iconUrl && !!btn.icon && btn.icon.endsWith('_svg') ? (
            <SvgIcon
              className="InlineBlock icon mRight6"
              addClassName="TxtMiddle"
              url={btn.iconUrl}
              fill={
                btnDisable[btn.btnId] || btn.disabled
                  ? 'rgba(117, 117, 117, 0.5)'
                  : btn.color && btn.color !== 'transparent'
                    ? getButtonColor(btn.color).color
                    : 'var(--color-text-title)'
              }
              size={15}
            />
          ) : (
            <Icon
              icon={btn.icon || 'custom_actions'}
              className={cx('mRight6 Font20', {
                opcIcon: (!btn.icon && (!btn.color || btn.color === 'transparent')) || btn.disabled,
              })}
            />
          )}
          <span className={cx('breakAll overflow_ellipsis Font13', { textDisabled: btn.disabled })}>
            {this.getButtonName(btn)}
          </span>
        </BtnCon>
      );
    };

    return (
      <React.Fragment>
        {buttons.filter(this.filterButton).map(renderButton)}
        <PopupWrapper
          bodyClassName="autoHeightPopupBody"
          title={_.get(activeGroup, 'name')}
          visible={!!activeGroup}
          headerType="withIcon"
          headerTitleAlign="left"
          onClose={() => this.setState({ activeGroup: null })}
        >
          <GroupPopupContent>
            {_.get(activeGroup, 'buttons.length') ? (
              <CustomButtons
                customBtns={activeGroup.buttons}
                appId={this.props.appId}
                btnDisable={btnDisable}
                isBatch={isBatch}
                isEditLock={isEditLock}
                isRecordLock={isRecordLock}
                entityName={entityName}
                viewId={viewId}
                handleClick={btn => {
                  this.setState({ activeGroup: null }, () => handleClick(btn));
                }}
                enableGroup={false}
                isGroupPopup
              />
            ) : (
              <div className="emptyGroupTip">{_l('暂无自定义动作')}</div>
            )}
          </GroupPopupContent>
        </PopupWrapper>
      </React.Fragment>
    );
  }
}
