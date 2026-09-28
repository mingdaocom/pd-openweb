import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Drawer, Modal } from 'ming-ui/antd-components';
import scheduleConfigApi from 'src/pages/integration/api/scheduleConfig.js';
import TimingSetting from 'src/pages/integration/dataIntegration/components/TimingSetting';

const TimingSettingListWrapper = styled.div`
  background: var(--color-background-primary);
  min-height: 100%;
  padding: 40px 80px;

  .listItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 15px 8px;
    border-bottom: 1px solid var(--color-border-secondary);

    &.notHeader {
      .tableName {
        cursor: pointer;
        font-weight: bold;
      }
      &:hover {
        background: var(--color-background-secondary);
        .tableName {
          color: var(--color-primary);
        }
      }
    }

    .tableName,
    .dbName,
    .readType {
      flex: 1;
      min-width: 0;
      padding-right: 8px;
    }
    .lastReadDate {
      width: 200px;
    }
    .operateColumn {
      width: 64px;
      cursor: pointer;
      .icon {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-error);
        }
      }
    }
  }
`;

const SettingDrawer = styled(({ className, rootClassName, width, height, size, ...props }) => (
  <Drawer
    rootClassName={[className, rootClassName].filter(Boolean).join(' ') || undefined}
    size={size ?? width ?? height}
    {...props}
  />
))`
  .hap-drawer-header {
    .hap-drawer-close {
      display: none;
    }
  }
`;

const NoDataWrapper = styled.div`
  text-align: center !important;
  .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    background: var(--color-background-secondary);
    border-radius: 50%;
    margin: 64px auto 0;
    color: var(--color-text-tertiary);
  }
`;

export default function TimingSettingList({ projectId, sourceId, onViewUseDetail }) {
  const [timingList, setTimingList] = useState([]);
  const [fetchState, setFetchState] = useSetState({ loading: true, pageNo: 0, noMore: false });
  const [settingDetail, setSettingDetail] = useState(null);

  useEffect(() => {
    onFetchTimingList();
  }, [fetchState.loading, fetchState.pageNo]);

  //获取定时设置列表
  const onFetchTimingList = () => {
    if (!fetchState.loading) return;

    scheduleConfigApi
      .list({ projectId, datasourceId: sourceId, pageNo: fetchState.pageNo, pageSize: 20 })
      .then(res => {
        if (res && _.isArray(res.content)) {
          setTimingList(fetchState.pageNo === 0 ? res.content : timingList.concat(res.content));
          setFetchState({ loading: false, noMore: res.content.length < 20 });
        }
      })
      .catch(() => setFetchState({ loading: false }));
  };

  const onScrollEnd = () => {
    if (fetchState.loading || fetchState.noMore) return;
    setFetchState({ loading: true, pageNo: fetchState.pageNo + 1 });
  };

  const onDelete = scheduleConfigId => {
    Modal.confirm({
      title: <span className="textError">{_l('删除')}</span>,
      content: _l('删除后，再使用此数据源表创建同步任务的时候，将会耗费更多的时间。'),
      okButtonProps: {
        danger: true,
      },
      onOk: () => {
        scheduleConfigApi
          .delete({
            projectId,
            scheduleConfigId,
          })
          .then(res => {
            if (res && !res.errorMsg && !res.errorMsgList) {
              alert(_l('删除成功'));
              setTimingList(timingList.filter(item => item.id !== scheduleConfigId));
            } else {
              if (res.resultCode === 800017) {
                const errorModal = Modal.confirm({
                  title: <span className="textError">{_l('删除失败')}</span>,
                  content: (
                    <React.Fragment>
                      <span>{_l('有正在被使用的同步任务，请在')}</span>
                      <span
                        className="mLeft5 mRight5 pointer colorPrimary hoverColorPrimaryDark"
                        onClick={() => {
                          errorModal.destroy();
                          onViewUseDetail();
                        }}
                      >
                        {_l('使用详情')}
                      </span>
                      <span>{_l('中查看')}</span>
                    </React.Fragment>
                  ),
                  okButtonProps: {
                    style: {
                      display: 'none',
                    },
                  },
                  cancelText: _l('关闭'),
                  wrapClassName: 'delErrorConfirm',
                });
              } else {
                alert(res.errorMsg || res.errorMsgList[0] || _l('删除失败'), 2);
              }
            }
          });
      },
    });
  };

  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <TimingSettingListWrapper>
        <div className="listItem">
          <div className="tableName">{_l('表名称')}</div>
          <div className="dbName">{_l('数据库')}</div>
          <div className="readType">{_l('读取方式')}</div>
          <div className="lastReadDate">{_l('最近一次读取时间')}</div>
          <div className="operateColumn"></div>
        </div>

        {fetchState.loading && fetchState.pageNo === 0 ? (
          <LoadDiv />
        ) : timingList.length > 0 ? (
          timingList.map((timingItem, i) => {
            return (
              <div key={i} className="listItem notHeader">
                <div className="tableName overflow_ellipsis" onClick={() => setSettingDetail(timingItem)}>
                  {timingItem.tableName}
                </div>
                <div className="dbName overflow_ellipsis">{timingItem.dbName}</div>
                <div className="readType overflow_ellipsis">
                  <span>
                    {timingItem.readIntervalType === 0 ? _l('每小时') : _l('每天%0', timingItem.readTime || '')}
                  </span>
                  {timingItem.readType === 0
                    ? _l('读取完整数据覆盖写入目的地')
                    : _l('依据字段 %0 更新数据', _.get(timingItem, 'config.basisField.name'))}
                </div>
                <div className="lastReadDate">
                  {timingItem.lastReadTime ? moment(timingItem.lastReadTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </div>
                <div className="operateColumn">
                  <Icon icon="trash" className="Font16" onClick={() => onDelete(timingItem.id)} />
                </div>
              </div>
            );
          })
        ) : (
          <NoDataWrapper>
            <span className="iconCon InlineBlock TxtCenter ">
              <i className="icon-storage Font64 TxtMiddle" />
            </span>
            <p className="textTertiary mTop20 mBottom0">{_l('暂无数据')}</p>
          </NoDataWrapper>
        )}

        {settingDetail && (
          <SettingDrawer
            open={true}
            width={600}
            placement="right"
            mask={false}
            title={_l('定时设置')}
            extra={<Icon icon="close" className="Font20 textTertiary Hand" onClick={() => setSettingDetail(null)} />}
            footer={null}
            onClose={() => setSettingDetail(null)}
          >
            <TimingSetting
              projectId={projectId}
              scheduleConfigId={settingDetail.id}
              sourceId={sourceId}
              dbName={settingDetail.dbName}
              schema={settingDetail.schema}
              tableName={settingDetail.tableName}
              onClose={() => setSettingDetail(null)}
              onUpdateSuccess={setting => {
                const newList = timingList.map(item =>
                  item.id === setting.id ? { ...item, ..._.pick(setting, ['readIntervalType', 'readTime']) } : item,
                );
                setTimingList(newList);
              }}
            />
          </SettingDrawer>
        )}
      </TimingSettingListWrapper>
    </ScrollView>
  );
}
