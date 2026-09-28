import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Divider, InputNumber, Radio, Select } from 'ming-ui/antd-components';
import sheetApi from 'src/api/worksheet';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { getTranslateInfo } from 'src/utils/services/app';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import { getShowViews } from 'src/utils/services/worksheet/view';
import './index.less';

const SELECT_ALLOW_CLEAR = { clearIcon: <Icon icon="cancel" className="textDisabled Font20" /> };

const Wrap = styled.div`
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-secondary);
  overflow: auto;
  position: relative;

  .hap-checkbox-input {
    position: absolute;
  }
  .fillSelect {
    flex: 2;
  }
`;

const FillColor = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 2px;
  box-shadow: var(--shadow-lg);
  background-color: ${props => props.$color};
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
  {
    name: _l('拉伸 (会变形)'),
    value: 3,
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
  const [loading, setLoading] = useState(Boolean(worksheetId));

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
            const controls = replaceControlsTranslateInfo(appId, worksheetId, template.controls);
            setDataSource({
              views: getShowViews(views).map(data => {
                return {
                  ...data,
                  name: getTranslateInfo(appId, null, data.viewId).name || data.name,
                };
              }),
              controls,
            });
          }

          setLoading(false);
        });
    }
  }, [appId, worksheetId]);

  if (loading && !views.length) {
    return (
      <Wrap className="setting">
        <LoadDiv />
      </Wrap>
    );
  }

  const getControlOption = c => ({
    value: c.controlId,
    label: (
      <div className="valignWrapper h100">
        <Icon className="textTertiary Font16" icon={getIconByType(c.type)} />
        <span className="mLeft5 Font13 ellipsis">{c.controlName}</span>
      </div>
    ),
  });
  const getNameOption = data => ({
    value: data.value,
    label: (
      <div className="valignWrapper h100">
        <span className="Font13 ellipsis">{data.name}</span>
      </div>
    ),
  });
  const viewOptions = views.map(view => ({
    value: view.viewId,
    label: (
      <div className="valignWrapper h100">
        <span className="Font13 ellipsis">{view.name}</span>
      </div>
    ),
  }));
  const imageOptions = controls.filter(c => [14, 47].includes(c.type)).map(getControlOption);
  const textControlOptions = controls.filter(c => [2, 32].includes(c.type)).map(getControlOption);
  const urlOptions = controls.filter(c => c.type === 2).map(getControlOption);
  const fillOptions = fillType.map(getNameOption);
  const actionOptions = actionType.map(getNameOption);
  const openModeOptions = openModeType
    .filter(data => (action === 2 ? [1, 2].includes(data.value) : true))
    .map(data => ({
      value: data.value,
      label: (
        <div className="valignWrapper h100">
          <span className="mLeft5 Font13 ellipsis">{data.name}</span>
        </div>
      ),
    }));

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
          className={cx('w100', { Red: viewId && !_.find(views, { viewId }) })}
          value={viewId ? (_.find(views, { viewId }) ? viewId : _l('视图已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
          placeholder={_l('请选择视图')}
          notFoundContent={<div className="valignWrapper textTertiary">{_l('请先选择工作表')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          options={viewOptions}
          filterOption={(searchValue, option) => {
            const { value } = option;
            const { name } = _.find(views, { viewId: value }) || {};
            return searchValue && name ? name.toLowerCase().includes(searchValue.toLowerCase()) : true;
          }}
          onChange={value => {
            setComponentConfig({ viewId: value });
          }}
        />
      </div>
      <div className="mBottom16">
        <div className="mBottom12">{_l('图片')}</div>
        <Select
          className={cx('w100', { Red: image && !_.find(controls, { controlId: image }) })}
          value={image ? (_.find(controls, { controlId: image }) ? image : _l('字段已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
          placeholder={_l('请选择字段')}
          notFoundContent={<div className="valignWrapper textTertiary">{_l('暂无字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          options={imageOptions}
          onChange={value => {
            setComponentConfig({ image: value });
          }}
        />
      </div>
      <div className="mBottom16">
        <div className="mBottom12">{_l('展示图片')}</div>
        <div className="mBottom8">
          <Radio
            checked={!config.displayMode || config.displayMode === 0}
            onChange={() => {
              setConfig({
                displayMode: 0,
              });
            }}
            title={_l('全部')}
          >
            {_l('全部')}
          </Radio>
        </div>
        <div>
          <Radio
            checked={config.displayMode === 1}
            onChange={() => {
              setConfig({
                displayMode: 1,
              });
            }}
            title={_l('每条记录第一张')}
          >
            {_l('每条记录第一张')}
          </Radio>
        </div>
      </div>
      <div>
        <div className="mBottom10">{_l('最多显示图片数量')}</div>
        <InputNumber
          min={1}
          max={20}
          style={{ width: 100 }}
          value={count}
          onChange={value => value !== null && setComponentConfig({ count: value })}
        />
      </div>
      <Divider className="mTop15 mBottom15" />
      <div className="Font14 bold mBottom15">{_l('轮播图设置')}</div>
      {_.get(_.find(controls, { controlId: image }), 'type') === 14 && (
        <div className="mBottom16">
          <div className="flexRow">
            <div className="flex">
              <div className="mBottom8">{_l('填充方式')}</div>
              <Select
                className="w100 fillSelect"
                value={config.fill}
                suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
                options={fillOptions}
                onChange={value => {
                  setConfig({ fill: value });
                }}
              />
            </div>
            {config.fill === 2 && (
              <div className="flex mLeft10">
                <div className="mBottom8">{_l('背景色')}</div>
                <Select
                  className="w100"
                  value={config.fillColor}
                  suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
                  getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
                  options={fillColorType.map(data => ({
                    value: data.value,
                    label: (
                      <div className="valignWrapper h100">
                        <FillColor $color={data.value} />
                        <span className="mLeft5 Font13 ellipsis">{data.name}</span>
                      </div>
                    ),
                  }))}
                  onChange={value => {
                    setConfig({ fillColor: value });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mBottom16">
        <div className="mBottom8">{_l('标题')}</div>
        <Select
          className={cx('w100', { Red: title && !_.find(controls, { controlId: title }) })}
          value={title ? (_.find(controls, { controlId: title }) ? title : _l('字段已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
          allowClear={SELECT_ALLOW_CLEAR}
          placeholder={_l('请选择文本字段')}
          notFoundContent={<div className="valignWrapper textTertiary">{_l('暂无文本字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          options={textControlOptions}
          onChange={value => {
            setComponentConfig({ title: value });
          }}
        />
      </div>
      <div className="mBottom16">
        <div className="mBottom8">{_l('摘要')}</div>
        <Select
          className={cx('w100', { Red: subTitle && !_.find(controls, { controlId: subTitle }) })}
          value={subTitle ? (_.find(controls, { controlId: subTitle }) ? subTitle : _l('字段已删除')) : undefined}
          suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
          placeholder={_l('请选择文本字段')}
          allowClear={SELECT_ALLOW_CLEAR}
          notFoundContent={<div className="valignWrapper textTertiary">{_l('暂无文本字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          options={textControlOptions}
          onChange={value => {
            setComponentConfig({ subTitle: value });
          }}
        />
      </div>
      <div className="mBottom16">
        <div className="mBottom8">{_l('点击图片时')}</div>
        <Select
          className="w100"
          value={action}
          suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          options={actionOptions}
          onChange={value => {
            const data = { action: value };

            if (value === 2) {
              data.openMode = 1;
            }

            setComponentConfig(data);
          }}
        />
      </div>
      {action === 2 && (
        <Select
          className="w100 mBottom16"
          value={url}
          suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
          placeholder={_l('请选择文本字段')}
          notFoundContent={<div className="valignWrapper textTertiary">{_l('暂无文本字段')}</div>}
          getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
          options={urlOptions}
          onChange={value => {
            setComponentConfig({ url: value });
          }}
        />
      )}
      {action !== 3 && (
        <div className="mBottom16">
          <div className="mBottom8">{_l('打开方式')}</div>
          <Select
            className="w100 mBottom16"
            value={openMode}
            suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
            getPopupContainer={() => document.querySelector('.customPageCarouselWrap .setting')}
            options={openModeOptions}
            onChange={value => {
              setComponentConfig({ openMode: value });
            }}
          />
        </div>
      )}
    </Wrap>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
}))(Setting);
