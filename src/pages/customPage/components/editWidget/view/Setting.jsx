import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Input, Select } from 'ming-ui/antd-components';
import sheetApi from 'src/api/worksheet';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import { enumWidgetType } from 'src/utils/domain/customPage/model';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { getTranslateInfo } from 'src/utils/services/app';
import { getShowViews } from 'src/utils/services/worksheet/view';

const Wrap = styled.div`
  box-sizing: border-box;
  width: 360px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-secondary);
  overflow: auto;

  .hap-checkbox-input {
    position: absolute;
  }
`;

function Setting(props) {
  const { appPkg = {}, ids = {}, setting, setSetting, setLoading, components } = props;
  const { appId } = ids;
  const projectId = appPkg.projectId || appPkg.id;
  const {
    value,
    viewId,
    config = {
      isAddRecord: true,
      searchRecord: true,
      openView: true,
      allowFilter: true,
      allowDraft: true,
      allowImport: false,
    },
  } = setting;
  const { name, maxCount, isAddRecord, searchRecord, openView, allowFilter, allowDraft, allowImport } = config;

  const [dataSource, setDataSource] = useState({ views: [] });
  const [currentViewId] = useState(viewId);
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
          const { views = [] } = res;
          setDataSource({
            views: getShowViews(views).map(({ viewId, name, viewType, advancedSetting }) => ({
              label: getTranslateInfo(appId, null, viewId).name || name,
              value: viewId,
              viewType: String(viewType),
              advancedSetting,
            })),
          });
        });
    }
  }, [appId, value]);

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
          onChange={e => {
            changeConfig({ name: e.target.value });
          }}
        />
      </div>
      <div className="mTop24">
        <div className="mBottom12 bold">{_l('视图来源')}</div>
        <div className="mBottom12">
          <div className="mBottom12">{_l('工作表')}</div>
          <SelectWorksheet
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
          <Select
            disabled={!value}
            value={viewId || undefined}
            options={views.map(v => ({ ...v, disabled: viewIds.includes(v.value) }))}
            onChange={value => {
              const view = _.find(views, { value });
              setLoading(true);
              setSetting({
                viewId: value,
                config: {
                  ...config,
                  _viewName: view?.label,
                },
              });
              setTimeout(() => setLoading(false));
            }}
            style={{ width: '100%' }}
            placeholder={_l('选择视图')}
          />
        </div>
      </div>
      {view && [VIEW_DISPLAY_TYPE.sheet, VIEW_DISPLAY_TYPE.gallery].includes(view.viewType) && (
        <div className="mTop10">
          <div className="mBottom12 bold">{_l('数据展示数量')}</div>
          <Input
            className="w100 Font13"
            value={maxCount}
            placeholder={_l('输入最大展示（为空表示不限制）')}
            onChange={e => {
              const value = parseInt(e.target.value);
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
        {view &&
          view.viewType !== VIEW_DISPLAY_TYPE.gunter &&
          _.get(view, 'advancedSetting.hierarchyViewType') !== '3' && (
            <div className="mBottom12">
              <Checkbox
                checked={allowFilter}
                onChange={e => {
                  changeConfig({ allowFilter: e.target.checked });
                }}
              >
                {_l('筛选')}
              </Checkbox>
            </div>
          )}
        <div className="mBottom12">
          <Checkbox
            checked={allowDraft}
            onChange={e => {
              changeConfig({ allowDraft: e.target.checked });
            }}
          >
            {_l('草稿箱')}
          </Checkbox>
        </div>
        <div className="mBottom12">
          <Checkbox
            checked={allowImport}
            onChange={e => {
              changeConfig({ allowImport: e.target.checked });
            }}
          >
            {_l('导入')}
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
