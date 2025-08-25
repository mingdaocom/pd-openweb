import React from 'react';
import { useState } from 'react';
import { Menu } from 'antd';
import cx from 'classnames';
import _, { isUndefined } from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { COVER_DISPLAY_FILL } from 'src/pages/worksheet/common/ViewConfig/config.js';

const WrapMenu = styled(Menu)`
  .splitLine {
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
    border-top: 1px solid #ccc;
  }
`;

const CoverFillTypeDisplayMenu = props => {
  const { onClick, coverFillType, ...rest } = props;
  return (
    <Menu className="viewTypeMenuWrap" {...rest}>
      {COVER_DISPLAY_FILL.map(({ text, value }) => (
        <Menu.Item
          data-event={value}
          key={value}
          className={cx('viewTypeItem', { current: coverFillType === value })}
          onClick={() => onClick(value)}
        >
          <div className="valignWrapper flex">
            <span className="Gray">{text}</span>
          </div>
          {coverFillType === value && <Icon icon="done" className="mRight12" />}
        </Menu.Item>
      ))}
    </Menu>
  );
};

export default function (props) {
  const { data, control, info, changeValue, menuStyle } = props;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPanelVisible, setDropdownPanelVisible] = useState(false);
  const type = control.type === 30 ? control.sourceControlType : control.type;
  const showtype = isUndefined(info.showtype)
    ? type === 14
      ? 6
      : _.get(control, 'advancedSetting.showtype') === '2'
        ? 2
        : 0
    : info.showtype;

  const renderDropdownOverlay = () => {
    return (
      <WrapMenu className="viewTypeMenuWrap" style={{ borderRadius: 4, ...menuStyle }}>
        {data.map(o => {
          const { value } = o;
          return (
            <Menu.Item
              data-event={value}
              key={value}
              className={cx('viewTypeItem', { current: showtype === value })}
              onClick={() => {
                changeValue({
                  ...info,
                  cid: control.controlId,
                  showtype: value,
                });
                setDropdownVisible(false);
              }}
            >
              <span className="Gray">{o.text}</span>
              {showtype === value && <Icon icon="done" className="mRight12" />}
            </Menu.Item>
          );
        })}
        {type === 14 && showtype !== 6 && (
          <React.Fragment>
            <hr className="splitLine" />
            <Trigger
              popupVisible={dropdownPanelVisible}
              onPopupVisibleChange={dropdownPanelVisible => {
                setDropdownPanelVisible(dropdownPanelVisible);
              }}
              popupClassName="DropdownPanelTrigger"
              action={['hover']}
              popupPlacement="bottom"
              popupAlign={{
                points: ['tl', 'tr'],
                offset: [1, -6],
                overflow: { adjustX: true, adjustY: true },
              }}
              popup={
                <CoverFillTypeDisplayMenu
                  style={{
                    borderRadius: '3px',
                  }}
                  coverFillType={info.coverFillType}
                  onClick={value => {
                    changeValue({
                      ...info,
                      cid: control.controlId,
                      coverFillType: value,
                    });
                    setDropdownVisible(false);
                    setDropdownPanelVisible(false);
                  }}
                />
              }
            >
              <Menu.Item className="changeCoverFillType viewTypeItem flexRow" data-event={'value'} key={'value'}>
                <span className="Gray flex">{_l('图片填充方式')}</span>
                <Icon icon="navigate_next" className="mRight12 Font18 Gray_9e" />
              </Menu.Item>
            </Trigger>
          </React.Fragment>
        )}
      </WrapMenu>
    );
  };
  return (
    <Trigger
      action={['click']}
      popup={renderDropdownOverlay}
      popupClassName={cx('dropdownTrigger')}
      popupVisible={dropdownVisible}
      onPopupVisibleChange={dropdownVisible => {
        setDropdownVisible(dropdownVisible);
      }}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 1],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <div className="ming Dropdown pointer flex w100 ">
        <div className={cx('Dropdown--input Dropdown--border')}>
          <div className="w100 flexRow alignItemsCenter">
            <span className="ellipsis flex">{data.find(o => o.value === showtype).text}</span>
            <Icon icon={'arrow-down-border'} className="mLeft8 Gray_9e" />
          </div>
        </div>
      </div>
    </Trigger>
  );
}
