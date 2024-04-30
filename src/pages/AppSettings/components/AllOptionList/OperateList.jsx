import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Icon, Menu, MenuItem, Dialog, Tooltip } from 'ming-ui';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import update from 'immutability-helper';
import worksheetAjax from 'src/api/worksheet';
import DeleteOptionList from './DeleteOptionList';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';

const OperateWrap = styled(Menu)`
  &.optWrap {
    width: 160px !important;
  }
  .ming.MenuItem .Item-content:not(.disabled):hover {
    color: #333 !important;
    background-color: #f5f5f5 !important;
  }
  .ming.Item .Item-content:not(.disabled):hover .icon {
    color: #9e9e9e !important;
  }
  .del,
  .del .icon,
  .del.MenuItem .Item-content:not(.disabled):hover,
  .del.Item .Item-content:not(.disabled):hover .icon {
    color: #f44336 !important;
  }
`;

export default function OperateList(props) {
  const {
    status,
    index,
    projectId,
    appId,
    name,
    collectionId,
    colorful,
    enableScore,
    options = [],
    items = [],
    updateList = () => {},
  } = props;
  const [popupVisible, setPopupVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [showOtherWorksheet, setShowOtherWorksheet] = useState(false);
  const [controls, setControls] = useState([]);
  const [dataInfo, setDataInfo] = useState({});

  const onDelete = async collectionId => {
    const res = await worksheetAjax.getQuoteControlsById({ collectionId });
    const { code, msg, data = [] } = res;

    if (code !== 1) return alert(msg);

    setPopupVisible(false);
    // 没有字段引用的选项集直接删,否则需要二次确认
    if (_.isEmpty(data)) {
      Dialog.confirm({
        title: (
          <span className="Bold" style={{ color: '#f44336' }}>
            {_l('删除选项集 “%0”', name)}
          </span>
        ),
        buttonType: 'danger',
        description: <span className="Gray">{_l('此选项集未被任何选项字段引用，删除后不可恢复、不可再被引用。')}</span>,
        onOk: () => {
          deleteOptions({
            status: 999,
            fail: () => alert(_l('删除失败'), 2),
          });
        },
      });
    } else {
      const obj = {};
      data.forEach(item => {
        if (!obj[item.appId]) {
          obj[item.appId] = { appId: item.appId, appName: item.appName, data: [].concat(item) };
        } else {
          obj[item.appId].data.push(item);
        }
      });
      setDataInfo(obj);
      setControls(data);
      setPopupVisible(false);
      setDeleteConfirmVisible(true);
    }
  };

  // 删除/停用选项集
  const deleteOptions = ({ status, fail = () => {} }) => {
    worksheetAjax.deleteOptionsCollection({ appId, collectionId, status }).then(({ data }) => {
      if (data) {
        const nextItems = update(items, { $splice: [[index, 1]] });
        updateList(nextItems);
      } else {
        fail();
      }
    });
  };

  // 移动至其他应用
  const removeOtherApp = selectedAppId => {
    worksheetAjax.updateOptionsCollectionAppId({ appId: selectedAppId, collectionId }).then(res => {
      if (res && selectedAppId !== appId) {
        const nextItems = update(items, { $splice: [[index, 1]] });
        updateList(nextItems);
      }
    });
  };

  // 复制
  const handleCopy = () => {
    setPopupVisible(false);

    const params = {
      projectId,
      options,
      appId,
      colorful,
      name: name + '-' + _l('复制'),
      enableScore,
      status,
    };
    worksheetAjax.saveOptionsCollection(params).then(({ code, data, msg }) => {
      if (code === 1) {
        items.splice(index + 1, 0, data);
        updateList(items);
      } else {
        alert(msg);
      }
    });
  };

  return (
    <Fragment>
      <Trigger
        action={['click']}
        popupVisible={popupVisible}
        onPopupVisibleChange={setPopupVisible}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [-160, 0],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
        popup={
          <OperateWrap className="optWrap" onClick={e => e.stopPropagation()}>
            <MenuItem icon={<Icon icon="content-copy" className="Font16" />} onClick={handleCopy}>
              {_l('复制')}
            </MenuItem>
            <MenuItem
              icon={<Icon icon="swap_horiz" className="Font18" />}
              onClick={() => {
                setPopupVisible(false);
                setShowOtherWorksheet(true);
              }}
            >
              {_l('移动至其他应用')}
            </MenuItem>
            <Tooltip
              text={
                status === 9 ? _l('启用后支持被新字段引用') : _l('停用不影响已引用字段的使用，但是新字段无法再引用')
              }
            >
              <MenuItem
                icon={
                  <Icon icon={status === 9 ? 'play_circle_outline' : 'arrow_drop_down_circle'} className="Font18" />
                }
                onClick={() => {
                  setPopupVisible(false);
                  deleteOptions({
                    status: status === 9 ? 1 : 9,
                    fail: () => alert(status === 9 ? _l('启用失败') : _l('停用失败'), 2),
                  });
                }}
              >
                {status === 9 ? _l('启用') : _l('停用')}
              </MenuItem>
            </Tooltip>
            <MenuItem
              className="del"
              icon={<Icon icon="hr_delete" className="Font18" />}
              onClick={() => onDelete(collectionId)}
            >
              {_l('删除')}
            </MenuItem>
          </OperateWrap>
        }
      >
        <Icon
          icon="more_horiz"
          className="Gray_9e ThemeHoverColor3 Font16 pointer mLeft16"
          onClick={e => e.stopPropagation()}
        />
      </Trigger>

      {deleteConfirmVisible && (
        <DeleteOptionList
          {...props}
          controls={controls}
          dataInfo={dataInfo}
          onOk={() => setDeleteConfirmVisible(false)}
          onCancel={() => setDeleteConfirmVisible(false)}
        />
      )}

      {showOtherWorksheet && (
        <SelectOtherWorksheetDialog
          visible
          title={_l('移动至其他应用')}
          description={
            <span className="Gray_75">
              {_l('将选项集移动至其他应用。移动后，目标应用的管理员和开发者可以管理、引用选项集。')}
            </span>
          }
          onlyApp
          hideAppLabel
          projectId={projectId}
          selectedAppId={appId}
          currentAppId={appId}
          onHide={setShowOtherWorksheet}
          onOk={removeOtherApp}
        />
      )}
    </Fragment>
  );
}
