import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView, Support, SvgIcon } from 'ming-ui';
import { Button, Divider, Dropdown, Input, Modal, Switch } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import homeAppAjax from 'src/api/homeApp';
import AppSettingHeader from '../AppSettingHeader';
import EmptyStatus from '../EmptyStatus';
import './index.less';

export default function AppOfflineSubmit(props) {
  const { appId } = props;
  const [loading, setLoading] = useState(true);
  const [sheetData, setSheetData] = useState([]);
  const [offlineItems, setOfflineItems] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const offlineItemIds = offlineItems.map(v => v.worksheetId);
  const searchData = keyword
    ? sheetData.filter(v => v.workSheetName.toLowerCase().indexOf(_.trim(keyword).toLowerCase()) > -1)
    : [];
  const visibleSheetData = keyword ? searchData : sheetData;

  const getWorksheetList = useCallback(() => {
    homeAppAjax.getWorksheetsByAppId({ appId, type: 0 }).then(res => {
      setSheetData(res);
    });
  }, [appId]);

  // 获取离线应用项
  const getOfflineItems = useCallback(() => {
    appManagementAjax
      .getOfflineItems({ appId })
      .then(res => {
        setOfflineItems(res);
        setLoading(false);
      })
      .catch(() => {
        setOfflineItems([]);
        setLoading(false);
      });
  }, [appId]);

  // 添加离线应用项
  const addOfflineItem = worksheetId => {
    if (_.includes(offlineItemIds, worksheetId)) {
      return;
    }

    appManagementAjax.addOfflineItem({ appId, worksheetId }).then(res => {
      if (res) {
        getOfflineItems();
        alert(_l('操作成功'));
      } else {
        alert(_l('操作失败', 2));
      }
    });
  };

  // 编辑离线应用项
  const editOfflineItemStatus = (worksheetId, status) => {
    // status: 0=关闭 1=启用 2=删除
    appManagementAjax
      .editOfflineItemStatus({ appId, worksheetId, status: status === 1 ? 0 : status == 0 ? 1 : status })
      .then(res => {
        if (res) {
          let cloneItems = _.clone(offlineItems);

          if (status === 2) {
            cloneItems = cloneItems.filter(v => v.worksheetId !== worksheetId);
          } else {
            const index = _.findIndex(offlineItems, v => v.worksheetId === worksheetId);
            cloneItems[index] = { ...cloneItems[index], status: status === 1 ? 0 : 1 };
          }

          setOfflineItems(cloneItems);
        } else {
          alert(_l('操作失败', 2));
        }
      });
  };

  useEffect(() => {
    getWorksheetList();
    getOfflineItems();
  }, [getOfflineItems, getWorksheetList]);

  const renderSheetList = menu => {
    return (
      <div className="menuWrapper">
        <Input
          autoFocus
          variant="borderless"
          prefix={<i className="icon icon-search" />}
          placeholder={_l('搜索')}
          className="searchWrapper w100"
          value={keyword}
          onChange={event => setKeyword(event.target.value)}
        />
        <Divider className="mp0" />
        {visibleSheetData.length ? (
          menu
        ) : (
          <div className="TxtCenter textTertiary pTop10 pBottom10">{_l('没有搜索结果')}</div>
        )}
      </div>
    );
  };

  return (
    <div className="appOfflineSubmit flexColumn h100">
      <AppSettingHeader
        title={_l('APP离线提交')}
        customBtn={
          _.isEmpty(sheetData) ? null : (
            <Dropdown
              open={menuVisible}
              onOpenChange={(open, info) => {
                if (info?.source !== 'menu') {
                  setMenuVisible(open);
                }
              }}
              trigger={['click']}
              placement="bottomLeft"
              menu={{
                items: visibleSheetData.map(item => ({
                  key: item.workSheetId,
                  label: item.workSheetName,
                  extra: _.includes(offlineItemIds, item.workSheetId) ? (
                    <i className="icon icon-done Font18 colorPrimary" />
                  ) : undefined,
                  onClick: () => addOfflineItem(item.workSheetId),
                })),
                style: { width: 500, maxHeight: 300, overflowY: 'auto', boxShadow: 'none' },
              }}
              popupRender={renderSheetList}
            >
              <Button type="primary" shape="round" icon={<i className="icon icon-plus" />}>
                {_l('离线提交')}
              </Button>
            </Dropdown>
          )
        }
      />
      <div className="description">
        <div>{_l('1.支持App在无网络环境下完成数据录入，恢复网络后手动同步至服务器，确保数据的完整性和可靠性。')}</div>
        <div>
          {_l(
            '2.离线模式支持文本、数值、金额、邮箱、日期、时间、电话、附件、检查项、富文本、证件、定位、单选（静态数据）、多选（静态数据）、签名字段数据的录入。',
          )}
        </div>
        <div>
          {_l(
            '3.离线录入时，表单的业务规则、字段验证和权限控制都不生效。数据暂存本地，网络恢复后需手动提交，确保数据结构完整性。',
          )}
        </div>
        <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/appofflinesubmit" />
      </div>
      {loading ? (
        <LoadDiv />
      ) : _.isEmpty(offlineItems) ? (
        <EmptyStatus
          icon="offline"
          radiusSize={130}
          iconClassName="Font50"
          emptyTxt={_l('暂无离线提交')}
          emptyTxtClassName="textTertiary Font17 mTop20"
        />
      ) : (
        <div className="listWrapper">
          <div className="header textSecondary flexRow alignItemsCenter">
            <div className="name flex">{_l('工作表')}</div>
            <div className="operator">{_l('操作人')}</div>
            <div className="status">{_l('状态')}</div>
            <div className="action"></div>
          </div>
          <ScrollView className="flex">
            {offlineItems.map(item => {
              const { worksheetId, name, iconUrl, iconColor, status, operator = {} } = item;
              return (
                <div key={worksheetId} className="row flexRow alignItemsCenter">
                  <div className="name flex pLeft8 flexRow">
                    <SvgIcon addClassName="mTop3" url={iconUrl} fill={iconColor} size={20} />
                    <span className="Font14 mLeft12 flex ellipsis pRight10">{name}</span>
                  </div>
                  <div className="operator ellipsis pRight10">{operator.fullname}</div>
                  <div className="status">
                    <Switch
                      checked={status === 1}
                      onClick={(checked, event) => {
                        event.stopPropagation();
                        return editOfflineItemStatus(worksheetId, status);
                      }}
                    />
                  </div>
                  <div className="action">
                    <i
                      className="icon icon-trash Hand Font20"
                      onClick={() => {
                        Modal.confirm({
                          className: 'deleteOfflineItemDialog',
                          title: <span className="textError">{_l('是否确认删除？')}</span>,
                          okText: _l('删除'),
                          okButtonProps: { danger: true },
                          onOk: () => editOfflineItemStatus(worksheetId, 2),
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </ScrollView>
        </div>
      )}
    </div>
  );
}
