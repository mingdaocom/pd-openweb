import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { RadioGroup } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import RelateDetailInfo from '../components/RelateDetailInfo';
import SelectDataSource from '../components/SelectDataSource';

export const MENU_STYLE = [
  {
    text: _l('级联菜单'),
    value: '3',
  },
  {
    text: _l('树形选择'),
    value: '4',
  },
];

const DataSourceWrap = styled.div`
  .info {
    line-height: 32px;
    border: 1px solid #e0e0e0;
    padding: 0 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 3px;
    span {
      color: #e0e0e0;
    }
    .viewInfo {
      display: flex;
      align-items: center;
    }
    &.view {
      span {
        color: #151515;
      }
      .viewName {
        color: #1677ff;
        max-width: 200px;
        margin-left: 6px;
        margin-top: -2px;
      }
    }

    &.error {
      border-color: #f44336;
      background-color: rgba(255, 0, 0, 0.05);
      span {
        color: rgba(244, 67, 54, 1);
      }
    }
  }
  .sheetInfo {
    margin-top: 12px;
    .text {
      margin: 0 4px;
    }
  }
`;
export default function Cascader(props) {
  const { data, globalSheetInfo, onChange, deleteWidget } = props;
  const { appId: currentAppId, groupId } = globalSheetInfo;
  const { appId = currentAppId, controlId, dataSource, viewId } = data;
  const { showtype = '3' } = getAdvanceSetting(data);
  const [{ sheetInfo, viewInfo, hasError }, setInfo] = useSetState({
    sheetInfo: {},
    viewInfo: {},
    hasError: false,
  });
  const [{ editVisible, editType }, setEdit] = useSetState({
    editVisible: false,
    editType: 0,
  });
  const [initVisible, setVisible] = useState(false);
  useEffect(() => {
    if (!dataSource) {
      setVisible(true);
    }
  }, [controlId]);
  useEffect(() => {
    if (!dataSource) return;
    worksheetAjax
      .getWorksheetInfo({
        worksheetId: dataSource,
        getViews: true,
        getTemplate: true,
        appId,
        relationWorksheetId: globalSheetInfo.worksheetId,
      })
      .then(res => {
        const viewInfo = _.find(res.views, item => item.viewId === viewId);
        if (!viewInfo) {
          setInfo({ sheetInfo: res, hasError: true });
          return;
        }
        onChange({ relationControls: _.get(res, 'template.controls') });
        setInfo({ sheetInfo: res, viewInfo });
      })
      .catch(() => {
        setInfo({ hasError: true });
      });
  }, [dataSource, controlId]);

  const renderDataSourceInfo = () => {
    if (!dataSource) {
      return (
        <div className="info empty" onClick={() => setEdit({ editVisible: true, editType: 1 })}>
          <span>{_l('选择数据源')}</span>
          <i className="icon-arrow-right-border"></i>
        </div>
      );
    }
    if (hasError) {
      return (
        <div className="info error" onClick={() => setEdit({ editVisible: true, editType: 3 })}>
          <span>{_l('数据源异常')}</span>
          <i className="icon-edit_17 Gray_9e pointer"></i>
        </div>
      );
    }
    return (
      <div className="info view">
        <div className="viewInfo">
          {_l('层级视图:')}
          <div
            className="viewName overflow_ellipsis pointer Bold"
            onClick={() => window.open(`/app/${appId}/${groupId}/${dataSource}/${viewId}`)}
          >
            {(viewInfo || {}).name}
          </div>
        </div>
        <i className="icon-edit_17 Gray_9e pointer" onClick={() => setEdit({ editVisible: true, editType: 3 })}></i>
      </div>
    );
  };
  return (
    <Fragment>
      {initVisible && (
        <SelectDataSource
          {...props}
          editType={0}
          appId={appId}
          onClose={() => {
            deleteWidget(controlId);
          }}
          onOk={({ appId, sheetId, viewId }) => {
            setVisible(false);
            onChange({ viewId, dataSource: sheetId, appId });
            setEdit({ editType: 3 });
            setInfo({ hasError: false });
          }}
        />
      )}

      <RelateDetailInfo {...props} sheetInfo={sheetInfo} />
      <SettingItem>
        <div className="settingItemTitle">{_l('数据源')}</div>
        <DataSourceWrap>{renderDataSourceInfo()}</DataSourceWrap>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择方式')}</div>
        <RadioGroup
          className="singleLineRadio"
          size="middle"
          data={MENU_STYLE}
          checkedValue={showtype}
          onChange={value => onChange(handleAdvancedSettingChange(data, { showtype: value }))}
        />
      </SettingItem>
      {editVisible && (
        <SelectDataSource
          editType={editType}
          appId={appId}
          worksheetId={dataSource}
          globalSheetInfo={globalSheetInfo}
          viewId={viewId}
          onClose={() => setEdit({ editVisible: false })}
          onOk={({ appId, sheetId, viewId }) => {
            onChange({ viewId, dataSource: sheetId, appId });
            setEdit({ editVisible: false, editType: 3 });
            setInfo({ hasError: false, viewInfo: _.find(sheetInfo.views, item => item.viewId === viewId) });
          }}
        />
      )}
    </Fragment>
  );
}
