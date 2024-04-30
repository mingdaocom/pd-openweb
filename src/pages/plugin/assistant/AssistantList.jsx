import React, { useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Icon, Dialog, SvgIcon } from 'ming-ui';
import { Switch } from 'antd';
import autoSize from 'ming-ui/decorators/autoSize';
import cx from 'classnames';

const ListContent = styled.div`
  margin: 0 -12px;
  display: flex;
  flex-wrap: wrap;
  .listItem {
    flex: 1;
    min-width: 325px;
    height: 180px;
    margin: 12px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    &:hover {
      box-shadow: rgba(0, 0, 0, 0.16) 0 2px 5px;
      .itemHeader {
        .moreOperate {
          display: block;
        }
      }
    }
    .itemHeader {
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .iconWrapper {
        width: 36px;
        min-width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        &.hasBorder {
          border: 1px solid #e0e0e0;
        }
      }
      .moreOperate {
        display: none;
        width: 32px;
        min-width: 32px;
        height: 32px;
        text-align: center;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
          background: #f5f5f5;
        }
        &.isShow {
          display: block;
        }
      }
    }
    .itemContent {
      flex: 1;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 16px 0 24px;
      color: #9e9e9e;
    }
    .itemFooter {
      display: flex;
      align-items: center;
      justify-content: space-between;
      img {
        width: 20px;
        height: 20px;
        border-radius: 50%;
      }
      .ant-switch {
        min-width: 56px;
      }
      .ant-switch-checked {
        background-color: rgba(40, 202, 131, 1);
      }
    }
  }
`;

const OperateMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
  .menuItem {
    padding: 0 20px;
    line-height: 36px;
    cursor: pointer;
    color: #f44336;
    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

function AssistantList(props) {
  const { list = [], width, onEdit, onDelete, onSwitchStatus } = props;
  const [popupVisibleItem, setPopupVisibleIItem] = useState(null);

  // 渲染占位块
  const renderBlankBlock = () => {
    const minWidth = 325;
    const columnSize = Math.floor((width + 24) / (minWidth + 24));
    const number = (list || []).length % columnSize;
    const blankList = [];

    if (!number) return null;

    for (let i = 0; i < columnSize - number; i++) {
      blankList.push(<div className="listItem Visibility" />);
    }

    return blankList;
  };

  return (
    <ListContent>
      {list.map((item, index) => {
        return (
          <div className="listItem flexColumn" key={index} onClick={() => onEdit(item.id, item.name)}>
            <div className="itemHeader">
              <div className="flexRow alignItemsCenter">
                <div
                  className={cx('iconWrapper', { hasBorder: !item.iconUrl })}
                  style={{ backgroundColor: item.iconUrl ? item.iconColor || '#2196f3' : '' }}
                >
                  {item.iconUrl ? (
                    <SvgIcon url={item.iconUrl} fill={'#fff'} size={24} />
                  ) : (
                    <Icon icon="ai1" className="Font24 Gray_bd" />
                  )}
                </div>
                <div className="Font20 bold mLeft8 overflow_ellipsis" title={item.name || _l('未命名助手')}>
                  {item.name || _l('未命名助手')}
                </div>
              </div>
              <Trigger
                onClick={e => e.stopPropagation()}
                action={['click']}
                getPopupContainer={() => document.body}
                popupVisible={(popupVisibleItem || {}).id === item.id}
                onPopupVisibleChange={visible => setPopupVisibleIItem(visible ? item : null)}
                popupAlign={{
                  points: ['tr', 'bl'],
                  offset: [25, 5],
                  overflow: { adjustX: true, adjustY: true },
                }}
                popup={
                  <OperateMenu>
                    <div
                      className="menuItem"
                      onClick={e => {
                        e.stopPropagation();
                        setPopupVisibleIItem(null);
                        Dialog.confirm({
                          title: (
                            <div style={{ color: '#f44336' }}>{_l('删除助手') + `“${popupVisibleItem.name}”`}</div>
                          ),
                          buttonType: 'danger',
                          description: _l('删除后将不可恢复，确认删除吗？'),
                          okText: _l('删除'),
                          onOk: () => onDelete(popupVisibleItem.id),
                        });
                      }}
                    >
                      {_l('删除')}
                    </div>
                  </OperateMenu>
                }
              >
                <div className={cx('moreOperate', { isShow: (popupVisibleItem || {}).id === item.id })}>
                  <Icon icon="more_horiz" className="Font16 Gray_9e LineHeight32" />
                </div>
              </Trigger>
            </div>
            <div className="itemContent" title={item.description}>
              {item.description}
            </div>
            <div className="itemFooter">
              <div className="flexRow alignItemsCenter">
                <img src={item.creatorInfo.avatar} />
                <span className="mLeft8 Gray_9e">{item.creatorInfo.fullname}</span>
                <span className="mLeft8 Gray_9e">{createTimeSpan(item.createTime)}</span>
              </div>
              <Switch
                checkedChildren={_l('开启')}
                unCheckedChildren={_l('关闭')}
                //   disabled={!isAdmin}
                checked={item.status === 2}
                onChange={(checked, e) => {
                  e.stopPropagation();
                  const targetStatus = checked ? 2 : 3;
                  onSwitchStatus(item.id, targetStatus, () =>
                    alert(targetStatus === 2 ? _l('开启成功') : _l('关闭成功')),
                  );
                }}
              />
            </div>
          </div>
        );
      })}
      {renderBlankBlock()}
    </ListContent>
  );
}

export default autoSize(AssistantList);
