import React, { useEffect, useState } from 'react';
import { Checkbox, Input, Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { TabsSettingPopover } from './styled.js';

const Content = props => {
  const { widget, updateWidget } = props;
  const { widgetType, getChartData, setChartData } = props;
  const { config = {} } = widget;
  const isView = ['view'].includes(widgetType);
  const showTitle = _.get(config, 'showTitle') ?? true;
  const name = _.get(config, 'name') || '';
  const desc = _.get(config, 'desc') || '';
  const showType = _.get(config, 'showType') ?? 2;

  const handleChangeConfig = data => {
    if (!isView && _.isUndefined(data.isEdit)) {
      data.isEdit = true;
    }
    if (data.isEdit && getChartData) {
      const chartData = getChartData();
      setChartData({
        name: data.name ?? name,
        desc: data.desc ?? desc,
        displaySetup: {
          ...chartData.displaySetup,
          showTitle: data.showTitle ?? showTitle,
        },
      });
    }
    updateWidget({
      widget,
      config: {
        ...config,
        ...data,
      },
    });
  };

  useEffect(() => {
    if (!isView && getChartData) {
      const data = getChartData();
      handleChangeConfig({
        showType,
        name: data.name,
        desc: data.desc,
        showTitle: _.get(data, 'displaySetup.showTitle') ?? true,
        isEdit: false,
      });
    }
  }, []);

  return (
    <TabsSettingPopover className="flexColumn disableDrag">
      <div className="flexRow valignWrapper mBottom10">
        <div className="bold flex">{_l('名称')}</div>
        <Checkbox checked={showTitle} onChange={e => handleChangeConfig({ showTitle: e.target.checked })}>
          {_l('显示')}
        </Checkbox>
      </div>
      <Input
        value={name}
        onChange={e => handleChangeConfig({ name: e.target.value })}
        onFocus={() => {
          isEdit = true;
        }}
        onBlur={e => {
          isEdit = false;
          if (!e.target.value) {
            handleChangeConfig({ name: _l('未命名图表') });
          }
        }}
      />
      <div className="flexRow valignWrapper mTop10 mBottom10">
        <div className="bold flex">{_l('说明')}</div>
      </div>
      <Input.TextArea
        rows={4}
        className="chartInput w100"
        autoSize={{ minRows: 2, maxRows: 4 }}
        // placeholder={_l('添加图表描述')}
        value={desc}
        onFocus={() => {
          isEdit = true;
        }}
        onBlur={() => {
          isEdit = false;
        }}
        onChange={event => {
          handleChangeConfig({
            desc: event.target.value,
          });
        }}
      />
      {['analysis'].includes(widgetType) && (
        <div className="flexRow valignWrapper mTop15 mBottom10">
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
      )}
    </TabsSettingPopover>
  );
};

let isEdit = false;
export default props => {
  const { renderItem } = props;
  const [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <Popover
      zIndex={1000}
      placement="rightTop"
      overlayClassName="tabsSettingPopover"
      arrowPointAtCenter={true}
      // destroyTooltipOnHide={true}
      mouseLeaveDelay={0.3}
      overlayInnerStyle={{
        padding: 24,
      }}
      align={{
        offset: [-5, -20],
      }}
      visible={popoverVisible}
      onVisibleChange={visible => {
        if (isEdit) return;
        setPopoverVisible(visible);
      }}
      content={<Content {...props} />}
      getPopupContainer={() => document.body}
    >
      {renderItem()}
    </Popover>
  );
};
