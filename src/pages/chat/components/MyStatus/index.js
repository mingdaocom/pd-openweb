import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import filterXss from 'xss';
import { Button, Dialog, Icon, Input } from 'ming-ui';
import personalStyleApi from 'src/api/personalStyle';
import Emotion from 'src/components/emotion/emotion';
import createLinksForMessage from 'src/utils/createLinksForMessage';
import { dateOptions, defaultStatusInfo } from './config';
import CustomDatePicker from './CustomDatePicker';
import PersonalStatus from './PersonalStatus';

const DialogWrap = styled(Dialog)`
  .Gray_15 {
    color: #151515;
  }
  .listWrap {
    overflow: hidden;
  }
  .statusItem {
    padding: 12px 16px 12px 7px;
    border-radius: 4px;
    .icon-delete1 {
      display: none;
    }

    .emojiWrap {
      width: 40px;
      height: 40px;
      margin-right: 8px;
      overflow: hidden;
      border-radius: 3px;
      padding-left: 8px;
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
      img {
        width: 24px;
        height: 24px;
      }
      .editIcon {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fff;
        text-align: center;
        line-height: 18px;
        right: 2px;
        bottom: 2px;
        display: none;
      }
    }

    &:hover {
      background-color: #f5f5f5;
      .icon-delete1 {
        display: inline;
      }
    }
    &.active {
      background: rgba(25, 150, 239, 0.03);
      border: 1px solid #1996ef;
      .editIcon {
        display: block !important;
      }
      &:hover {
        background: rgba(25, 150, 239, 0.03);
        border: 1px solid #1996ef;
        .transparentBg {
          background: transparent;
        }
      }
    }
  }

  .statusItemName {
    word-break: break-all;
    min-height: 20px;
  }
  .formWrap {
    border-bottom: 1px solid #ddd;
  }

  .formItemInput {
    .Input.error {
      border-color: #ff0000;
    }
  }
`;

export default function MyStatus() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [visible, setVisible] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState();
  const currentStatus = statusList[currentIndex] || {};
  const { statusOptions } = data;
  const emotionRefs = useRef([]);

  const initEmotion = () => {
    emotionRefs.current.forEach((ref, refIndex) => {
      if (ref) {
        new Emotion(ref, {
          defaultTab: 2,
          divEditor: false,
          historySize: 30,
          autoHide: true,
          mdBear: false,
          showAru: false,
          history: false,
          hideClassic: true,
          placement: 'left bottom',
          onSelect: (name, value, emotionText) => {
            setCurrentIndex(refIndex);
            setStatusList(prevList => {
              const copyList = _.cloneDeep(prevList);
              copyList[refIndex].icon = emotionText || name;
              return copyList;
            });
          },
        });
      }
    });
  };

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

        res.statusOptions = options;
        setLoading(false);
        setData(res);
        setStatusList(options);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 添加状态
  const addStatus = () => {
    const copyList = _.cloneDeep(statusList);
    const status = {
      statusId: 'new_id',
      remark: _l('请勿打扰'),
      icon: '📃',
      durationOption: 10,
    };
    setCurrentIndex(statusList.length);
    setStatusList(copyList.concat(status));
    setTimeout(() => {
      initEmotion();
    }, 0);
  };

  // 删除状态
  const deleteStatus = (e, statusId) => {
    e.stopPropagation();
    Dialog.confirm({
      title: _l('确认删除此状态？'),
      description: _l('状态删除后，无法恢复'),
      removeCancelBtn: true,
      buttonType: 'danger',
      onOk: () => {
        const copyList = _.cloneDeep(statusList);
        if (statusId === 'new_id') {
          alert(_l('删除成功'));
          setStatusList(copyList.filter(item => item.statusId !== statusId));
        } else {
          personalStyleApi.deletePersonalStatus({ statusId }).then(res => {
            if (res) {
              alert(_l('删除成功'));
              getStatus();
            } else {
              alert(_l('删除失败'), 2);
            }
          });
        }
      },
    });
  };

  // 添加/修改&设置个人状态
  const saveStatus = async () => {
    const isNew = currentStatus.statusId === 'new_id';

    if (!_.trim(currentStatus.remark)) {
      alert(_l('备注不能为空'), 3);
      return;
    }

    const originalStatus = _.find(statusOptions, v => v.statusId === currentStatus.statusId) || {};
    const params = {
      statusId: isNew ? '' : currentStatus.statusId,
      icon: currentStatus.icon,
      remark: currentStatus.remark,
      beginTime: currentStatus.durationOption === 1000 ? currentStatus.beginTime : originalStatus.beginTime,
      endTime: currentStatus.durationOption === 1000 ? currentStatus.endTime : originalStatus.endTime,
      durationOption: currentStatus.durationOption,
    };

    const updateRes = isNew ? await personalStyleApi.addOrUpdateStatus(params) : {};
    const { statusId } = updateRes;
    if (statusId) {
      params.statusId = statusId;
    }

    if (
      params.durationOption === 1000 &&
      (!params.beginTime || !params.endTime || moment(params.endTime).isBefore(moment()))
    ) {
      alert(_l('请正确设置持续时间'), 2);
      return;
    }

    personalStyleApi.setPersonalStatus(params).then(res => {
      if (res) {
        getStatus();
        setVisible(false);
        setCurrentIndex();
        alert(_l('设置成功'));
      } else {
        alert(_l('设置失败'), 2);
      }
    });
  };

  useEffect(() => {
    getStatus();
  }, []);

  useEffect(() => {
    if (!visible) return;
    initEmotion();
    setStatusList(data.statusOptions || []);
  }, [visible]);

  if (loading) {
    return null;
  }

  return (
    <Fragment>
      {data.onStatusOption && data.onStatusOption.endTime && moment(data.onStatusOption.endTime).isAfter(moment()) ? (
        <PersonalStatus
          className="accountStatus Hand hover"
          isSetting
          accountId={md.global.Account.accountId}
          showCancel={true}
          onStatusOption={data.onStatusOption}
          onClick={() => setVisible(true)}
          onCancel={() => {
            setCurrentIndex();
            setData({ ...data, onStatusOption: null });
          }}
        />
      ) : (
        <div className="accountStatus flexRow alignItemsCenter" onClick={() => setVisible(true)}>
          <Icon icon="add_reaction" className="Font16 Gray_9e" />
          <div className="Font14 Gray_75 mLeft10">{_l('添加您的个人状态')}</div>
        </div>
      )}
      <DialogWrap
        visible={visible}
        width={492}
        title={_l('我的状态')}
        onCancel={() => {
          setVisible(false);
          setCurrentIndex();
        }}
        okDisabled={_.isEmpty(currentStatus)}
        footer={
          <div className="flexRow alignItemsCenter">
            {_.every(statusList, v => v.statusId !== 'new_id') && (
              <div className="flexRow alignItemsCenter Gray_9e Font14 Hand" onClick={addStatus}>
                <Icon icon="plus" className="mRight5" />
                <div className="Font14 Gray_75">{_l('添加状态')}</div>
              </div>
            )}
            <div className="flex"></div>
            <Button type="primary" disabled={_.isEmpty(currentStatus)} onClick={saveStatus}>
              {_l('确认')}
            </Button>
          </div>
        }
      >
        <div className="mBottom10">{_l('设置您的个人状态，让所有协作的同事及时知晓')}</div>
        <div className="listWrap">
          {statusList.map((item, index) => {
            const isDefaultStatus = index < 4;

            return (
              <div key={item.statusId}>
                <div
                  className={cx('statusItem flexRow alignItemsCenter Hand', {
                    active: item.statusId === currentStatus.statusId,
                  })}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div
                    className={cx('emojiWrap flexRow alignItemsCenter Relative', {
                      transparentBg: defaultStatusInfo[item.statusId],
                    })}
                    ref={el => (!isDefaultStatus ? (emotionRefs.current[index] = el) : null)}
                    onClick={e => !isDefaultStatus && e.stopPropagation()}
                  >
                    <span
                      className="singeText paddingLeft27"
                      dangerouslySetInnerHTML={{
                        __html: filterXss(createLinksForMessage({ message: item.icon }), {}),
                      }}
                    ></span>
                    {!isDefaultStatus && (
                      <div className="Absolute editIcon">
                        <Icon icon="edit" className="Gray_bd Font14" />
                      </div>
                    )}
                  </div>
                  <div className="flex minWidth0">
                    <div className="statusItemName Font14 Gray_15 mBottom3">{item.remark}</div>
                    <div className="statusItemDate Gray_75">
                      {item.durationOption == 1000
                        ? ''
                        : (_.find(dateOptions, v => v.value == item.durationOption) || {}).label}
                    </div>
                  </div>
                  {!_.includes(Object.keys(defaultStatusInfo), item.statusId) && (
                    <Icon icon="delete1" className="Red Font16 Hand" onClick={e => deleteStatus(e, item.statusId)} />
                  )}
                </div>
                {currentStatus.statusId === item.statusId && (
                  <div className="formWrap mTop10 pBottom20">
                    <div className="formItem mBottom20">
                      <div className="formItemLabel mBottom8">{_l('持续时间')}</div>
                      <div className="formItemInput">
                        <CustomDatePicker
                          {...item}
                          changeDate={({ startDate, endDate, fixedValue }) => {
                            const copyList = _.cloneDeep(statusList);
                            const obj = copyList[index] || {};
                            copyList[index] = {
                              ...obj,
                              durationOption: fixedValue || obj.durationOption,
                              beginTime: startDate ? startDate.format('YYYY-MM-DD HH:mm:ss') : obj.startDate,
                              endTime: endDate ? endDate.format('YYYY-MM-DD HH:mm:ss') : obj.endTime,
                            };
                            setStatusList(copyList);
                          }}
                        />
                      </div>
                    </div>
                    <div className="formItem">
                      <div className="formItemLabel mBottom8">{_l('备注')}</div>
                      <div className="formItemInput">
                        <Input
                          className={`w100 ${currentStatus.statusId === item.statusId && !currentStatus.remark ? 'error' : ''}`}
                          value={item.remark}
                          onChange={val => {
                            const copyList = _.cloneDeep(statusList);
                            copyList[index] = { ...copyList[index], remark: val };
                            setStatusList(copyList);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogWrap>
    </Fragment>
  );
}
