import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Modal } from 'antd-mobile';
import { Dialog, ScrollView, Icon, LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import moment from 'moment';
import RecordDetail from './RecordDetail';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import { canSubmitByLimitFrequency } from './utils';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import cx from 'classnames';
import { handlePrePayOrder } from '../Admin/pay/PrePayorder';

const ModalWrapper = styled(Modal)`
  height: 100%;
  .am-modal-body {
    display: flex;
    flex-direction: column;
    background: #f8f8f8;
    color: unset !important;

    .recordHeader {
      display: flex;
      align-items: center;
      height: 54px;
      min-height: 54px;
      background: #fff;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
      border-radius: 3px 3px 0px 0px;

      .arrowIcon {
        font-size: 20px;
        color: #757575;
        margin-left: 14px;
        cursor: pointer;
      }
    }
  }
`;

const DividerLine = styled.div`
  border-right: 2px solid #bdbdbd;
  margin: 0 16px;
  height: 15px;
`;

const MyWriteButton = styled.div(
  ({ themeBgColor, isMobile }) => `
    width: ${isMobile ? '100%' : 'fit-content'};
    background: ${getRgbaByColor(themeBgColor, 0.05)};
    height: 32px;
    padding: 0 12px;
    margin-bottom: 20px;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
    span {
      line-height: 32px;
      font-weight: 600;
      font-size: 14px;
    }
    :hover {
      background: ${getRgbaByColor(themeBgColor, 0.1)};
    }
`,
);

export default function FilledRecord(props) {
  const { isFillPage, publicWorksheetInfo, formData } = props;
  const {
    appId,
    worksheetId,
    abilityExpand = {},
    writeScope,
    shareId,
    limitWriteFrequencySetting,
    themeBgColor,
  } = publicWorksheetInfo;
  const isMobile = browserIsMobile();
  const [recordDetail, setRecordDetail] = useState({ visible: false });
  const [filledRecord, setFilledRecord] = useSetState({ list: [], count: 0, isPayOrder: false });
  const [listDialogVisible, setListDialogVisible] = useState(false);
  const [fetchState, setFetchState] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
  });
  const titleControl = formData.filter(c => c.attribute === 1)[0] || {};

  useEffect(() => {
    !!_.get(abilityExpand, 'allowViewChange.isAllowViewChange') &&
      (writeScope !== 1 || window.isWeiXin) &&
      onFetchFilledRecordList();
  }, [fetchState.loading, fetchState.pageIndex]);

  const onFetchFilledRecordList = () => {
    if (!fetchState.loading) return;
    const queryParams = {
      appId,
      pageIndex: fetchState.pageIndex,
      pageSize: 50,
      keyWords: '',
      fastFilters: [],
      navGroupFilters: [],
      sortControls: [],
      notGetTotal: true,
      searchType: 1,
      status: 1,
    };
    publicWorksheetAjax.queryHistoryRows(queryParams).then(res => {
      if (res.resultCode === 1) {
        setFilledRecord({
          list: fetchState.pageIndex > 1 ? filledRecord.list.concat(res.data) : res.data,
          count: res.count,
          isPayOrder: res.isPayOrder,
        });
        setFetchState({ loading: false, noMore: res.data.length < 50 });
      }
    });
  };

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  const isAllowEdit = createTime => {
    if (abilityExpand.allowViewChange.switchViewChange === 2) {
      if (
        !_.isEmpty(abilityExpand.allowViewChange.changeSetting) &&
        abilityExpand.allowViewChange.changeSetting.changeType === 2
      ) {
        const expireTime = abilityExpand.allowViewChange.changeSetting.expireTime;
        const durationHour = moment().diff(moment(createTime), 'hours');
        return durationHour < expireTime;
      }
      return true;
    }
    return false;
  };

  const onDeleteRow = rowId => {
    publicWorksheetAjax.deleteWorksheetRows({ appId, rowId }).then(res => {
      if (res.isSuccess) {
        const list = filledRecord.list.filter(item => item.rowid !== rowId);
        setFilledRecord({ list, count: filledRecord.count - 1 });
        alert(_l('删除成功'));
      } else {
        alert(_l('删除失败'), 2);
      }
    });
  };

  const onDeleteRecord = rowId => {
    isMobile
      ? Modal.alert(_l('确认删除该填写记录吗?'), '', [
          {
            text: _l('取消'),
            style: { color: '#2196F3' },
            onPress: () => {},
          },
          {
            text: _l('删除'),
            style: { color: 'red' },
            onPress: () => onDeleteRow(rowId),
          },
        ])
      : Dialog.confirm({
          title: _l('删除记录'),
          buttonType: 'danger',
          description: _l('删除后将不可恢复，确认删除吗？'),
          onOk: () => onDeleteRow(rowId),
        });
  };

  const onUpdateRecord = (rowId, updateObj) => {
    const newRecordList = filledRecord.list.map(item => {
      return item.rowid === rowId ? { ...item, ...updateObj } : item;
    });
    setFilledRecord({ list: newRecordList });
  };

  const getOrderStatus = orderStatus => {
    if (!filledRecord.isPayOrder && orderStatus === 0) {
      return _l('订单已失效');
    }
    switch (orderStatus) {
      case 1:
        return _l('已支付');
      case 2:
        return _l('退款中');
      case 3:
        return _l('已退款');
      case 4:
        return _l('支付超时');
      case 5:
        return _l('部分退款');
      default:
        return _l('待支付');
    }
  };

  const renderRecordList = () => {
    return (
      <React.Fragment>
        <ScrollView className="flex" onScrollEnd={onScrollEnd}>
          {filledRecord.list.map(item => {
            return (
              <div
                className="recordItem"
                onClick={() =>
                  setRecordDetail({
                    visible: true,
                    isEdit: isMobile ? isAllowEdit(item.ctime) && item.allowedit : false,
                    rowId: item.rowid,
                  })
                }
              >
                <div
                  title={item[titleControl.controlId || ''] || _l('未命名')}
                  className="flex TxtLeft Font17 overflow_ellipsis bold"
                >
                  {!_.includes([21, 26, 27, 48], titleControl.type)
                    ? getTitleTextFromControls(formData, item, undefined, { noMask: true })
                    : _l('未命名')}
                </div>

                <div className={cx('recordFooter', { isMobile })}>
                  <div title={item.ctime} className="overflow_ellipsis">
                    <span className="Gray_75">{_l('提交时间')}</span>
                    <span className="mLeft10">{item.ctime}</span>
                  </div>

                  {(!_.isUndefined(item.orderStatus) || filledRecord.isPayOrder) && (
                    <div className="statusWrapper">
                      <span className="Gray_75">{_l('订单状态')}</span>
                      <span
                        className={cx('mLeft10', {
                          ThemeColor: [0, undefined].includes(item.orderStatus),
                          Success: [1, 3].includes(item.orderStatus),
                          Warning: [2, 5].includes(item.orderStatus),
                          Red: item.orderStatus === 4 || (!filledRecord.isPayOrder && item.orderStatus === 0), //订单待支付，但关闭了支付
                        })}
                      >
                        {getOrderStatus(item.orderStatus)}
                      </span>
                    </div>
                  )}

                  <div className="btnWrapper">
                    {filledRecord.isPayOrder && [0, undefined].includes(item.orderStatus) && (
                      <div
                        className="operateBtn"
                        onClick={e => {
                          e.stopPropagation();
                          item.orderId && isMobile
                            ? (location.href = `${md.global.Config.WebUrl}orderpay/${item.orderId}`)
                            : handlePrePayOrder({
                                worksheetId,
                                rowId: item.rowid,
                                paymentModule: 1,
                                orderId: item.orderId,
                                sheetThemeColor: themeBgColor,
                                onUpdateSuccess: updateObj => {
                                  onUpdateRecord(item.rowid, updateObj);
                                },
                              });
                        }}
                      >
                        {_l('支付')}
                      </div>
                    )}
                    {isAllowEdit(item.ctime) && item.allowedit && !isMobile && (
                      <div
                        className="edit operateBtn"
                        onClick={e => {
                          e.stopPropagation();
                          setRecordDetail({ visible: true, isEdit: true, rowId: item.rowid });
                        }}
                      >
                        {_l('编辑')}
                      </div>
                    )}
                    {isAllowEdit(item.ctime) && item.allowdelete && (
                      <div
                        className="delete operateBtn"
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteRecord(item.rowid);
                        }}
                      >
                        {_l('删除')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollView>
        {fetchState.pageSize > 0 && fetchState.loading && <LoadDiv className="mTop10" />}
      </React.Fragment>
    );
  };
  const canSubmitByLimit = canSubmitByLimitFrequency(shareId, limitWriteFrequencySetting);
  return _.get(abilityExpand, 'allowViewChange.isAllowViewChange') ? (
    <React.Fragment>
      {isFillPage && !!filledRecord.count && (
        <MyWriteButton
          isMobile={isMobile}
          themeBgColor={themeBgColor}
          onClick={() => {
            setListDialogVisible(true);
            setFetchState({ loading: true, pageIndex: 1 });
          }}
        >
          <span style={{ color: themeBgColor }}>{_l('我的填写')}</span>
          <span className="mLeft10" style={{ color: themeBgColor }}>
            {filledRecord.count}
          </span>
        </MyWriteButton>
      )}
      {!isFillPage && !!filledRecord.count && (
        <React.Fragment>
          <span
            className="Hand"
            onClick={() => {
              setListDialogVisible(true);
              setFetchState({ loading: true, pageIndex: 1 });
            }}
          >
            {_l('查看填写记录')}
          </span>
          {canSubmitByLimit && <DividerLine />}
        </React.Fragment>
      )}
      {isMobile ? (
        <ModalWrapper
          popup
          visible={listDialogVisible}
          className="filledRecordDialog"
          onClose={() => setListDialogVisible(false)}
        >
          <div className="recordHeader">
            <Icon icon="arrow_back" className="arrowIcon" onClick={() => setListDialogVisible(false)} />
            <span className="Font15 Gray bold mLeft10">{_l('已填记录')}</span>
          </div>
          {renderRecordList()}
        </ModalWrapper>
      ) : (
        <Dialog
          visible={listDialogVisible}
          type="fixed"
          className="filledRecordDialog"
          title={_l('已填记录')}
          width={1100}
          showFooter={false}
          onCancel={() => setListDialogVisible(false)}
        >
          {renderRecordList()}
        </Dialog>
      )}

      {recordDetail.visible && (
        <RecordDetail
          rowId={recordDetail.rowId}
          isEdit={recordDetail.isEdit}
          onClose={() => setRecordDetail({ visible: false })}
          publicWorksheetInfo={publicWorksheetInfo}
          onRefreshList={(recordId, data) => onUpdateRecord(recordId, data)}
        />
      )}
    </React.Fragment>
  ) : null;
}
