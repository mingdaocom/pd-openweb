import React, { useState, Fragment, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import SelectCount from 'src/pages/customPage/components/editWidget/button/SelectCount';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { Dropdown, Icon, LoadDiv, Radio } from 'ming-ui';
import { Select, Divider } from 'antd';
import { connect } from 'react-redux';
import sheetApi from 'src/api/worksheet';
import _ from 'lodash';

const Wrap = styled.div`
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  overflow: auto;
  position: relative;

  .Dropdown--input {
    background-color: #fff;
  }
  .ant-checkbox-input {
    position: absolute;
  }
  .ming.Input::placeholder {
    color: #bdbdbd;
  }
  .customPageSelect {
    .ant-select-selector {
      height: 36px !important;
    }
    .ant-select-clear {
      width: 20px;
      height: 20px;
      margin-top: -10px;
    }
  }
  .fillSelect {
    flex: 2;
  }
  .selectCountWrapper {
    width: 100px;
    > div {
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }
    .countWrap {
      width: 100%;
      line-height: 32px;
    }
    .add {
      padding-top: 7px;
    }
    .sub {
      padding-bottom: 0px;
    }
  }
`;

const FillColor = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 2px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  background-color: ${props => props.color};
`;

const fillType = [
  {
    name: _l('填满'),
    value: 1,
  },
  {
    name: _l('完整显示'),
    value: 2,
  },
];

const fillColorType = [
  {
    name: _l('白色'),
    value: '#FFFFFF',
  },
  {
    name: _l('灰色'),
    value: '#F5F5F5',
  },
  {
    name: _l('黑色'),
    value: '#454545',
  },
];

const actionType = [
  {
    name: _l('打开记录'),
    value: 1,
  },
  {
    name: _l('打开链接'),
    value: 2,
  },
  {
    name: _l('预览图片'),
    value: 3,
  },
];

const openModeType = [
  {
    name: _l('弹窗'),
    value: 1,
  },
  {
    name: _l('当前页面'),
    value: 2,
  },
  {
    name: _l('新页面'),
    value: 3,
  },
];

function Setting(props) {
  const { appPkg = {}, ids = {} } = props;
  const { componentConfig, setComponentConfig } = props;
  const { config, setConfig } = props;
  const { appId } = ids;
  const projectId = appPkg.projectId || appPkg.id;

  const { worksheetId, viewId, image, count, title, subTitle, action, url, openMode } = componentConfig;
  const [dataSource, setDataSource] = useState({ views: [], controls: [] });
  const { views, controls } = dataSource;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (worksheetId) {
      sheetApi
        .getWorksheetInfo({
          worksheetId,
          getTemplate: true,
          getViews: true,
          appId,
        })
        .then(res => {
          const { resultCode, views = [], template } = res;
          if (resultCode === 1) {
            setDataSource({
              views: views,
              controls: template.controls,
            });
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [worksheetId]);

  if (loading && !views.length) {
    return (
      <Wrap className="setting">
        <LoadDiv />
      </Wrap>
    );
  }

  return (
    <Wrap className="setting">
      <div className="Font14 bold mBottom15">{_l('数据源')}</div>
      <div className="mBottom16">
        <div className="mBottom12">{_l('工作表')}</div>
        <SelectWorksheet
          dialogClassName={'btnSettingSelectDialog'}
          worksheetType={0}
          projectId={projectId}
          appId={appId}
          value={worksheetId}
          onChange={(__, value) => {
            if (value !== worksheetId) {
              setComponentConfig({
                worksheetId: value,
                viewId: undefined,
                image: undefined,
                title: undefined,
                subTitle: undefined,
                url: undefined,
              });
            }
          }}
        />
      </div>
      <div className="mBottom16">
        <div className="mBottom12">{_l('视图')}</div>
        <Select
          showSearch
          className={cx('customPageSelect w100', { Red: viewId && !_.find(views, { viewId }) })}
          value={viewId ? (_.find(views, { viewId }) ? viewId : _l('视图已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          placeholder={_l('请选择视图')}
          notFoundContent={<div className="valignWrapper">{_l('请先选择工作表')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          filterOption={(searchValue, option) => {
            const { value } = option;
            const { name } = _.find(views, { viewId: value }) || {};
            return searchValue && name ? name.toLowerCase().includes(searchValue.toLowerCase()) : true;
          }}
          onChange={value => {
            setComponentConfig({ viewId: value });
          }}
        >
          {views.map(view => (
            <Select.Option className="selectOptionWrapper" key={view.viewId} value={view.viewId}>
              <div className="valignWrapper h100">
                <span className="Font13 ellipsis">{view.name}</span>
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>
      <div className="mBottom16">
        <div className="mBottom12">{_l('图片')}</div>
        <Select
          className={cx('customPageSelect w100', { Red: image && !_.find(controls, { controlId: image }) })}
          value={image ? (_.find(controls, { controlId: image }) ? image : _l('字段已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          placeholder={_l('请选择字段')}
          notFoundContent={<div className="valignWrapper">{_l('暂无字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          onChange={value => {
            setComponentConfig({ image: value });
          }}
        >
          {controls
            .filter(c => [14, 47].includes(c.type))
            .map(c => (
              <Select.Option className="selectOptionWrapper" key={c.controlId} value={c.controlId}>
                <div className="valignWrapper h100">
                  <Icon className="Gray_9e Font16" icon={getIconByType(c.type)} />
                  <span className="mLeft5 Font13 ellipsis">{c.controlName}</span>
                </div>
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className="mBottom16">
        <div className="mBottom12">{_l('展示图片')}</div>
        <div className="mBottom8">
          <Radio
            text={_l('全部')}
            checked={!config.displayMode || config.displayMode === 0}
            onClick={() => {
              setConfig({ displayMode: 0 });
            }}
          />
        </div>
        <div>
          <Radio
            text={_l('每条记录第一张')}
            checked={config.displayMode === 1}
            onClick={() => {
              setConfig({ displayMode: 1 });
            }}
          />
        </div>
      </div>
      <div>
        <div className="mBottom10">{_l('最多显示图片数量')}</div>
        <div className="selectCountWrapper">
          <SelectCount
            maxCount={20}
            minCount={1}
            count={count}
            onChange={value => {
              setComponentConfig({ count: value });
            }}
          />
        </div>
      </div>
      <Divider className="mTop15 mBottom15" />
      <div className="Font14 bold mBottom15">{_l('轮播图设置')}</div>
      {_.get(_.find(controls, { controlId: image }), 'type') === 14 && (
        <div className="mBottom16">
          <div className="flexRow">
            <div className="flex">
              <div className="mBottom8">{_l('填充方式')}</div>
              <Select
                className="customPageSelect w100 fillSelect"
                value={config.fill}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
                onChange={value => {
                  setConfig({ fill: value });
                }}
              >
                {fillType.map(data => (
                  <Select.Option className="selectOptionWrapper" key={data.value} value={data.value}>
                    <div className="valignWrapper h100">
                      <span className="Font13 ellipsis">{data.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </div>
            {config.fill === 2 && (
              <div className="flex mLeft10">
                <div className="mBottom8">{_l('背景色')}</div>
                <Select
                  className="customPageSelect w100"
                  value={config.fillColor}
                  suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                  getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
                  onChange={value => {
                    setConfig({ fillColor: value });
                  }}
                >
                  {fillColorType.map(data => (
                    <Select.Option className="selectOptionWrapper" key={data.value} value={data.value}>
                      <div className="valignWrapper h100">
                        <FillColor color={data.value} />
                        <span className="mLeft5 Font13 ellipsis">{data.name}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mBottom16">
        <div className="mBottom8">{_l('标题')}</div>
        <Select
          className={cx('customPageSelect w100', { Red: title && !_.find(controls, { controlId: title }) })}
          value={title ? (_.find(controls, { controlId: title }) ? title : _l('字段已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          allowClear={true}
          clearIcon={<Icon icon="cancel1" className="Gray_bd Font20" />}
          placeholder={_l('请选择文本字段')}
          notFoundContent={<div className="valignWrapper">{_l('暂无文本字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          onChange={value => {
            setComponentConfig({ title: value });
          }}
        >
          {controls
            .filter(c => c.type === 2)
            .map(c => (
              <Select.Option className="selectOptionWrapper" key={c.controlId} value={c.controlId}>
                <div className="valignWrapper h100">
                  <Icon className="Gray_9e Font16" icon={getIconByType(c.type)} />
                  <span className="mLeft5 Font13 ellipsis">{c.controlName}</span>
                </div>
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className="mBottom16">
        <div className="mBottom8">{_l('摘要')}</div>
        <Select
          className={cx('customPageSelect w100', { Red: subTitle && !_.find(controls, { controlId: subTitle }) })}
          value={subTitle ? (_.find(controls, { controlId: subTitle }) ? subTitle : _l('字段已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          placeholder={_l('请选择文本字段')}
          allowClear={true}
          clearIcon={<Icon icon="cancel1" className="Gray_bd Font20" />}
          notFoundContent={<div className="valignWrapper">{_l('暂无文本字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          onChange={value => {
            setComponentConfig({ subTitle: value });
          }}
        >
          {controls
            .filter(c => c.type === 2)
            .map(c => (
              <Select.Option className="selectOptionWrapper" key={c.controlId} value={c.controlId}>
                <div className="valignWrapper h100">
                  <Icon className="Gray_9e Font16" icon={getIconByType(c.type)} />
                  <span className="mLeft5 Font13 ellipsis">{c.controlName}</span>
                </div>
              </Select.Option>
            ))}
        </Select>
      </div>
      <div className="mBottom16">
        <div className="mBottom8">{_l('点击图片时')}</div>
        <Select
          className="customPageSelect w100"
          value={action}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          onChange={value => {
            const data = { action: value };
            if (value === 2) {
              data.openMode = 1;
            }
            setComponentConfig(data);
          }}
        >
          {actionType.map(c => (
            <Select.Option className="selectOptionWrapper" key={c.value} value={c.value}>
              <div className="valignWrapper h100">
                <span className="Font13 ellipsis">{c.name}</span>
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>
      {action === 2 && (
        <Select
          className="customPageSelect w100 mBottom16"
          value={url}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          placeholder={_l('请选择文本字段')}
          notFoundContent={<div className="valignWrapper">{_l('暂无文本字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          onChange={value => {
            setComponentConfig({ url: value });
          }}
        >
          {controls
            .filter(c => c.type === 2)
            .map(c => (
              <Select.Option className="selectOptionWrapper" key={c.controlId} value={c.controlId}>
                <div className="valignWrapper h100">
                  <Icon className="Gray_9e Font16" icon={getIconByType(c.type)} />
                  <span className="mLeft5 Font13 ellipsis">{c.controlName}</span>
                </div>
              </Select.Option>
            ))}
        </Select>
      )}
      {action !== 3 && (
        <div className="mBottom16">
          <div className="mBottom8">{_l('打开方式')}</div>
          <div className="btnStyle">
            {openModeType
              .filter(data => (action === 2 ? [1, 2].includes(data.value) : true))
              .map(({ value, name }) => (
                <div
                  className={cx('item flex', { active: value === openMode })}
                  key={value}
                  onClick={() => {
                    setComponentConfig({ openMode: value });
                  }}
                >
                  <div className="Font14">{name}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </Wrap>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
}))(Setting);
