import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import cx from 'classnames';
import _, { get, includes } from 'lodash';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { NOT_NEED_DELETE_CONFIRM } from '../../config';
import { canSetAsTitle, isCustomWidget } from '../../util';
import { handleAdvancedSettingChange } from '../../util/setting';
import { openDevelopWithAI } from '../../widgetSetting/components/DevelopWithAI';
import DeleteConfirm from './DeleteConfirm';

const DeleteBothWayRelateWrap = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OperationWrap = styled.div`
  position: absolute;
  right: 0px;
  top: -6px;
  z-index: 2;

  .operationWrap {
    display: flex;
    border-radius: 3px;
    z-index: 1;
    align-items: center;
    visibility: hidden;
    &.isBatchActive {
      .batchControl {
        visibility: visible;
        background-color: #3c3c3c !important;
        color: #fff !important;
      }
    }
    &.batchMode {
      .customIcon,
      .setAsTitle,
      .copyControl,
      .delWidget {
        visibility: hidden;
      }
    }
  }
  .operationIconWrap {
    line-height: 24px;
    padding: 0 5px;
    cursor: pointer;
    transition: color background-color 0.4s;
    color: #757575;
    padding: 0 4px;
    margin-right: 4px;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.05) 0 0 4px 2px;
    border-radius: 50%;
    font-size: 0;
    i {
      font-size: 16px;
      vertical-align: middle;
    }
    &:hover:not(.customIcon) {
      color: #1677ff;
      background-color: #edf7fe;
    }
    &.delWidget {
      &:hover {
        color: #f44336;
        background-color: #ffebe9;
      }
    }
  }
`;

export default function WidgetOperation(props) {
  const {
    isBatchActive,
    batchMode,
    fromType,
    data = {},
    handleOperate,
    queryConfig,
    globalSheetInfo = {},
    rest,
  } = props;
  const { type, controlId, attribute, dataSource, sourceControl } = data;

  const [deleteConfirmVisible, setVisible] = useState(false);

  const isFree =
    _.get(
      _.find(md.global.Account.projects, item => item.projectId === globalSheetInfo.projectId),
      'licenseType',
    ) === 0;

  // 公共表单 只有一个隐藏配置
  if (fromType === 'public') {
    return (
      <OperationWrap>
        <div className="operationWrap">
          <Tooltip placement="bottom" trigger={['hover']} title={_l('隐藏')}>
            <div
              className="operationIconWrap"
              onClick={e => {
                e.stopPropagation();
                handleOperate('hide');
              }}
            >
              <i className="icon-visibility_off1" />
            </div>
          </Tooltip>
        </div>
      </OperationWrap>
    );
  }

  const renderDelete = () => {
    /* 未保存控件不需要二次确认 */
    if (includes(NOT_NEED_DELETE_CONFIRM, type) || includes(controlId, '-')) {
      return (
        <Tooltip placement="bottom" trigger={['hover']} title={_l('删除')}>
          <div
            className="delWidget operationIconWrap"
            onClick={e => {
              e.stopPropagation();
              handleOperate('delete', queryConfig);
            }}
          >
            <i className="icon-hr_delete" />
          </div>
        </Tooltip>
      );
    }
    const handleDelete = e => {
      if (e && e.stopPropagation) e.stopPropagation();
      handleOperate('delete', queryConfig);
      setVisible(false);
    };

    const deleteRelateControl = e => {
      e.stopPropagation();
      worksheetAjax.editWorksheetControls({
        worksheetId: dataSource,
        controls: [handleAdvancedSettingChange(sourceControl, { hide: '1' })],
      });

      handleDelete();
    };
    // 关联记录类型 且双向关联了其他表  删除需要异化为选择删除单个控件和删除双向控件
    if (type === 29 && (sourceControl || {}).controlId && dataSource !== globalSheetInfo.worksheetId) {
      return (
        <DeleteConfirm
          visible={deleteConfirmVisible}
          onVisibleChange={visible => setVisible(visible)}
          // getPopupContainer={() => parentRef.current}
          hint={_l(
            '仅删除此控件将保留另一侧单向关联，同时删除将直接解除二者关联关系，删除后对应表单数据也会被删除且无法恢复',
          )}
          onCancel={() => setVisible(false)}
          footer={
            <DeleteBothWayRelateWrap>
              <Button danger onClick={deleteRelateControl}>
                {_l('同时删除另一侧')}
              </Button>
              <Button type="primary" danger onClick={handleDelete}>
                {_l('仅删除此控件')}
              </Button>
            </DeleteBothWayRelateWrap>
          }
        >
          <Tooltip placement="bottom" trigger={['hover']} title={_l('删除')}>
            <div
              className="delWidget operationIconWrap"
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <i className="icon-hr_delete" />
            </div>
          </Tooltip>
        </DeleteConfirm>
      );
    }
    return (
      <DeleteConfirm
        visible={deleteConfirmVisible}
        referenceProps={props}
        onVisibleChange={visible => setVisible(visible)}
        // getPopupContainer={() => parentRef.current}
        hint={
          isFree
            ? _l('删除后可在字段回收站保留%0天（免费版删除后无法恢复）', md.global.SysSettings.worksheetRowRecycleDays)
            : _l('删除后可在字段回收站保留%0天', md.global.SysSettings.worksheetRowRecycleDays)
        }
        onCancel={() => setVisible(false)}
        onOk={handleDelete}
      >
        <Tooltip placement="bottom" trigger={['hover']} title={_l('删除')}>
          <div
            className="delWidget operationIconWrap"
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <i className="icon-hr_delete" />
          </div>
        </Tooltip>
      </DeleteConfirm>
    );
  };

  return (
    <OperationWrap>
      <div className={cx('operationWrap', { isBatchActive, batchMode })}>
        {isCustomWidget(data) && (
          <Tooltip placement="bottom" trigger={['hover']} title={_l('进入AI辅助开发')}>
            <div
              className="customIcon operationIconWrap"
              onClick={() => {
                openDevelopWithAI({
                  worksheetId: globalSheetInfo.worksheetId,
                  control: data,
                  defaultCode: get(data, 'advancedSetting.custom_js', ''),
                  rest: {
                    ...rest,
                    onChange: props.onChange,
                  },
                });
              }}
            >
              <i className="icon-custom-01" />
            </div>
          </Tooltip>
        )}
        {attribute !== 1 && canSetAsTitle(data) && (
          <Tooltip placement="bottom" trigger={['hover']} title={_l('设为标题')}>
            <div
              className="setAsTitle operationIconWrap"
              onClick={e => {
                e.stopPropagation();
                handleOperate('setAsTitle');
              }}
            >
              <i className="icon-ic_title" />
            </div>
          </Tooltip>
        )}
        <Tooltip placement="bottom" trigger={['hover']} title={_l('复制')}>
          <div
            className="copyControl operationIconWrap"
            onClick={e => {
              e.stopPropagation();
              handleOperate('copy', queryConfig);
            }}
          >
            <i className="icon-copy" />
          </div>
        </Tooltip>
        {renderDelete()}
        {type !== 52 && (
          <Tooltip placement="bottom" trigger={['hover']} title={_l('批量选择')}>
            <div
              className="batchControl operationIconWrap"
              onClick={e => {
                e.stopPropagation();
                handleOperate('batch', { shiftKey: e.shiftKey });
              }}
            >
              <i className="icon-ok" />
            </div>
          </Tooltip>
        )}
      </div>
    </OperationWrap>
  );
}
