import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog, Icon, ScrollView, Tooltip, DeleteReconfirm, UserHead, SvgIcon } from 'ming-ui';
import { useSetState } from 'react-use';
import cx from 'classnames';
import sheetAjax from 'src/api/worksheet';
import Search from 'src/pages/workflow/components/Search';
import './index.less';

const WrapHeader = styled.div`
  height: 53px;
  padding: 0 68px 0 26px;
  .trashSearch {
    .icon {
      top: 8px;
    }
    input {
      width: 184px;
      height: 30px;
      background: #f5f5f5;
      border-radius: 16px 16px 16px 16px;
    }
  }
`;
const Wrap = styled.div`
  .table {
    height: 600px;
    min-height: 600px;
    border-top: 1px solid rgba(0, 0, 0, 0.16);
    .nameWrapTr,
    .rageWrapTr {
      min-width: 260px;
      max-width: 260px;
    }
    .iconWrap {
      width: 36px;
      min-width: 36px;
      height: 36px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        font-size: 24px;
        color: #fff;
      }
    }
    .optionWrapTr {
      max-width: 100px;
      text-align: right;
      padding-right: 10px;
    }
    .nullData {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: calc(100% - 60px) !important;
      .emptyIcon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 130px;
        height: 130px;
        border-radius: 130px;
        background: #f5f5f5;
        .icon {
          color: #bdbdbd;
          font-size: 66px;
        }
      }
    }
    font-weight: 400;
    .trashHeader {
      padding: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.16);
    }
    .trashLi {
      padding: 15px 10px;
      border-bottom: 1px solid #e0e0e0;
      background: #fff;
      .icon-reply1,
      .icon-delete1 {
        color: #9d9d9d;
        cursor: pointer;
        opacity: 0;
        font-size: 20px;
      }
      &:hover {
        background: #f5f5f5;
        .icon-reply1,
        .icon-delete1 {
          opacity: 1;
        }
        .icon-reply1 {
          &:hover {
            color: #2196f3;
          }
        }
        .icon-delete1 {
          &:hover {
            color: #f32121;
          }
        }
      }
    }
  }
`;
//回收站
export default function TrashDialog(props) {
  const { projectId, appId, worksheetId, views } = props;
  const [{ loading, list, allList, keyWords }, setState] = useSetState({
    loading: false,
    list: [],
    allList: [],
    keyWords: '',
  });
  useEffect(() => {
    getList();
  }, []);
  const getList = () => {
    if (loading) {
      return;
    }
    setState({ loading: true });
    sheetAjax
      .getWorksheetBtns({
        appId,
        status: 9,
        worksheetId,
      })
      .then(res => {
        setState({
          list: res || [],
          allList: res || [],
          loading: false,
        });
      });
  };

  const reply = btnId => {
    sheetAjax
      .optionWorksheetBtn({
        appId,
        btnId,
        viewId: '',
        worksheetId,
        optionType: 11, // 1：视图添加按钮 2：视图删除按钮 9：删除按钮, 11:恢复按钮 999：彻底删除
      })
      .then(res => {
        if (res) {
          setState({
            keyWords: '',
          });
          alert(_l('恢复成功'));
          getList();
          props.onChange();
        } else {
          alert(_l('恢复失败'), 2);
        }
      });
  };
  const removeBtn = btnId => {
    sheetAjax
      .optionWorksheetBtn({
        appId,
        btnId,
        viewId: '',
        worksheetId,
        optionType: 999, // 1：视图添加按钮 2：视图删除按钮 9：删除按钮, 11:恢复按钮 999：彻底删除
      })
      .then(res => {
        if (res) {
          alert(_l('彻底删除成功'));
          setState({
            keyWords: '',
          });
          getList();
        } else {
          alert(_l('彻底删除失败'), 2);
        }
      });
  };
  const renderTxt = (it, isTxt) => {
    const list = safeParse(_.get(it, 'advancedSetting.listviews'), 'array');
    const dt = safeParse(_.get(it, 'advancedSetting.detailviews'), 'array');
    const data = _.uniq([...list, ...dt]);
    if (data.length > 0) {
      if (isTxt) {
        return data
          .map(item => {
            let view = views.find(o => o.viewId === item) || {};
            return view.name || _l('该视图已删除');
          })
          .join(',');
      }
      return (
        <span className="">
          {data
            .map(item => {
              let view = views.find(o => o.viewId === item) || {};
              return view.name || _l('该视图已删除');
            })
            .join(',')}
        </span>
      );
    }
    return _l('未分配视图');
  };
  const columns = [
    {
      id: 'name',
      className: 'nameWrapTr',
      name: _l('动作名称'),
      render: (data, index) => {
        return (
          <div className="flexRow flex alignItemsCenter">
            <div
              className={cx('iconWrap', { 'Border BorderGrayColor': data.color === 'transparent' })}
              style={{
                backgroundColor: !data.color ? '#9e9e9e' : data.color,
              }}
            >
              {!!data.iconUrl && data.icon.endsWith('_svg') ? (
                <SvgIcon
                  className="InlineBlock TxtTop Icon iconTitle"
                  addClassName="TxtMiddle"
                  url={data.iconUrl}
                  fill={data.color === 'transparent' ? '#333' : '#fff'}
                  size={16}
                />
              ) : (
                <Icon
                  icon={data.icon || 'custom_actions'}
                  className={cx('iconTitle Font16 White', { Gray: data.color === 'transparent' })}
                />
              )}
            </div>
            <div className="flex name Font14 mLeft10 mRight24 WordBreak overflow_ellipsis" title={data.name}>
              {data.name}
            </div>
          </div>
        );
      },
    },
    {
      id: 'type',
      name: _l('使用范围'),
      className: 'rageWrapTr',
      sorter: true,
      render: (it, index) => {
        return (
          <div className="view flex overflow_ellipsis">
            {it.isAllView === 1 ? (
              <span className="viewText Gray_9e WordBreak overflow_ellipsis" title={_l('所有记录')}>
                {_l('所有记录')}
              </span>
            ) : (
              <span
                className="viewText Gray_9e WordBreak overflow_ellipsis"
                style={{ WebkitBoxOrient: 'vertical' }}
                title={renderTxt(it, true)}
              >
                {renderTxt(it)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'updateAccount',
      name: _l('删除者'),
      render: (data, index) => {
        return (
          <div className="flexRow alignItemsCenter">
            <UserHead
              projectId={projectId}
              size={28}
              user={{
                userHead: _.get(data, 'updateAccount.avatar'),
                accountId: _.get(data, 'updateAccount.accountId'),
              }}
            />
            <div className="mLeft12 ellipsis flex mRight20">{_.get(data, 'updateAccount.fullname')}</div>
          </div>
        );
      },
    },
    {
      id: 'updateTime',
      name: _l('删除时间'),
      sorter: true,
      render: (data, index) => {
        return data.updateTime;
      },
    },
    {
      id: 'option',
      className: 'optionWrapTr',
      name: '',
      render: (data, index) => {
        return (
          <div className="flex">
            <Tooltip text={<span>{_l('恢复')}</span>} popupPlacement="bottom">
              <i
                className="icon icon-reply1"
                onClick={() => {
                  reply(data.btnId);
                }}
              ></i>
            </Tooltip>
            <Tooltip text={<span>{_l('彻底删除')}</span>} popupPlacement="bottom">
              <i
                className="icon icon-delete1 mLeft25"
                onClick={() => {
                  DeleteReconfirm({
                    title: _l('将彻底删除动作“%0”', data.name),
                    description: _l('彻底删除该数据后，将无法恢复。'),
                    data: [{ text: _l('我确定执行此操作'), value: true }],
                    okText: _l('彻底删除'),
                    buttonType: 'danger',
                    onOk: () => {
                      removeBtn(data.btnId);
                    },
                  });
                }}
              ></i>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  const renderList = item => {
    return (
      <div className="flexRow trashLi alignItemsCenter">
        {columns.map(o => {
          return <div className={cx('flex flexRow alignItemsCenter', o.className)}>{o.render(item)}</div>;
        })}
      </div>
    );
  };
  const renderHeader = () => {
    return (
      <div className="flexRow trashHeader alignItemsCenter">
        {columns.map(o => {
          return <div className={cx('flex', o.className)}>{o.id !== 'option' ? o.name : ''}</div>;
        })}
      </div>
    );
  };
  const renderCon = () => {
    return (
      <React.Fragment>
        {renderHeader()}
        <ScrollView className="flex">{list.map(item => renderList(item))}</ScrollView>
      </React.Fragment>
    );
  };

  return (
    <Dialog
      className="btnTrashDialog"
      width="1000"
      headerClass="pAll0"
      visible={true}
      title={null}
      footer={null}
      onCancel={props.onCancel}
    >
      <Wrap className="flexColumn">
        <WrapHeader className="flexRow alignItemsCenter">
          <div className="Font17 flex">
            {_l('回收站')}（ {_l('自定义动作')}）
            <span className="Gray_9e Font13 mLeft10">{_l('可恢复60天内删除的自定义动作')}</span>
          </div>
          <Search
            className="trashSearch"
            placeholder={_l('动作名称')}
            value={keyWords}
            handleChange={keyWords => setState({ keyWords, list: allList.filter(o => o.name.indexOf(keyWords) >= 0) })}
          />
        </WrapHeader>
        <div className="table flex flexColumn pLeft20 pRight20 pTop10 pBottom10">
          {loading ? (
            <LoadDiv />
          ) : list.length <= 0 ? (
            <div className="nullData TxtCenter flex">
              <div className="emptyIcon">
                <i className="icon icon-custom_-page_delete"></i>
              </div>
              <p className="TxtCenter Gray_9e Font17 mTop10">
                {keyWords ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}
              </p>
            </div>
          ) : (
            renderCon()
          )}
        </div>
      </Wrap>
    </Dialog>
  );
}
