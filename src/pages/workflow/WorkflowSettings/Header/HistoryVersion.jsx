import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import { Dropdown, Input, Modal, Tooltip } from 'ming-ui/antd-components';
import process from '../../api/process';
import { pathCompletion } from 'src/utils/platform/navigation/path';

const HistoryBox = styled.span`
  border-bottom: 1px dashed var(--color-text-secondary);
  cursor: pointer;
`;

const HistoryListBox = styled.div`
  padding: 12px 0px;
  width: 440px;
  display: flex;
  background: var(--color-background-card);
  border-radius: 5px;
  box-shadow: var(--shadow-xl);
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
    background: var(--color-border-secondary);
    height: 1px;
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .red {
    &:hover {
      color: var(--color-error) !important;
    }
  }
`;

const HistoryListCon = styled.div`
  padding: 0 12px;
`;

const ListItem = styled.div`
  min-height: 68px;
  padding: 0 9px;
  border-radius: 8px;
  margin-bottom: 8px;
  &:not(.disabled):hover {
    background: var(--color-background-hover);
    .icon-more_horiz {
      visibility: visible;
    }
  }
  .historyListAvatar {
    width: 36px;
    height: 36px;
    border: 1px solid var(--color-border-secondary);
    color: var(--color-white);
    border-radius: 50%;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    &.edit {
      background: var(--color-warning);
      border-color: var(--color-warning);
    }
  }
  .historyListTag {
    border-radius: 11px;
    padding: 2px 9px;
    font-size: 12px;
    color: var(--color-white);
    &.blue {
      background: var(--color-primary);
    }
    &.black {
      background: var(--color-background-inverse);
    }
  }
  .icon-more_horiz:not(.active) {
    visibility: hidden;
  }
`;

const openPublishVersion = (id, isIntegration, isPlugin) => {
  location.href = pathCompletion(
    isIntegration ? `/integrationApi/${id}` : isPlugin ? `/workflowplugin/${id}` : `/workflowedit/${id}`,
  );
};

export const restoreVision = ({ id, date, index, versionName, currentFlowId, isIntegration, isPlugin }) => {
  const isCurrent = id === currentFlowId;

  Modal.confirm({
    title: (
      <span className="textError">
        {isCurrent
          ? _l('删除更改')
          : _l('恢复到历史版本：%0', versionName ? versionName : `${moment(date).format('YYYYMMDD')}.${index}`)}
      </span>
    ),
    width: 480,
    content: (
      <span className="textPrimary">
        {isCurrent
          ? _l('删除当前编辑中的草稿和所有更新，此操作无法撤回')
          : _l('将以当前的版本创建草稿。您当前正在编辑中的草稿和所有更新将会被删除，此操作无法撤回')}
      </span>
    ),
    okText: isCurrent ? _l('确定删除') : _l('确定'),
    okButtonProps: {
      danger: (isCurrent ? 'danger' : 'primary') === 'danger',
    },
    onOk: () => {
      process
        .goBack(
          {
            processId: id,
          },
          {
            isIntegration,
          },
        )
        .then(() => {
          openPublishVersion(currentFlowId, isIntegration, isPlugin);
        });
    },
  });
};

export default ({ flowInfo, isPlugin, customBtn, wrapClassName, isIntegration = false, popupClassName }) => {
  const { enabled, companyId } = flowInfo;
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

    process
      .getHistory({ processId: flowInfo.id, pageIndex, pageSize: 20 }, { isIntegration })
      .then(result => {
        setIsMore(result.length >= 20);
        setPageIndex(pageIndex);
        setList(pageIndex === 1 ? result : list.concat(result));
      })
      .finally(() => setIsLoading(false));
  }, 200);

  const updateVersionName = ({ id, date, index, versionName }) => {
    setSelectId('');

    Modal.confirm({
      className: 'processNodeBox',
      width: 480,
      title: _l('设置版本名称：%0', `${moment(date).format('YYYYMMDD')}.${index}`),
      content: (
        <div>
          <div>{_l('版本名称')}</div>
          <Input
            autoFocus
            id="processVersionName"
            className="mTop10"
            maxLength={30}
            placeholder={_l('请输入')}
            defaultValue={versionName}
          />
        </div>
      ),
      onOk: () => {
        const name = document.getElementById('processVersionName').value.trim();
        process
          .updateProcess(
            {
              companyId,
              processId: id,
              versionName: name,
            },
            {
              isIntegration,
            },
          )
          .then(() => {
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
              {item.versionName ? item.versionName : `${moment(item.date).format('YYYYMMDD')}.${item.index}`}
            </div>
          </div>
          <div className="Font12 mTop5">
            {item.publishVersion && item.active && (
              <Fragment>
                <span className="colorPrimary">{_l('组织使用中')}</span>
                <span className="mLeft5 mRight5">|</span>
              </Fragment>
            )}
            <span className="textSecondary WordBreak">
              <span className="ellipsis mRight3 InlineBlock" style={{ maxWidth: 150 }}>
                {item.publisher.fullName}
              </span>
              {_l('发布于 %0', createTimeSpan(item.date))}
            </span>
          </div>
        </div>
        <div className="flexRow alignItemsCenter justifyContentCenter">
          <Dropdown
            open={selectId === item.id}
            onOpenChange={visible => {
              setSelectId(visible ? item.id : '');
            }}
            classNames={popupClassName ? { root: popupClassName } : undefined}
            trigger={['click']}
            placement="bottomLeft"
            menu={{
              style: { minWidth: 180 },
              items: [
                {
                  key: 'view',
                  label: _l('查看'),
                  onClick: () => {
                    setSelectId('');
                    openPublishVersion(item.id, isIntegration, isPlugin);
                  },
                },
                {
                  key: 'rename',
                  label: _l('重命名版本'),
                  onClick: () => {
                    setSelectId('');
                    updateVersionName(item);
                  },
                },
                {
                  key: 'restore',
                  label: _l('恢复到此版本'),
                  onClick: () => {
                    restoreVision({ ...item, currentFlowId: flowInfo.id, isIntegration });
                    setSelectId('');
                  },
                },
              ],
            }}
          >
            <Icon
              icon="more_horiz"
              className={cx('Font16 textSecondary hoverColorPrimary pointer', { active: item.id === selectId })}
            />
          </Dropdown>
        </div>
      </ListItem>
    );
  };

  useEffect(() => {
    visible && getList(1);
  }, [visible, flowInfo.publishStatus]);

  return (
    <Fragment>
      {customBtn ? (
        <div onClick={() => setVisible(true)}>{customBtn()}</div>
      ) : (
        <Tooltip title={_l('查看历史版本')}>
          <HistoryBox className="hoverColorPrimary hoverBorderColorPrimary" onClick={() => setVisible(true)}>
            {_l('版本%26016')}
          </HistoryBox>
        </Tooltip>
      )}

      {visible && (
        <HistoryListBox className={cx('flexColumn', wrapClassName)}>
          <header className="Font16 bold flexRow alignItemsCenter mBottom12">
            <div className="flex">{_l('版本%26016')}</div>
            <Icon
              icon="delete"
              className="textSecondary hoverColorPrimary pointer Font20"
              onClick={() => setVisible(false)}
            />
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
                        <span className="textSecondary">{_l('更新于 %0', createTimeSpan(list[0].date))}</span>
                      </div>
                    </div>
                    <div className="flexRow alignItemsCenter justifyContentCenter">
                      <Tooltip title={_l('删除更改')}>
                        <Icon
                          className="Font16 textSecondary red pointer"
                          icon="trash"
                          onClick={() => {
                            restoreVision({ ...list[0], currentFlowId: flowInfo.id, isIntegration });
                            setSelectId('');
                          }}
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

              {!isLoading && !list.length && <div className="TxtCenter textTertiary mTop20">{_l('暂无数据')}</div>}
              {isLoading && <LoadDiv className="mTop15" size="small" />}
            </HistoryListCon>
          </ScrollView>
        </HistoryListBox>
      )}
    </Fragment>
  );
};
