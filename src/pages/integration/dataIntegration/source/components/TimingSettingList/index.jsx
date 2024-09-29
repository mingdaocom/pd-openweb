import React, { useState, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import moment from 'moment';
import { Icon, ScrollView, LoadDiv, Dialog } from 'ming-ui';
import { Drawer } from 'antd';
import syncTaskApi from '../../../../api/syncTask';
import TimingSetting from 'src/pages/integration/dataIntegration/components/TimingSetting';

const TimingSettingListWrapper = styled.div`
  background: #fff;
  min-height: 100%;
  padding: 40px 80px;

  .listItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 15px 8px;
    border-bottom: 1px solid #e0e0e0;

    &.notHeader {
      .sheetName {
        cursor: pointer;
        font-weight: bold;
      }
      &:hover {
        background: #f7f7f7;
        .sheetName {
          color: #2196f3;
        }
      }
    }

    .sheetName {
      flex: 1;
      min-width: 0;
      padding-right: 8px;
    }
    .readType {
      width: 360px;
    }
    .latestReadTime {
      width: 200px;
    }
    .operateColumn {
      width: 64px;
      cursor: pointer;
      .icon {
        color: #9e9e9e;
        &:hover {
          color: #f44336;
        }
      }
    }
  }
`;

const SettingDrawer = styled(Drawer)`
  .ant-drawer-header {
    .ant-drawer-close {
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
    background: #fbfbfb;
    border-radius: 50%;
    margin: 64px auto 0;
    color: #9e9e9e;
  }
`;

export default function TimingSettingList({ projectId, sourceId }) {
  const [timingList, setTimingList] = useState([]);
  const [loadingState, setLoadingState] = useSetState({ loading: false, pageNo: 0, noMore: false });
  const [settingDetail, setSettingDetail] = useState(null);

  useEffect(() => {
    //获取定时设置列表
    setLoadingState({ loading: true });

    const tempData = [
      {
        id: 1,
        sheetName: _l('订单'),
        readType: 1,
        latestReadTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        canDelete: true,
      },
      { id: 2, sheetName: _l('erp_orders'), readType: 2, latestReadTime: moment().format('YYYY-MM-DD HH:mm:ss') },
    ];

    setTimeout(() => {
      setTimingList(loadingState.pageNo === 0 ? tempData : timingList.concat(tempData));
      setLoadingState({ loading: false, noMore: tempData.length < 10 });
    }, 200);
  }, [loadingState.pageNo]);

  const onScrollEnd = () => {
    if (loadingState.loading || loadingState.noMore) return;
    setLoadingState({ loading: true, pageNo: loadingState.pageNo + 1 });
  };

  const onDelete = timingItem => {
    const confirmParas = timingItem.canDelete
      ? {
          title: _l('删除'),
          description: _l('删除后，再使用此数据源表创建同步任务的时候，将会耗费更多的时间。'),
          buttonType: 'danger',
          onOk: () => {},
        }
      : {
          title: _l('删除'),
          description: (
            <React.Fragment>
              <span>{_l('有正在被使用的同步任务，请在')}</span>
              <span className="mLeft5 mRight5 pointer ThemeColor3 ThemeHoverColor2" onClick={() => {}}>
                {_l('使用详情')}
              </span>
              <span>{_l('中查看')}</span>
            </React.Fragment>
          ),
          removeOkBtn: true,
          cancelText: _l('关闭'),
        };
    Dialog.confirm(confirmParas);
  };

  return (
    <ScrollView onScrollEnd={onScrollEnd}>
      <TimingSettingListWrapper>
        <div className="listItem">
          <div className="sheetName">{_l('表名称')}</div>
          <div className="readType">{_l('读取方式')}</div>
          <div className="latestReadTime">{_l('最近一次读取时间')}</div>
          <div className="operateColumn"></div>
        </div>

        {loadingState.loading && loadingState.pageNo === 0 && <LoadDiv />}

        {!loadingState.loading &&
          (timingList.length > 0 ? (
            timingList.map((timingItem, i) => {
              return (
                <div key={i} className="listItem notHeader">
                  <div className="sheetName overflow_ellipsis" onClick={() => setSettingDetail(timingItem)}>
                    {timingItem.sheetName}
                  </div>
                  <div className="readType">{timingItem.readType}</div>
                  <div className="latestReadTime">{timingItem.latestReadTime}</div>
                  <div className="operateColumn">
                    <Icon icon="delete1" className="Font16" onClick={() => onDelete(timingItem)} />
                  </div>
                </div>
              );
            })
          ) : (
            <NoDataWrapper>
              <span className="iconCon InlineBlock TxtCenter ">
                <i className="icon-storage Font64 TxtMiddle" />
              </span>
              <p className="Gray_9e mTop20 mBottom0">{_l('暂无数据')}</p>
            </NoDataWrapper>
          ))}

        {settingDetail && (
          <SettingDrawer
            visible={true}
            width={600}
            placement="right"
            mask={false}
            title={_l('定时设置')}
            extra={<Icon icon="close" className="Font20 Gray_9e Hand" onClick={() => setSettingDetail(null)} />}
            footer={null}
            onClose={() => setSettingDetail(null)}
          >
            <TimingSetting settingId={settingDetail.id} onClose={() => setSettingDetail(null)} />
          </SettingDrawer>
        )}
      </TimingSettingListWrapper>
    </ScrollView>
  );
}
