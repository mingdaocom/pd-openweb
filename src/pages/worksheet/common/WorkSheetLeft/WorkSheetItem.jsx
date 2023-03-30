import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, MdLink, Tooltip } from 'ming-ui';
import tinycolor from '@ctrl/tinycolor';
import MoreOperation from './MoreOperation';
import SvgIcon from 'src/components/SvgIcon';
import Drag from './Drag';
import styled from 'styled-components';
import _ from 'lodash';

const Wrap = styled.div`
  &.active .name::before {
    background-color: ${props => props.iconColor} !important;
 }
`;

export function convertColor(colorStr) {
  return colorStr ? tinycolor(colorStr).setAlpha(0.1) : '#bbdefb';
}

export default class WorkSheetItem extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  svgColor(isActive) {
    const { iconColor, currentPcNaviStyle, themeType } = this.props.appPkg;
    const darkColor = currentPcNaviStyle === 1 && !['light'].includes(themeType);
    if (darkColor) {
      return `rgba(255, 255, 255, ${isActive ? 1 : 0.9})`;
    } else if (currentPcNaviStyle === 1) {
      return isActive || ['light'].includes(themeType) ? iconColor : '#757575';
    } else {
      return isActive ? iconColor : '#757575';
    }
  }
  textColor(isActive) {
    const { iconColor, currentPcNaviStyle, themeType } = this.props.appPkg;
    const darkColor = currentPcNaviStyle === 1 && !['light'].includes(themeType);
    return darkColor ? `rgba(255, 255, 255, ${isActive ? 1 : 0.9})` : (isActive ? iconColor : undefined);
  }
  bgColor() {
    const { iconColor, currentPcNaviStyle, themeType } = this.props.appPkg;
    if (currentPcNaviStyle === 1 && !['light'].includes(themeType)) {
      return themeType === 'theme' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    } else {
      return convertColor(iconColor);
    }
  }
  getNavigateUrl(isActive) {
    const { appId, groupId, activeSheetId, appItem } = this.props;
    const { workSheetId } = appItem;
    const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
    const viewId =
      (_.find(storage.worksheets || [], item => item.groupId === groupId && item.worksheetId === workSheetId) || {})
        .viewId || '';
    let url = `/app/${appId}/${groupId}/${workSheetId}${viewId ? `/${viewId}` : ''}`;
    if (isActive) {
      url += `?flag=${new Date().getTime()}`;
    }
    return url;
  }
  render() {
    const { appId, groupId, appItem, activeSheetId, className, isCharge, appPkg, sheetListVisible, disableTooltip } = this.props;
    const { workSheetId, workSheetName, icon, iconUrl, status, parentStatus, type } = appItem;
    const isActive = activeSheetId === workSheetId;
    const { iconColor, currentPcNaviStyle, themeType } = appPkg;
    return (
      <Drag appItem={appItem} appPkg={appPkg} isCharge={isCharge}>
        <Tooltip
          popupAlign={{ offset: [-10, 0] }}
          disable={_.isUndefined(disableTooltip) ? sheetListVisible : disableTooltip}
          popupPlacement="right"
          text={<span>{workSheetName}</span>}
        >
          <Wrap
            style={{
              backgroundColor: isActive && this.bgColor()
            }}
            iconColor={['black'].includes(appPkg.themeType) ? appPkg.iconColor : ''}
            className={cx('workSheetItem flexRow Relative', className, `workSheetItem-${workSheetId}`, { active: isActive })}
            data-id={workSheetId}
          >
            <MdLink className="NoUnderline valignWrapper h100 nameWrap" to={this.getNavigateUrl(isActive)}>
              <Fragment>
                <div className="iconWrap">
                  <SvgIcon url={iconUrl} fill={this.svgColor(isActive)} size={22} />
                </div>
                <span
                  className={cx('name ellipsis Font14 mLeft10 mRight10', { bold: isActive })}
                  title={workSheetName}
                  style={{ color: this.textColor(isActive) }}
                >
                  {workSheetName}
                </span>
                {(status === 2 || parentStatus === 2) && (
                  <Tooltip popupPlacement="bottom" text={<span>{_l('仅管理员可见')}</span>}>
                    <Icon className="Font16 mRight10" icon="visibility_off" style={{ color: currentPcNaviStyle === 1 && themeType === 'theme' ? '#FCD8D3' : '#ee6f09' }} />
                  </Tooltip>
                )}
              </Fragment>
            </MdLink>
            {isCharge && (
              <MoreOperation {...this.props}>
                <div className="rightArea moreBtn">
                  <Icon icon="more_horiz" className="Font18 moreIcon" />
                </div>
              </MoreOperation>
            )}
          </Wrap>
        </Tooltip>
      </Drag>
    );
  }
}
