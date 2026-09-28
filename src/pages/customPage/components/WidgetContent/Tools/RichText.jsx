import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import { Popover, Segmented, Tooltip } from 'ming-ui/antd-components';
import { TabsSettingPopover } from './styled.js';

let isEdit = false;

export default props => {
  const { toolItem, highlight, widget } = props;
  const { icon, type } = toolItem;
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
        <Tooltip title={_l('编辑')} placement="bottom">
          <div
            className={cx('toolItem edit', { highlight })}
            key="edit"
            onClick={() => {
              props.handleToolClick(type, { editRichText: true });
            }}
          >
            <i className={`icon-edit Font18`}></i>
          </div>
        </Tooltip>
      )}
      <Popover
        placement="bottomLeft"
        classNames={{ root: 'tabsSettingPopover' }}
        arrow={{ pointAtCenter: true }}
        mouseLeaveDelay={0.3}
        styles={{
          body: {
            padding: 24,
          },
        }}
        open={popoverVisible}
        onOpenChange={visible => {
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
              <Segmented
                block
                className="flex"
                options={[
                  { label: _l('透明'), value: 1 },
                  { label: _l('卡片'), value: 2 },
                ]}
                value={showType}
                onChange={value => handleChangeConfig({ showType: value })}
              />
            </div>
          </TabsSettingPopover>
        }
        getPopupContainer={() => document.body}
      >
        <div className={cx('toolItem', type, { highlight })} key={type}>
          <i className={`icon-${icon} Font18`}></i>
        </div>
      </Popover>
    </Fragment>
  );
};
