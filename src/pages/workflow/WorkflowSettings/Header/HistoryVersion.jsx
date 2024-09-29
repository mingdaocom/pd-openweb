import React, { Fragment, useEffect, useState } from 'react';
import { Icon, ScrollView, LoadDiv, Dialog, UserHead, MenuItem } from 'ming-ui';
import process from '../../api/process';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';
import { Tooltip } from 'antd';
import Trigger from 'rc-trigger';
import cx from 'classnames';

const HistoryBox = styled.span`
  border-bottom: 1px dashed #757575;
  cursor: pointer;
`;

const HistoryListBox = styled.div`
  padding: 12px 0px;
  width: 440px;
  display: flex;
  background: #fff;
  border-radius: 5px;
  box-shadow: 0 20px 24px 1px rgba(0, 0, 0, 0.1608);
  left: 12px;
  top: 67px;
  bottom: 12px;
  position: fixed;

  header {
    padding: 0 12px;
    height: 24px;
    margin-left: 9px;
  }

  .historyLine {
    background: #ddd;
    height: 1px;
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .red {
    &:hover {
      color: #ff0d0d !important;
    }
  }
`;

const HistoryListCon = styled.div`
  padding: 0 12px;
`;

const ListItem = styled.div`
  height: 68px;
  padding: 0 9px;
  border-radius: 8px;
  margin-bottom: 8px;
  &:not(.disabled):hover {
    background: #f5f5f5;
    .icon-more_horiz {
      visibility: visible;
    }
  }
  .historyListAvatar {
    width: 36px;
    height: 36px;
    border: 1px solid #e6e6e6;
    color: #fff;
    border-radius: 50%;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    &.edit {
      background: #ff9d00;
      border-color: #ff9d00;
    }
  }
  .historyListTag {
    border-radius: 11px;
    padding: 2px 9px;
    font-size: 12px;
    color: #fff;
    &.blue {
      background: #2196f3;
    }
    &.black {
      background: #333;
    }
  }
  .icon-more_horiz:not(.active) {
    visibility: hidden;
  }
`;

const MenuBox = styled.div`
  min-width: 180px;
  padding: 5px 0;
  border-radius: 3px;
  background: white;
  box-shadow: 0 3px 6px 1px rgba(0, 0, 0, 0.1608);
`;

export default ({ flowInfo, isPlugin }) => {
  const { enabled, companyId, lastPublishDate } = flowInfo;
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMore, setIsMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [list, setList] = useState([]);
  const [selectId, setSelectId] = useState('');
  const getList = _.debounce(pageIndex => {
    // 加载更多
    if (pageIndex > 1 && ((isLoading && isMore) || !isMore)) {
      return;
    }

    setIsLoading(true);

    process.getHistory({ processId: flowInfo.id, pageIndex, pageSize: 20 }).then(result => {
      setIsLoading(false);
      setIsMore(result.length >= 20);
      setPageIndex(pageIndex);
      setList(pageIndex === 1 ? result : list.concat(result));
    });
  }, 200);
  const openPublishVersion = id => {
    location.href = isPlugin ? `/workflowplugin/${id}` : `/workflowedit/${id}`;
  };
  const restoreVision = ({ id, date, index }) => {
    const isCurrent = id === flowInfo.id;

    setSelectId('');

    Dialog.confirm({
      title: isCurrent ? _l('删除更改') : _l('从版本%0开始编辑', `${moment(date).format('YYYYMMDD')}.${index}`),
      description: isCurrent
        ? _l('删除当前编辑中的草稿和所有更新，此操作无法撤回')
        : _l('将以当前的版本创建草稿。您当前正在编辑中的草稿和所有更新将会被删除，此操作无法撤回'),
      okText: isCurrent ? _l('确定删除') : _l('确定'),
      buttonType: isCurrent ? 'danger' : 'primary',
      onOk: () => {
        process.goBack({ processId: id }).then(() => {
          openPublishVersion(flowInfo.id);
        });
      },
    });
  };
  const updateVersionName = ({ id, date, index, versionName }) => {
    setSelectId('');

    Dialog.confirm({
      className: 'processNodeBox',
      title: _l('设置版本名称：%0', `${moment(date).format('YYYYMMDD')}.${index}`),
      description: (
        <div>
          <div>{_l('版本名称')}</div>
          <input
            autoFocus
            type="text"
            id="processVersionName"
            className="processNodeAlias mTop10"
            maxLength={30}
            placeholder={_l('请输入')}
            defaultValue={versionName}
          />
        </div>
      ),
      onOk: () => {
        const name = document.getElementById('processVersionName').value.trim();

        process.updateProcess({ companyId, processId: id, versionName: name }).then(() => {
          setList(
            list.map(o => {
              if (o.id === id) {
                o.versionName = name;
              }

              return o;
            }),
          );
        });
      },
    });
  };
  const renderItem = (item, index) => {
    return (
      <ListItem key={index} className="flexRow alignItemsCenter">
        <div className="historyListAvatar mRight15">
          <UserHead
            projectId={companyId}
            user={{ userHead: item.publisher.avatar, accountId: item.publisher.accountId }}
            size={34}
          />
        </div>
        <div className="flexColumn justifyContentCenter mRight15 flex minWidth0">
          <div className="flexRow alignItemsCenter">
            {item.publishVersion && <span className="historyListTag black mRight10 bold">V{item.publishVersion}</span>}
            {index === 0 && enabled && !item.publishVersion && (
              <span className="historyListTag blue mRight10 bold">{_l('运行中')}</span>
            )}
            <div className="bold Font14 ellipsis flex">
              {moment(item.date).format('YYYYMMDD')}.{item.index}
              {item.versionName && `.${item.versionName}`}
            </div>
          </div>
          <div className="Font12 mTop5">
            {item.publishVersion && item.active && (
              <Fragment>
                <span className="ThemeColor3">{_l('组织使用中')}</span>
                <span className="mLeft5 mRight5">|</span>
              </Fragment>
            )}
            <span className="Gray_75">{_l('%0 发布于 %1', item.publisher.fullName, createTimeSpan(item.date))}</span>
          </div>
        </div>
        <div className="flexRow alignItemsCenter justifyContentCenter">
          <Trigger
            popupVisible={selectId === item.id}
            onPopupVisibleChange={visible => {
              setSelectId(visible ? item.id : '');
            }}
            action={['click']}
            mouseEnterDelay={0.1}
            popupAlign={{ points: ['tl', 'bl'], offset: [0, 0], overflow: { adjustX: 1, adjustY: 2 } }}
            popup={
              <MenuBox>
                <MenuItem onClick={() => openPublishVersion(item.id)}>{_l('查看')}</MenuItem>
                <MenuItem onClick={() => updateVersionName(item)}>{_l('重命名版本')}</MenuItem>
                <MenuItem onClick={() => restoreVision(item)}>{_l('从此版本编辑')}</MenuItem>
              </MenuBox>
            }
          >
            <Icon
              icon="more_horiz"
              className={cx('Font16 Gray_75 ThemeHoverColor3 pointer', { active: item.id === selectId })}
            />
          </Trigger>
        </div>
      </ListItem>
    );
  };

  useEffect(() => {
    visible && getList(1);
  }, [visible, flowInfo.publishStatus]);

  return (
    <Fragment>
      <HistoryBox
        className="ThemeHoverColor3 ThemeHoverBorderColor3"
        data-tip={_l('查看历史版本')}
        onClick={() => setVisible(true)}
      >
        {_l('版本')}
      </HistoryBox>

      {visible && (
        <HistoryListBox className="flexColumn">
          <header className="Font16 bold flexRow alignItemsCenter mBottom12">
            <div className="flex">{_l('版本')}</div>
            <Icon icon="delete" className="Gray_75 ThemeHoverColor3 pointer Font20" onClick={() => setVisible(false)} />
          </header>
          <ScrollView className="flex" onScrollEnd={() => isMore && !isLoading && getList(pageIndex + 1)}>
            <HistoryListCon>
              {flowInfo.publishStatus === 1 && flowInfo.enabled && !!list.length && (
                <Fragment>
                  <ListItem className="flexRow alignItemsCenter disabled">
                    <div className="historyListAvatar mRight15 edit">
                      <Icon icon="sp_edit_white" />
                    </div>
                    <div className="flexColumn justifyContentCenter flex">
                      <div className="flexRow alignItemsCenter">
                        <div className="bold Font14">{_l('编辑中…')}</div>
                      </div>
                      <div className="Font12 mTop5">
                        <span className="Gray_75">{_l('更新于 %0', createTimeSpan(list[0].date))}</span>
                      </div>
                    </div>
                    <div className="flexRow alignItemsCenter justifyContentCenter">
                      <Tooltip title={_l('删除更改')}>
                        <Icon
                          className="Font16 Gray_75 red pointer"
                          icon="delete2"
                          onClick={() => restoreVision(list[0])}
                        />
                      </Tooltip>
                    </div>
                  </ListItem>
                  <div className="historyLine" />
                </Fragment>
              )}

              {list
                .filter((o, index) => !(flowInfo.publishStatus === 1 && flowInfo.enabled && index === 0))
                .map(renderItem)}

              {((isLoading && pageIndex > 1) || !list.length) && <LoadDiv className="mTop15" size="small" />}
            </HistoryListCon>
          </ScrollView>
        </HistoryListBox>
      )}
    </Fragment>
  );
};
