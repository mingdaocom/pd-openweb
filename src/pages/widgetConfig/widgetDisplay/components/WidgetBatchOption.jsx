import React, { Fragment, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Checkbox, Dialog } from 'ming-ui';
import Components from '../../components';
import { Tooltip, Dropdown } from 'antd';
import styled from 'styled-components';
import { SettingItem, DropdownOverlay } from '../../styled';
import { updateConfig } from '../../util/setting';
import { batchRemoveItems } from '../../util/drag';
import { batchCopyWidgets, handleMoveWidgets, batchResetWidgets } from '../../util/data';
import { putControlByOrder, relateOrSectionTab } from '../../util';
import { isEmpty, find, uniqBy, flatten } from 'lodash';

const Icon = Components.Icon;

const WidgetBatchWrap = styled.div`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
  width: 100%;
  padding: 24px 20px;
  bottom: 0;
  z-index: 9;
  overflow: auto;
  overflow-x: hidden;
  .batchItem {
    ${props => (props.hasSection ? 'padding: 0 16px;' : ' flex: 1;')}
    margin-right: 8px;
    margin-top: 14px;
    border-radius: 3px;
    line-height: 36px;
    text-align: center;
    cursor: pointer;
    background-color: #f5f5f5;
    &:last-child {
      margin-right: 0px;
      &:hover {
        background-color: red;
        color: #fff;
        i {
          color: #fff;
        }
      }
    }
    i {
      vertical-align: middle;
      margin-right: 5px;
    }
    &:hover {
      background-color: #eaeaea;
    }
  }
`;

function WidgetBatch(props) {
  const { allControls = [], batchActive, handleChange, handleOperate } = props;
  const sectionData = allControls.filter(i => i.type === 52);
  const isVisibleAll = batchActive.every(i => _.get(i.fieldPermission || '111', '0') === '0');
  const isVisibleNotAll = !isVisibleAll && batchActive.some(i => _.get(i.fieldPermission || '111', '0') === '0');

  const isCanAddAll = batchActive.every(i => _.get(i.fieldPermission || '111', '2') === '0');
  const isCanAddNotAll = !isCanAddAll && batchActive.some(i => _.get(i.fieldPermission || '111', '2') === '0');

  return (
    <WidgetBatchWrap hasSection={sectionData.length > 0}>
      <div className="Font17 Bold">{_l('批量设置%0', batchActive.length)}</div>
      <div className="flexCenter">
        {sectionData.length > 0 && (
          <Dropdown
            trigger={['click']}
            overlay={
              <DropdownOverlay>
                <div className="dropdownContent Width250">
                  {sectionData.length > 0 ? (
                    sectionData.map(item => {
                      return (
                        <div className="item " onClick={() => handleOperate('move', item.controlId)}>
                          <div className="text overflow_ellipsis">{item.controlName}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="emptyText">{_l('暂无分段字段')}</div>
                  )}
                </div>
              </DropdownOverlay>
            }
            placement="bottom"
          >
            <div className="batchItem">
              <Icon icon="view_agenda" />
              {_l('移动到标签页')}
            </div>
          </Dropdown>
        )}
        <div className="batchItem" onClick={() => handleOperate('copy')}>
          <Icon icon="copy" />
          {_l('复制')}
        </div>
        <div className="batchItem" onClick={() => handleOperate('delete')}>
          <Icon icon="delete1" />
          {_l('删除')}
        </div>
      </div>

      <SettingItem className="mTop40">
        <div className="settingItemTitle">{_l('字段属性')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            className="customWidgetCheckbox"
            checked={isVisibleAll}
            clearselected={isVisibleNotAll}
            onClick={checked => handleChange({ value: +checked, index: 0 })}
          >
            <span style={{ marginRight: '4px' }}>{_l('隐藏')}</span>
            <Tooltip
              placement="bottom"
              title={_l('设为隐藏的字段将不会对用户直接显示。但仍可以在自定义按钮和工作流中调用')}
            >
              <Icon icon="help" />
            </Tooltip>
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            className="customWidgetCheckbox"
            checked={isCanAddAll}
            clearselected={isCanAddNotAll}
            onClick={checked => handleChange({ value: +checked, index: 2 })}
          >
            <span style={{ marginRight: '4px' }}>{_l('新增记录时隐藏')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '通常用于隐藏一些不需要在新增记录时显示的字段。如：用于新订单的后续处理的字段，可以在新增记录时隐藏。',
              )}
            >
              <Icon icon="help" />
            </Tooltip>
          </Checkbox>
        </div>
      </SettingItem>
    </WidgetBatchWrap>
  );
}

export default function WidgetBatchOption(props) {
  const {
    allControls = [],
    widgets = [],
    globalSheetInfo = {},
    batchActive,
    setBatchActive,
    setWidgets,
    queryConfigs,
    updateQueryConfigs,
  } = props;
  const { worksheetId } = globalSheetInfo;

  const handleOperate = (mode, id) => {
    const selectWidgets = batchActive.map(i => {
      return { ...i, ...(id ? { sectionId: id } : {}) };
    });

    if (mode === 'move') {
      const filterSelectWidgets = selectWidgets.filter(i => !(relateOrSectionTab(i) || i.type === 34));
      // 按原有展示顺序添加，不按批量选中顺序
      const orderWidgets = flatten(putControlByOrder(filterSelectWidgets));
      // 先删除原有控件
      const deleteMoveItems = batchRemoveItems(widgets, filterSelectWidgets);
      // 再批量添加
      handleMoveWidgets(
        // 根据原有排序按顺序移动
        orderWidgets,
        { ...props, activeWidget: find(allControls, a => a.controlId === id), widgets: deleteMoveItems },
      );
      setBatchActive([]);
      return;
    }

    if (mode === 'copy') {
      batchCopyWidgets(props, selectWidgets);
      setBatchActive([]);
      return;
    }

    if (mode === 'delete') {
      Dialog.confirm({
        title: _l('确定要删除%0字段？', batchActive.length),
        description: _l('删除后可在字段回收站保留60天（免费版删除后无法恢复）'),
        okText: _l('删除'),
        cancelText: _l('取消'),
        buttonType: 'danger',
        onOk: () => {
          const deleteWidgets = [];
          selectWidgets.map(i => {
            deleteWidgets.push(i);
            // 如果是关联本表 则要删除对应的控件
            if (i.type === 29 && i.dataSource === worksheetId) {
              const currentRelate = find(allControls, a => a.controlId === i.sourceControlId);
              if (currentRelate) deleteWidgets.push(currentRelate);
            }
          });
          setWidgets(batchRemoveItems(widgets, deleteWidgets));
          updateQueryConfigs(
            queryConfigs.filter(i => !find(deleteWidgets, d => d.controlId === i.controlId)),
            'cover',
          );
          setBatchActive([]);
        },
      });
    }
  };

  return (
    <Fragment>
      {createPortal(
        <WidgetBatch
          allControls={allControls}
          batchActive={batchActive}
          handleChange={value => {
            const newBatchActive = batchActive.map(b => {
              return { ...b, fieldPermission: updateConfig({ config: b.fieldPermission || '111', ...value }) };
            });
            setBatchActive(newBatchActive);
            batchResetWidgets(props, newBatchActive);
          }}
          handleOperate={handleOperate}
        />,
        document.getElementById('widgetConfigSettingWrap'),
      )}
    </Fragment>
  );
}
