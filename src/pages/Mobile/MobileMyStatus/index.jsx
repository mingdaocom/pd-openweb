import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Button, Popup } from 'antd-mobile';
import _ from 'lodash';
import moment from 'moment';
import filterXss from 'xss';
import { Icon, Input } from 'ming-ui';
import personalStyleApi from 'src/api/personalStyle';
import MobileDatePicker from 'src/ming-ui/components/MobileDatePicker';
import { dateOptions, defaultStatusInfo } from 'src/pages/chat/components/MyStatus/config';
import PersonalStatus from 'src/pages/chat/components/MyStatus/PersonalStatus';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import './index.less';

export default function MobileMyStatus() {
  const [
    {
      visible,
      loading,
      statusList,
      currentStatusId,
      onStatusOption,
      initialOnStatusOption,
      isEdit,
      startDateVisible,
      endDateVisible,
      updatedDateOption,
    },
    setData,
  ] = useSetState({
    visible: false,
    loading: true,
    statusList: [],
    currentStatusId: {},
    onStatusOption: {},
    initialOnStatusOption: {},
    isEdit: false,
    startDateVisible: false,
    endDateVisible: false,
    updatedDateOption: false,
  });
  const unsetStatus = _.isEmpty(onStatusOption);
  let promise = null;

  // 获取状态
  const getStatus = () => {
    personalStyleApi
      .getPersonalStatus({})
      .then(res => {
        // 默认状态 请假---明天 生病---明天 会议中---一小时 外出---一小时
        const options = (res.statusOptions || []).map(item => {
          if (defaultStatusInfo[item.statusId]) {
            return { ...item, ...defaultStatusInfo[item.statusId] };
          }
          return item;
        });
        const onStatusOption = _.get(res, 'onStatusOption') || {};

        setData({
          loading: false,
          statusList: options.map(item => {
            // 设置为新增状态时，将默认持续时间改为今天（避免设置过自定义时间过期后重新设置此状态提示‘正确设置持续时间’而无法设置）
            return {
              ...item,
              durationOption: _.includes(Object.keys(defaultStatusInfo), item.statusId) ? item.durationOption : 100,
            };
          }),
          currentStatusId: onStatusOption.statusId,
          onStatusOption,
          initialOnStatusOption: onStatusOption,
          isEdit: !_.isEmpty(onStatusOption),
        });
      })
      .catch(() => {
        setData({ loading: false });
      });
  };

  // 设置/修改状态
  const handleSettingStatus = () => {
    const options = isEdit ? onStatusOption : _.find(statusList, v => v.statusId === currentStatusId);
    const params = {
      statusId: options.statusId,
      beginTime: options.durationOption === 1000 ? options.beginTime : initialOnStatusOption.beginTime,
      endTime: options.durationOption === 1000 ? options.endTime : initialOnStatusOption.endTime,
      durationOption: options.durationOption,
      icon: options.icon,
      remark: options.remark,
    };

    if (!_.trim(params.remark)) {
      alert(_l('备注不能为空'), 3);
      return;
    }

    if (
      options.durationOption === 1000 &&
      (!options.beginTime || !options.endTime || moment(options.endTime).isBefore(moment()))
    ) {
      alert(_l('请正确设置持续时间'), 2);
      return;
    }

    if (promise && _.isFunction(promise.abort)) {
      promise.abort();
    }

    promise = personalStyleApi.setPersonalStatus(params);

    if (_.isEmpty(params)) {
      return;
    }

    promise.then(res => {
      if (res) {
        getStatus();
        alert(isEdit ? _l('修改完成') : _l('设置完成'));
        setData({ visible: false, isEdit: true, updatedDateOption: false });
      } else {
        alert(isEdit ? _l('修改失败') : _l('设置失败', 2), 2);
      }
    });
  };

  useEffect(() => {
    getStatus();
  }, []);

  if (loading) {
    return null;
  }

  // 设置状态
  const renderSetting = () => {
    return (
      <Fragment>
        <div className="header flexRow pLeft0 pRight0">
          <div className="flex">
            <div className="bold Font17 Gray_15">{_l('我的状态')}</div>
            <div className="Gray_75">{_l('设置您的个人状态，让所有协作的同事及时知晓')}</div>
          </div>
          <Icon
            className="Gray_9e Font17"
            icon="closeelement-bg-circle"
            onClick={() => setData({ visible: false, currentStatusId: unsetStatus ? undefined : currentStatusId })}
          />
        </div>

        <div className="flex statusListContainer">
          <div className="flexRow statusListWrap">
            {statusList.map(item => {
              return (
                <div
                  key={item.statusId}
                  className={`statusItem ${item.statusId === currentStatusId ? 'active' : ''}`}
                  onClick={() => setData({ currentStatusId: item.statusId })}
                >
                  <div
                    className="emojiWrap"
                    dangerouslySetInnerHTML={{ __html: filterXss(createLinksForMessage({ message: item.icon }), {}) }}
                  ></div>
                  <div className="remark bold w100 ellipsis TxtCenter">{item.remark}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Fragment>
    );
  };

  // 修改状态
  const renderEdit = () => {
    return (
      <Fragment>
        <div className="header flexRow pLeft0 pRight0">
          <div className="flex"></div>
          <Icon
            className="Gray_9e Font17"
            icon="closeelement-bg-circle"
            onClick={() =>
              setData({
                visible: false,
                currentStatusId: unsetStatus ? undefined : currentStatusId,
                onStatusOption: initialOnStatusOption,
                updatedDateOption: false,
              })
            }
          />
        </div>
        <div className="statusListWrap edit">
          <div className="statusItem">
            <div
              className="emojiWrap"
              dangerouslySetInnerHTML={{
                __html: filterXss(createLinksForMessage({ message: onStatusOption.icon }), {}),
              }}
            ></div>
            <div className="remark bold Font17 w100 ellipsis TxtCenter">{onStatusOption.remark}</div>
          </div>
        </div>
        <div className="flex">
          <div className="Gray bold Font14 mBottom10">{_l('让同事知道你现在的状态')}</div>
          <Input
            className={`w100 mBottom10 ${!onStatusOption.remark ? 'error' : ''}`}
            value={onStatusOption.remark}
            onChange={e => setData({ onStatusOption: { ...onStatusOption, remark: e } })}
          />
          <div className="bold Font14 mBottom10">{_l('持续时间')}</div>
          <div className="durationWrap">
            {dateOptions.map(item => (
              <div
                key={item.value}
                className={`durationItem ${onStatusOption.durationOption === item.value && updatedDateOption ? 'active' : ''}`}
                onClick={() =>
                  setData({
                    updatedDateOption: true,
                    onStatusOption: {
                      ...onStatusOption,
                      durationOption: item.value,
                      beginTime: item.value === 1000 ? undefined : onStatusOption.beginTime,
                      endTime: item.value === 1000 ? undefined : onStatusOption.endTime,
                    },
                  })
                }
              >
                <div className="flex">{item.value === 1000 ? _l('自定义') : item.label}</div>
              </div>
            ))}
          </div>
          {onStatusOption.durationOption === 1000 && (
            <div className="flexRow">
              <div className="start flex mRight5">
                <div className="mBottom8">{_l('开始')}</div>
                <div>
                  <div className="datePickerWrap">
                    <div className="flex ellipsis Font12" onClick={() => setData({ startDateVisible: true })}>
                      {onStatusOption.beginTime ? (
                        <span className="Gray_15">{moment(onStatusOption.beginTime).format('YYYY-MM-DD HH:mm')}</span>
                      ) : (
                        <span className="Gray_bd ">{_l('请选择')}</span>
                      )}
                    </div>
                    <Icon icon="arrow-right-border" className="Gray_9d" />
                  </div>
                  {startDateVisible && (
                    <MobileDatePicker
                      customHeader={_l('开始日期')}
                      precision="minite"
                      isOpen={startDateVisible}
                      value={onStatusOption.beginTime ? new Date(onStatusOption.beginTime) : new Date()}
                      min={new Date()}
                      max={new Date(onStatusOption.endTime)}
                      onClose={() => setData({ startDateVisible: false })}
                      onCancel={() =>
                        setData({ onStatusOption: { ...onStatusOption, beginTime: initialOnStatusOption.beginTime } })
                      }
                      onSelect={date => {
                        const value = moment(date).format('YYYY-MM-DD HH:mm:ss');
                        setData({ onStatusOption: { ...onStatusOption, beginTime: value }, startDateVisible: false });
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="end flex mLeft5">
                <div className="mBottom8">{_l('结束')}</div>
                <div>
                  <div className="datePickerWrap">
                    <div className="flex ellipsis Font12" onClick={() => setData({ endDateVisible: true })}>
                      {onStatusOption.endTime ? (
                        <span className="Gray_15">{moment(onStatusOption.endTime).format('YYYY-MM-DD HH:mm')}</span>
                      ) : (
                        <span className="Gray_bd ">{_l('请选择')}</span>
                      )}
                    </div>
                    <Icon icon="arrow-right-border" className="Gray_9d" />
                  </div>
                  {endDateVisible && (
                    <MobileDatePicker
                      customHeader={_l('结束日期')}
                      precision="minite"
                      min={new Date(onStatusOption.beginTime)}
                      isOpen={endDateVisible}
                      value={onStatusOption.endTime ? new Date(onStatusOption.endTime) : new Date()}
                      onClose={() => setData({ endDateVisible: false })}
                      onCancel={() =>
                        setData({ onStatusOption: { ...onStatusOption, endTime: initialOnStatusOption.endTime } })
                      }
                      onSelect={date => {
                        const value = moment(date).format('YYYY-MM-DD HH:mm:ss');
                        setData({ onStatusOption: { ...onStatusOption, endTime: value }, endDateVisible: false });
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!unsetStatus ? (
        <PersonalStatus
          accountId={md.global.Account.accountId}
          className="mobileOnStatusWrap noBorder"
          isSetting
          onStatusOption={onStatusOption}
          showCancel
          isMobile={true}
          onClick={() => setData({ visible: true, isEdit: true })}
          onCancel={() => setData({ onStatusOption: {}, currentStatusId: undefined })}
        />
      ) : (
        <div>
          <span className="mobileMyStatus mLeft10" onClick={() => setData({ visible: true, isEdit: false })}>
            <Icon icon="add_reaction" className="Font22 Gray_9e" />
            <span className="mLeft6 Font15 bold">{_l('添加您的个人状态')}</span>
          </span>
        </div>
      )}
      {visible && (
        <Popup
          visible={visible}
          onClose={() =>
            setData({
              visible: false,
              currentStatusId: unsetStatus ? undefined : currentStatusId,
              updatedDateOption: false,
            })
          }
          className="mobileMyStatusModal mobileModal topRadius minFull"
          bodyStyle={{ overflow: 'hidden' }}
        >
          {isEdit ? renderEdit() : renderSetting()}
          <Button
            className="footerBtn bold"
            color="primary"
            disabled={
              !currentStatusId || (isEdit && _.isEqual(onStatusOption, initialOnStatusOption) && !updatedDateOption)
            }
            onClick={handleSettingStatus}
          >
            {isEdit ? _l('修改状态') : _l('设置状态')}
          </Button>
        </Popup>
      )}
    </Fragment>
  );
}
