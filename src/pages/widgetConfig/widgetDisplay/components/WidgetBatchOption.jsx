import React from 'react';
import { Dropdown } from 'antd';
import _, { find, flatten } from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import AutoIcon from '../../components/Icon';
import { UN_REQUIRED_WIDGET } from '../../config';
import { DropdownOverlay, SettingItem } from '../../styled';
import { isSheetDisplay, notInsetSectionTab, putControlByOrder } from '../../util';
import { batchCopyWidgets, batchResetWidgets, handleMoveWidgets } from '../../util/data';
import { batchRemoveItems } from '../../util/drag';
import { updateConfig } from '../../util/setting';
import WidgetWarning from '../../widgetSetting/components/WidgetBase/WidgetWarning';

const WidgetBatchWrap = styled.div`
  position: absolute;
  background: #fff;
  top: 0;
  left: 0;
  width: 100%;
  bottom: 0;
  z-index: 9;
  overflow: auto;
  overflow-x: hidden;
  padding-bottom: 24px;
  .titleBox {
    height: 48px;
    padding: 8px 16px;
    background: #3c3c3c;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    cursor: pointer;
    .titleBtn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      margin-right: 6px;
      font-size: 20px;
      &:hover {
        background: #505050;
      }
    }
  }
  .batchContentWrap {
    padding: 20px;
  }
`;

const PERMISSION_OPTIONS = [
  {
    text: _l('只读'),
    tips: _l('设为只读的字段将不允许被用户直接编辑。但仍可以在自定义按钮和工作流中填写或更新'),
    index: 1,
    mode: 'readonly',
  },
  {
    text: _l('隐藏'),
    tips: _l('设为隐藏的字段将不会对用户直接显示。但仍可以在自定义按钮和工作流中调用'),
    index: 0,
    mode: 'hide',
  },
  {
    text: _l('新增记录时隐藏'),
    tips: _l('通常用于隐藏一些不需要在新增记录时显示的字段。如：用于新订单的后续处理的字段，可以在新增记录时隐藏'),
    index: 2,
    mode: 'createhide',
  },
];

function WidgetBatch(props) {
  const { allControls = [], batchActive, handleChange, handleOperate, handleCancel } = props;
  const sectionData = allControls.filter(i => i.type === 52);
  const isRequiredAll = batchActive.every(i => i.required);
  const isRequiredNotAll = !isRequiredAll && batchActive.some(i => i.required);

  const getAllSelect = index => {
    const indexKey = index.toString();
    const isAll = batchActive.every(i => _.get(i.fieldPermission || '111', indexKey) === '0');
    const isNotAll = !isAll && batchActive.some(i => _.get(i.fieldPermission || '111', indexKey) === '0');
    return { isAll, isNotAll };
  };

  const getDisabledStatus = mode => {
    if (mode === 'readonly') {
      const unReadOnly = [31, 33, 25, 32, 38, 43, 47, 45, 30, 51, 37, 22, 52, 53, 54, 10010];
      return batchActive.some(i => _.includes(unReadOnly, i.type));
    }
    if (mode === 'required') {
      return batchActive.some(i => _.includes(UN_REQUIRED_WIDGET, i.type) || isSheetDisplay(i));
    }
    return false;
  };

  return (
    <WidgetBatchWrap hasSection={sectionData.length > 0}>
      <div className="titleBox">
        <div className="flexCenter">
          <Tooltip placement="bottom" title={_l('取消选中')}>
            <Icon className="titleBtn Font20 mRight10" icon="close" onClick={() => handleCancel()} />
          </Tooltip>
          <span className="Font17 Bold">{_l('已选择 %0', batchActive.length)}</span>
        </div>
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
              <Tooltip placement="bottom" title={_l('移动到标签页')}>
                <Icon className="titleBtn" icon="drive_file_move" />
              </Tooltip>
            </Dropdown>
          )}
          <Tooltip placement="bottom" title={_l('复制')}>
            <Icon className="titleBtn" icon="copy" onClick={() => handleOperate('copy')} />
          </Tooltip>
          <Tooltip placement="bottom" title={_l('删除')}>
            <Icon className="titleBtn mRight0" icon="trash" onClick={() => handleOperate('delete')} />
          </Tooltip>
        </div>
      </div>

      <div className="batchContentWrap">
        <WidgetWarning type="batchOption" />
        <SettingItem>
          <div className="settingItemTitle">{_l('验证')}</div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              className="customWidgetCheckbox"
              disabled={getDisabledStatus('required')}
              checked={isRequiredAll}
              clearselected={isRequiredNotAll}
              text={_l('必填')}
              onClick={checked => handleChange({ required: !checked })}
            />
          </div>
        </SettingItem>

        <SettingItem>
          <div className="settingItemTitle">{_l('字段属性')}</div>
          {PERMISSION_OPTIONS.map(option => {
            const { index, text, tips, mode } = option;
            return (
              <div className="labelWrap">
                <Checkbox
                  size="small"
                  className="customWidgetCheckbox"
                  disabled={getDisabledStatus(mode)}
                  checked={_.get(getAllSelect(index), 'isAll')}
                  clearselected={_.get(getAllSelect(index), 'isNotAll')}
                  onClick={checked => handleChange({ value: +checked, index }, 'fieldPermission')}
                >
                  <span style={{ marginRight: '4px' }}>{text}</span>
                  <Tooltip placement="bottom" title={tips}>
                    <AutoIcon icon="help" />
                  </Tooltip>
                </Checkbox>
              </div>
            );
          })}
        </SettingItem>
      </div>
    </WidgetBatchWrap>
  );
}

export default function WidgetBatchOption(props) {
  const { allControls = [], widgets = [], globalSheetInfo = {}, batchActive, setBatchActive, setWidgets } = props;
  const { worksheetId } = globalSheetInfo;

  const handleOperate = (mode, id) => {
    const selectWidgets = batchActive.map(i => {
      return { ...i, ...(id ? { sectionId: id } : {}) };
    });

    if (mode === 'move') {
      const filterSelectWidgets = selectWidgets.filter(i => !notInsetSectionTab(i));
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
          setBatchActive([]);
        },
      });
    }
  };

  return (
    <WidgetBatch
      allControls={allControls}
      batchActive={batchActive}
      handleChange={(value, key) => {
        // 标题字段属性直接变更，批量数据没有同步
        const newBatchActive = batchActive.map(b => {
          const newAttribute = _.get(
            _.find(allControls, i => i.controlId === b.controlId),
            'attribute',
          );
          if (key === 'fieldPermission') {
            return {
              ...b,
              fieldPermission: updateConfig({ config: b.fieldPermission || '111', ...value }),
              attribute: newAttribute,
            };
          }
          return { ...b, ...value, attribute: newAttribute };
        });
        setBatchActive(newBatchActive);
        batchResetWidgets(props, newBatchActive);
      }}
      handleCancel={() => setBatchActive([])}
      handleOperate={handleOperate}
    />
  );
}
