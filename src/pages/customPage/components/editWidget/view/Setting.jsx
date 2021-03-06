import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Input, Dropdown } from 'ming-ui';
import { Checkbox } from 'antd';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import { connect } from 'react-redux';
import sheetAjax from 'src/api/worksheet';
import { enumWidgetType } from 'src/pages/customPage/util';

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

  const changeConfig = (data) => {
    setSetting({
      config: {
        ...config,
        ...data
      }
    });
  }

  useEffect(() => {
    if (value) {
      sheetAjax.getWorksheetInfo({
        worksheetId: value,
        getTemplate: true,
        getViews: true,
        appId,
      }).then(res => {
        const { views = [], template } = res;
        setDataSource({
          views: views.map(({ viewId, name, viewType }) => ({ text: name, value: viewId, viewType }))
        });
      });
    }
  }, [value]);

  const view = _.find(views, { value: viewId });

  return (
    <Wrap>
      <div className="Font18 bold">{_l('??????')}</div>
      <div className="mTop20">
        <div className="mBottom12 bold">{_l('????????????')}</div>
        <Input
          value={name}
          className="w100 Font13"
          placeholder={_l('??????????????????')}
          onChange={(value) => {
            changeConfig({ name: value });
          }}
        />
      </div>
      <div className="mTop24">
        <div className="mBottom12 bold">{_l('????????????')}</div>
        <div className="mBottom12">
          <div className="mBottom12">{_l('?????????')}</div>
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
                  _workSheetName: worksheet.workSheetName
                }
              });
            }}
          />
        </div>
        <div className="mBottom12">
          <div className="mBottom12">{_l('??????')}</div>
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
                  _viewName: view.text
                }
              });
              setTimeout(() => setLoading(false));
            }}
            style={{ width: '100%', background: '#fff' }}
            menuStyle={{ width: '100%' }}
            placeholder={_l('????????????')}
            border
          />
        </div>
      </div>
      {view && [VIEW_DISPLAY_TYPE.sheet, VIEW_DISPLAY_TYPE.gallery].includes(String(view.viewType)) && (
        <div className="mTop10">
          <div className="mBottom12 bold">{_l('??????????????????')}</div>
          <Input
            className="w100 Font13"
            value={maxCount}
            placeholder={_l('?????????????????????????????????????????????')}
            onChange={(data) => {
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
        <div className="mBottom12 bold">{_l('??????')}</div>
        <div className="mBottom12">
          <Checkbox
            checked={isAddRecord}
            onChange={(e) => {
              changeConfig({ isAddRecord: e.target.checked });
            }}
          >
            {_l('??????????????????')}
          </Checkbox>
        </div>
        <div className="mBottom12">
          <Checkbox
            checked={searchRecord}
            onChange={(e) => {
              changeConfig({ searchRecord: e.target.checked });
            }}
          >
            {_l('????????????')}
          </Checkbox>
        </div>
        <div className="mBottom12">
          <Checkbox
            checked={openView}
            onChange={(e) => {
              changeConfig({ openView: e.target.checked });
            }}
          >
            {_l('????????????')}
          </Checkbox>
        </div>
      </div>
    </Wrap>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
  components: state.customPage.components.filter(c => [enumWidgetType.view, 'view'].includes(c.type))
}))(Setting);
