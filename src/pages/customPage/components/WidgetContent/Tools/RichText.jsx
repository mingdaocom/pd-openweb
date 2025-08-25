import React, { Fragment, useState } from 'react';
import { Popover, Tooltip } from 'antd';
import cx from 'classnames';
import { TabsSettingPopover } from './styled.js';

let isEdit = false;
export default props => {
  const { icon, type, highlight, widget } = props;
  const { componentConfig = {}, editRichText } = widget;
  const { showType = 2 } = componentConfig;
  const [popoverVisible, setPopoverVisible] = useState(false);
  const handleChangeConfig = data => {
    props.handleToolClick(type, {
      componentConfig: {
        ...componentConfig,
        ...data,
      },
    });
  };
  return (
    <Fragment>
      {!editRichText && (
        <Tooltip
          title={_l('编辑')}
          placement="bottom"
          onClick={() => {
            props.handleToolClick(type, { editRichText: true });
          }}
        >
          <li className={cx('edit', { highlight })} key="edit">
            <i className={`icon-edit Font18`}></i>
          </li>
        </Tooltip>
      )}
      <Popover
        zIndex={1000}
        placement="bottomLeft"
        overlayClassName="tabsSettingPopover"
        arrowPointAtCenter={true}
        mouseLeaveDelay={0.3}
        overlayInnerStyle={{
          padding: 24,
        }}
        visible={popoverVisible}
        onVisibleChange={visible => {
          if (isEdit) return;
          setPopoverVisible(visible);
        }}
        content={
          <TabsSettingPopover className="flexColumn disableDrag">
            {/*
            <div className="flexRow valignWrapper mBottom10">
              <div className="bold flex">{_l('名称')}</div>
              <Checkbox checked={showName} onChange={e => handleChangeConfig({ showName: e.target.checked })}>
                {_l('显示')}
              </Checkbox>
            </div>
            <Input
              value={name}
              onChange={e => handleChangeConfig({ name: e.target.value.trim().slice(0, 20) })}
              onFocus={() => {
                isEdit = true;
              }}
              onBlur={e => {
                isEdit = false;
                if (!e.target.value) {
                  handleChangeConfig({ name: _l('文本') });
                }
              }}
            />
            */}
            <div className="flexRow valignWrapper">
              <div className="bold mRight10">{_l('显示方式')}</div>
              <div className="typeSelect flex flexRow valignWrapper">
                <div
                  className={cx('centerAlign flex pointer Gray_75', { active: showType === 1 })}
                  onClick={() => handleChangeConfig({ showType: 1 })}
                >
                  {_l('透明')}
                </div>
                <div
                  className={cx('centerAlign flex pointer Gray_75', { active: showType === 2 })}
                  onClick={() => handleChangeConfig({ showType: 2 })}
                >
                  {_l('卡片')}
                </div>
              </div>
            </div>
          </TabsSettingPopover>
        }
        getPopupContainer={() => document.body}
      >
        <li className={cx(type, { highlight })} key={type}>
          <i className={`icon-${icon} Font18`}></i>
        </li>
      </Popover>
    </Fragment>
  );
};
