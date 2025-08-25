import React, { Fragment } from 'react';
import { Checkbox, Select, Switch } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';

const refreshs = [
  {
    value: 0,
    name: _l('关闭'),
  },
  {
    value: 30,
    name: _l('30秒'),
  },
  {
    value: 60,
    name: _l('1分钟'),
  },
  {
    value: 60 * 2,
    name: _l('2分钟'),
  },
  {
    value: 60 * 3,
    name: _l('3分钟'),
  },
  {
    value: 60 * 4,
    name: _l('4分钟'),
  },
  {
    value: 60 * 5,
    name: _l('5分钟'),
  },
];

export default props => {
  const { appPkg, adjustScreen, config, updatePageInfo, handleChangeConfig } = props;
  const { currentPcNaviStyle } = appPkg;
  return (
    <Fragment>
      <div className="Gray Font14 bold mTop20 mBottom10">{_l('通用')}</div>
      <div className="flexRow alignItemsCenter">
        <div className="Gray_75 Font13 label">{_l('页面布局')}</div>
        <div className="flex">
          <div className="typeSelect flexRow valignWrapper">
            <div
              className={cx('centerAlign pointer Gray_75', { active: !adjustScreen })}
              onClick={() => updatePageInfo({ adjustScreen: false })}
            >
              {_l('滚动')}
            </div>
            <div
              className={cx('centerAlign pointer Gray_75', { active: adjustScreen })}
              onClick={() => updatePageInfo({ adjustScreen: true })}
            >
              {_l('适应屏幕高度')}
            </div>
          </div>
        </div>
      </div>
      <div className="flexRow alignItemsCenter mTop15">
        <div className="Gray_75 Font13 label">{_l('自动刷新')}</div>
        <div className="flex">
          <Select
            className="pageSelect w100"
            value={config.refresh}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              handleChangeConfig({
                refresh: value,
              });
            }}
          >
            {refreshs.map(data => (
              <Select.Option className="selectOptionWrapper" value={data.value}>
                {data.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      {currentPcNaviStyle !== 2 && (
        <div className="flexRow mTop15">
          <div className="Gray_75 Font13 label">{_l('标题区')}</div>
          <div className="flex">
            <div className="mBottom15">
              <label className="flexRow alignItemsCenter pointer">
                <Switch
                  className="mRight5"
                  size="small"
                  checked={config.headerVisible}
                  onChange={checked => {
                    handleChangeConfig({
                      headerVisible: checked,
                    });
                  }}
                />
                {_l('显示标题栏')}
              </label>
            </div>
            {config.headerVisible && (
              <div className="flexRow alignItemsCenter">
                <div className="mRight15">{_l('页面操作')}</div>
                <Checkbox
                  className="flexRow alignItemsCenter"
                  checked={config.shareVisible}
                  onChange={event => {
                    handleChangeConfig({
                      shareVisible: event.target.checked,
                    });
                  }}
                >
                  {_l('分享')}
                </Checkbox>
                <Checkbox
                  className="flexRow alignItemsCenter"
                  checked={config.downloadVisible}
                  onChange={event => {
                    handleChangeConfig({
                      downloadVisible: event.target.checked,
                    });
                  }}
                >
                  {_l('下载')}
                </Checkbox>
                <Checkbox
                  className="flexRow alignItemsCenter"
                  checked={config.fullScreenVisible}
                  onChange={event => {
                    handleChangeConfig({
                      fullScreenVisible: event.target.checked,
                    });
                  }}
                >
                  {_l('全屏')}
                </Checkbox>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flexRow mTop15 mBottom20">
        <div className="Gray_75 Font13 label">{_l('图表操作')}</div>
        <div className="flex">
          <Checkbox
            className="flexRow alignItemsCenter"
            checked={_.isUndefined(config.chartShare) ? true : config.chartShare}
            onChange={event => {
              handleChangeConfig({
                chartShare: event.target.checked,
              });
            }}
          >
            {_l('分享')}
          </Checkbox>
          <Checkbox
            className="flexRow alignItemsCenter"
            checked={_.isUndefined(config.chartExportExcel) ? true : config.chartExportExcel}
            onChange={event => {
              handleChangeConfig({
                chartExportExcel: event.target.checked,
              });
            }}
          >
            {_l('导出Excel')}
          </Checkbox>
        </div>
      </div>
      <div className="flexRow mTop15 mBottom20">
        <div className="Gray_75 Font13 label">{_l('联动筛选')}</div>
        <div className="flex">
          <label className="flexRow alignItemsCenter pointer">
            <Switch
              className="mRight5"
              size="small"
              checked={config.autoLinkage}
              onChange={checked => {
                handleChangeConfig({
                  autoLinkage: checked,
                });
              }}
            />
            {_l('同数据源组件自动关联')}
          </label>
        </div>
      </div>
    </Fragment>
  );
};
