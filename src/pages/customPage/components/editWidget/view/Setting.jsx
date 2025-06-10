import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Checkbox } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Input } from 'ming-ui';
import sheetApi from 'src/api/worksheet';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { enumWidgetType } from 'src/pages/customPage/util';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import { getShowViews } from 'src/pages/worksheet/views/util';
import { getTranslateInfo } from 'src/utils/app';

const Wrap = styled.div`
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: auto;

  .Dropdown--input {
    background-color: #fff;
  }
  .ant-checkbox-input {
    position: absolute;
  }
  .ming.Input::placeholder {
    color: #bdbdbd;
  }
`;

function Setting(props) {
  const { appPkg = {}, ids = {}, setting, setSetting, setLoading, components } = props;
  const { appId, pageId } = ids;
  const projectId = appPkg.projectId || appPkg.id;
  const { value, viewId, config = { isAddRecord: true, searchRecord: true, openView: true } } = setting;
  const { name, maxCount, isAddRecord, searchRecord, openView } = config;

  const [dataSource, setDataSource] = useState({ views: [] });
  const [currentViewId, setCurrentViewId] = useState(viewId);
  const { views } = dataSource;
  const viewIds = components.map(c => c.viewId).filter(id => id !== currentViewId);

  const changeConfig = data => {
    setSetting({
      config: {
        ...config,
        ...data,
      },
    });
  };

  useEffect(() => {
    if (value) {
      sheetApi
        .getWorksheetInfo({
          worksheetId: value,
          getTemplate: true,
          getViews: true,
          appId,
        })
        .then(res => {
          const { views = [], template } = res;
          setDataSource({
            views: getShowViews(views).map(({ viewId, name, viewType }) => ({
              text: getTranslateInfo(appId, null, viewId).name || name,
              value: viewId,
              viewType,
            })),
          });
        });
    }
  }, [value]);

  const view = _.find(views, { value: viewId });

  return (
    <Wrap>
      <div className="Font18 bold">{_l('设置')}</div>
      <div className="mTop20">
        <div className="mBottom12 bold">{_l('组件名称')}</div>
        <Input
          value={name}
          className="w100 Font13"
          placeholder={_l('输入组件名称')}
          onChange={value => {
            changeConfig({ name: value });
          }}
        />
      </div>
      <div className="mTop24">
        <div className="mBottom12 bold">{_l('视图来源')}</div>
        <div className="mBottom12">
          <div className="mBottom12">{_l('工作表')}</div>
          <SelectWorksheet
            dialogClassName={'btnSettingSelectDialog'}
            worksheetType={0}
            projectId={projectId}
            appId={appId}
            value={value}
            onChange={(__, itemId, worksheet) => {
              setSetting({
                value: itemId,
                viewId: undefined,
                config: {
                  ...config,
                  _workSheetName: worksheet.workSheetName,
                },
              });
            }}
          />
        </div>
        <div className="mBottom12">
          <div className="mBottom12">{_l('视图')}</div>
          <Dropdown
            disabled={!value}
            value={viewId || undefined}
            data={views.map(v => ({ ...v, disabled: viewIds.includes(v.value) }))}
            onChange={value => {
              const view = _.find(views, { value });
              setLoading(true);
              setSetting({
                viewId: value,
                config: {
                  ...config,
                  _viewName: view.text,
                },
              });
              setTimeout(() => setLoading(false));
            }}
            style={{ width: '100%', background: '#fff' }}
            menuStyle={{ width: '100%' }}
            placeholder={_l('选择视图')}
            border
          />
        </div>
      </div>
      {view && [VIEW_DISPLAY_TYPE.sheet, VIEW_DISPLAY_TYPE.gallery].includes(String(view.viewType)) && (
        <div className="mTop10">
          <div className="mBottom12 bold">{_l('数据展示数量')}</div>
          <Input
            className="w100 Font13"
            value={maxCount}
            placeholder={_l('输入最大展示（为空表示不限制）')}
            onChange={data => {
              const value = parseInt(data);
              const maxCount = isNaN(value) ? '' : value;
              changeConfig({ maxCount: maxCount >= 100 ? 100 : maxCount });
            }}
            onBlur={() => {
              setLoading(true);
              setTimeout(() => setLoading(false));
            }}
          />
        </div>
      )}
      <div className="mTop20">
        <div className="mBottom12 bold">{_l('操作')}</div>
        <div className="mBottom12">
          <Checkbox
            checked={isAddRecord}
            onChange={e => {
              changeConfig({ isAddRecord: e.target.checked });
            }}
          >
            {_l('允许新建记录')}
          </Checkbox>
        </div>
        <div className="mBottom12">
          <Checkbox
            checked={searchRecord}
            onChange={e => {
              changeConfig({ searchRecord: e.target.checked });
            }}
          >
            {_l('搜索记录')}
          </Checkbox>
        </div>
        <div className="mBottom12">
          <Checkbox
            checked={openView}
            onChange={e => {
              changeConfig({ openView: e.target.checked });
            }}
          >
            {_l('打开视图')}
          </Checkbox>
        </div>
      </div>
    </Wrap>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
  components: state.customPage.components.filter(c => [enumWidgetType.view, 'view'].includes(c.type)),
}))(Setting);
