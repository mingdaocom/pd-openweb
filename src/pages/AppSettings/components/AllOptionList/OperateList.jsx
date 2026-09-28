import React, { Fragment, useState } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import DeleteOptionList from './DeleteOptionList';

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
      Modal.confirm({
        title: (
          <span
            style={{
              color: 'var(--color-error)',
              wordBreak: 'break-all',
            }}
            className="textError"
          >
            {_l('删除选项集 “%0”', name)}
          </span>
        ),
        okButtonProps: {
          danger: true,
        },
        content: (
          <span className="textPrimary">{_l('此选项集未被任何选项字段引用，删除后不可恢复、不可再被引用。')}</span>
        ),
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
        updateList(update(items, { $splice: [[index + 1, 0, data]] }));
      } else {
        alert(msg);
      }
    });
  };

  const handleMenuClick = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    setPopupVisible(false);

    if (key === 'copy') {
      handleCopy();
    } else if (key === 'move') {
      setShowOtherWorksheet(true);
    } else if (key === 'toggleStatus') {
      deleteOptions({
        status: status === 9 ? 1 : 9,
        fail: () => alert(status === 9 ? _l('启用失败') : _l('停用失败'), 2),
      });
    } else if (key === 'delete') {
      onDelete(collectionId);
    }
  };

  const menuItems = [
    {
      key: 'copy',
      icon: <Icon icon="content-copy" className="Font16 textTertiary" />,
      label: _l('复制'),
    },
    {
      key: 'move',
      icon: <Icon icon="swap_horiz" className="Font18 textTertiary" />,
      label: _l('移动至其他应用'),
    },
    {
      key: 'toggleStatus',
      icon: (
        <Icon icon={status === 9 ? 'play_circle_outline' : 'arrow_drop_down_circle'} className="Font18 textTertiary" />
      ),
      label: (
        <Tooltip
          title={status === 9 ? _l('启用后支持被新字段引用') : _l('停用不影响已引用字段的使用，但是新字段无法再引用')}
        >
          <div>{status === 9 ? _l('启用') : _l('停用')}</div>
        </Tooltip>
      ),
    },
    {
      key: 'delete',
      danger: true,
      icon: <Icon icon="hr_delete" className="Font18" />,
      label: _l('删除'),
    },
  ];

  return (
    <Fragment>
      <Dropdown
        trigger={['click']}
        open={popupVisible}
        onOpenChange={setPopupVisible}
        placement="bottomRight"
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
          style: { minWidth: 160 },
        }}
      >
        <Icon
          icon="more_horiz"
          className="textTertiary hoverColorPrimary Font16 pointer mLeft16"
          onClick={e => e.stopPropagation()}
        />
      </Dropdown>

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
            <span className="textSecondary">
              {_l('将选项集移动至其他应用。移动后，目标应用的管理员和开发者可以管理、引用选项集。')}
            </span>
          }
          onlyApp
          hideAppLabel
          projectId={projectId}
          selectedAppId={appId}
          currentAppId={appId}
          onHide={() => setShowOtherWorksheet(false)}
          onOk={removeOtherApp}
        />
      )}
    </Fragment>
  );
}
