import React from 'react';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { VIEW_CONFIG_RECORD_CLICK_ACTION } from 'worksheet/constants/enum';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import CustomBtnCon from '../CustomBtnCon';

export function ToggleHeader({ open, title, count, onClick }) {
  return (
    <div className="headerCon mTop24 Hand" onClick={onClick}>
      <Icon icon={open ? 'arrow-down' : 'arrow-right-tip'} className="Font14 textTertiary" />
      <span className="Font15 Bold mLeft10">{title}</span>
      {count > 0 && <span className="num Bold Font15 textSecondary mLeft8">{count}</span>}
    </div>
  );
}

export function RecordClickAction({ open, show, clicktype, clickcid, worksheetControls, updateViewSet }) {
  if (!show || !open) {
    return null;
  }

  return (
    <React.Fragment>
      <Dropdown
        value={clicktype}
        className="w100 mTop24"
        onChange={clicktype => {
          updateViewSet({ clicktype });
        }}
        border
        isAppendToBody
        data={[
          { text: _l('打开记录详情'), value: VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD },
          { text: _l('打开链接'), value: VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_LINK },
          { text: _l('无'), value: VIEW_CONFIG_RECORD_CLICK_ACTION.NONE },
        ]}
      />
      {clicktype === '1' && (
        <React.Fragment>
          <p className="Bold textSecondary Font13 mTop25 mBottom0">{_l('链接字段')}</p>
          <Dropdown
            placeholder={_l('选择记录中的文本字段')}
            value={clickcid}
            className="mTop10 w100"
            onChange={clickcid => {
              updateViewSet({ clickcid });
            }}
            border
            isAppendToBody
            data={(worksheetControls || [])
              .filter(o => [1, 2].includes(o.type) && !ALL_SYS.includes(o.controlId))
              .map(o => ({ value: o.controlId, text: o.controlName }))}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export function CustomActionPanel({
  title,
  inlineHeader = false,
  showHideUnavailable = false,
  hideUnavailable,
  onToggleHideUnavailable,
  customBtnProps,
}) {
  return (
    <div className="customBtnBox">
      {inlineHeader ? (
        <div className="flexRow mTop25 alignItemsCenter">
          <p className="Bold textSecondary Font13 mAll0 flex">{title}</p>
          {showHideUnavailable && (
            <Checkbox
              className="hideBtn"
              text={_l('隐藏不可用的动作')}
              checked={hideUnavailable}
              onClick={onToggleHideUnavailable}
            />
          )}
        </div>
      ) : (
        <p className="Bold textSecondary Font13 mTop25 mBottom0">{title}</p>
      )}
      <CustomBtnCon {...customBtnProps} />
    </div>
  );
}
