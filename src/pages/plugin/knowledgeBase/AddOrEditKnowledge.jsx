import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Tooltip } from 'antd';
import { Dialog, Input, Dropdown, Icon, LoadDiv } from 'ming-ui';
import appManagementApi from 'src/api/appManagement';
import worksheetApi from 'src/api/worksheet';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { FilterItemTexts, FilterDialog } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import _ from 'lodash';
import assistantApi from 'src/api/assistant';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import cx from 'classnames';

const FormItem = styled.div`
  margin-bottom: 24px;
  .labelText {
    font-size: 14px;
    margin-bottom: 8px;
  }
  .filterBtn {
    width: 36px;
    height: 36px;
    text-align: center;
    margin-left: 10px;
    border-radius: 3px;
    border: 1px solid #dddddd;
    color: #989898;
    cursor: pointer;
    i {
      font-size: 20px;
      line-height: 34px;
    }
    &:hover {
      color: #2196f3;
    }
    &.isActive {
      color: #2196f3;
    }
  }
`;

export default function AddOrEditKnowledge(props) {
  const { projectId, onClose, editRecord, onRefreshList, onUpdateSuccess } = props;
  const [formData, setFormData] = useSetState(editRecord || { attachmentIds: [] });
  const [detailLoading, setDetailLoading] = useState(!!editRecord);
  const [appList, setAppList] = useState(null);
  const [worksheetList, setWorksheetList] = useSetState({});
  const [viewList, setViewList] = useSetState({});
  const [controlList, setControlList] = useSetState({});
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    editRecord ? getKnowledgeBaseDetail() : fetchAppAndWorksheetList();
  }, []);

  const getKnowledgeBaseDetail = async () => {
    await assistantApi.getKnowledgeBase({ projectId, knowledgeBaseId: editRecord.id }).then(res => {
      if (res) {
        setFormData({ filters: safeParse(res.filter) });
      }
    });
    fetchWorksheetInfo(editRecord.worksheetId, true);
  };

  const fetchAppAndWorksheetList = () => {
    appManagementApi.getAppForManager({ projectId, type: 0 }).then(res => {
      if (res) {
        let worksheetInfo = {};
        const list = res.map(item => {
          const worksheets = item.workSheetInfo.map(item => ({ text: item.workSheetName, value: item.workSheetId }));
          worksheetInfo[item.appId] = worksheets;
          return { text: item.appName, value: item.appId };
        });
        setAppList(list);
        setWorksheetList(worksheetInfo);
      }
    });
  };

  const fetchWorksheetInfo = (worksheetId, isSetDefault) => {
    worksheetApi.getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true }).then(res => {
      if (res) {
        const views = (res.views || []).map(item => ({ text: item.name, value: item.viewId }));
        const controls = _.get(res, 'template.controls');
        setViewList({ [worksheetId]: views });
        setControlList({ [worksheetId]: controls });
        isSetDefault &&
          setFormData({
            appId: res.appId,
            appName: editRecord.appName,
            worksheetId,
            worksheetName: res.name,
          });
        detailLoading && setDetailLoading(false);
      }
    });
  };

  const onSave = () => {
    const upsertItem = {
      id: (editRecord || {}).id,
      projectId,
      ..._.omit(formData, ['filters', 'appName', 'worksheetName']),
      filter: JSON.stringify((formData.filters || []).map(handleCondition)),
    };
    assistantApi.upsertKnowledgeBase(upsertItem).then(res => {
      if (res) {
        alert(editRecord ? _l('修改成功') : _l('添加成功'));
        editRecord ? onUpdateSuccess(editRecord.id, { ...editRecord, ...upsertItem }) : onRefreshList();
        onClose();
      }
    });
  };

  return (
    <Dialog
      visible
      title={!!editRecord ? _l('编辑知识') : _l('添加知识')}
      okDisabled={
        !(
          formData.name &&
          formData.appId &&
          formData.worksheetId &&
          formData.viewId &&
          !_.isEmpty(formData.attachmentIds)
        )
      }
      onOk={onSave}
      onCancel={onClose}
    >
      {detailLoading ? (
        <LoadDiv className="mTop10" />
      ) : (
        <div className="mTop12">
          <FormItem>
            <div className="labelText">{_l('名称')}</div>
            <Input className="w100" value={formData.name} onChange={name => setFormData({ name })} />
          </FormItem>
          <FormItem>
            <div className="labelText">{_l('应用')}</div>
            <Dropdown
              border
              isAppendToBody
              openSearch
              className="w100"
              placeholder={_l('请选择应用')}
              renderTitle={!appList && formData.appId ? () => formData.appName : undefined}
              itemLoading={!appList}
              onVisibleChange={visible => visible && !appList && fetchAppAndWorksheetList()}
              value={formData.appId}
              data={appList || []}
              onChange={appId =>
                setFormData({ appId, worksheetId: null, viewId: null, attachmentIds: [], filters: [] })
              }
            />
          </FormItem>
          <FormItem>
            <div className="labelText">{_l('工作表')}</div>
            <Dropdown
              border
              isAppendToBody
              openSearch
              className="w100"
              placeholder={_l('请选择工作表')}
              disabled={!formData.appId}
              renderTitle={
                !worksheetList[formData.appId] && formData.worksheetId ? () => formData.worksheetName : undefined
              }
              itemLoading={!worksheetList[formData.appId]}
              onVisibleChange={visible => visible && !appList && fetchAppAndWorksheetList()}
              value={formData.worksheetId}
              data={worksheetList[formData.appId] || []}
              onChange={worksheetId => {
                setFormData({ worksheetId, viewId: null, attachmentIds: [], filters: [] });
                fetchWorksheetInfo(worksheetId);
              }}
            />
          </FormItem>
          <FormItem>
            <div className="labelText">{_l('视图')}</div>
            <div className="flexRow">
              <Dropdown
                border
                isAppendToBody
                openSearch
                className="w100"
                placeholder={_l('请选择视图')}
                disabled={!formData.worksheetId}
                itemLoading={!viewList[formData.worksheetId]}
                value={formData.viewId}
                data={viewList[formData.worksheetId] || []}
                onChange={viewId => setFormData({ viewId })}
              />
              <Tooltip title={_l('过滤选择范围')}>
                <div
                  className={cx('filterBtn', { isActive: formData.filters && !!formData.filters.length })}
                  onClick={() => {
                    if (!formData.filters || !formData.filters.length) {
                      if (!formData.worksheetId) {
                        alert(_l('请先选择工作表'), 3);
                        return;
                      }
                      setFilterVisible(true);
                    } else {
                      setFormData({ filters: [] });
                    }
                  }}
                >
                  <Icon icon="filter" />
                </div>
              </Tooltip>
            </div>
            {filterVisible && (
              <FilterDialog
                allowEmpty
                showCustom
                supportGroup
                hideSupport
                title={'筛选'}
                filters={formData.filters || []}
                relationControls={controlList[formData.worksheetId] || []}
                globalSheetInfo={{ projectId, appId: formData.appId }}
                onChange={({ filters }) => {
                  setFormData({ filters });
                  setFilterVisible(false);
                }}
                onClose={() => setFilterVisible(false)}
              />
            )}
            {!_.isEmpty(formData.filters) && (
              <FilterItemTexts
                loading={false}
                filterItemTexts={filterData(controlList[formData.worksheetId] || [], formData.filters || [])}
                editFn={() => setFilterVisible(true)}
              />
            )}
          </FormItem>
          <FormItem>
            <div className="labelText">{_l('附件字段')}</div>
            <Dropdown
              border
              isAppendToBody
              openSearch
              className="w100"
              placeholder={_l('请选择附件字段')}
              disabled={!formData.worksheetId}
              itemLoading={!controlList[formData.worksheetId]}
              value={formData.attachmentIds[0]}
              data={(controlList[formData.worksheetId] || [])
                .filter(item => item.type === 14)
                .map(item => ({
                  text: item.controlName,
                  value: item.controlId,
                }))}
              onChange={attachmentId => setFormData({ attachmentIds: [attachmentId] })}
            />
          </FormItem>
        </div>
      )}
    </Dialog>
  );
}
