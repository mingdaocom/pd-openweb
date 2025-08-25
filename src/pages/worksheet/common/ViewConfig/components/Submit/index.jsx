import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, Radio, ScrollView, UserHead } from 'ming-ui';
import pluginAjax from 'src/api/plugin';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import PublishVersion from 'src/pages/plugin/pluginComponent/PublishVersion.jsx';

const Wrap = styled.div`
  height: 100%;
  .submitCon {
    height: 100%;
    .submitContent {
      padding: 0 40px 32px;
    }
  }
`;
const WrapList = styled.div`
  .refresh {
    color: #9e9e9e;
  }
  .w160 {
    width: 160px !important;
  }
  .w60 {
    width: 60px !important;
  }
  .w44 {
    width: 44px !important;
  }
  .nullCon {
    padding-bottom: 32px;
    border-bottom: 1px solid #dddddd;
  }
  .conLi {
    padding: 10px 12px 10px 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
    .ming.Radio {
      margin-right: 0;
    }
    .action {
      option: 0;
      // display: none;
      width: 0;
      transition: all 0.2s ease;
      &::before {
        display: none;
      }
    }
    &:hover {
      background: #f5f5f5;
      .action {
        option: 1;
        width: 16px;
        // display: inline-block;
        &::before {
          display: block;
        }
      }
    }
  }
`;
const WrapPopup = styled.div`
  padding: 6px 0;
  width: 160px;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.25);
  & > div {
    height: 36px;
    font-weight: 400;
    .icon {
      color: #9e9e9e;
    }
    &.del {
      color: #f44336;
      .icon {
        color: #f44336;
      }
    }
    &:hover {
      color: #fff;
      background: #1677ff;
      .icon {
        color: #fff;
      }
    }
  }
`;
const pageSize = 50;
const actionTypes = [
  {
    txt: _l('发布'),
    icon: 'publish',
    key: 'publish',
  },
  {
    txt: _l('删除'),
    icon: 'trash',
    key: 'delete',
  },
];
function ActionCon(props) {
  const { onDel, setPublish, id, projectId, view } = props;
  const [{ visible }, setState] = useSetState({
    visible: false,
  });
  const projectInfo = md.global.Account.projects.find(o => o.projectId === projectId) || {};
  const hasPluginAuth =
    projectInfo.allowPlugin ||
    checkPermission(projectId, [PERMISSION_ENUM.DEVELOP_PLUGIN, PERMISSION_ENUM.MANAGE_PLUGINS]);

  return (
    <Trigger
      action={['click']}
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setState({ visible });
      }}
      popup={
        <WrapPopup>
          {actionTypes
            .filter(o =>
              _.get(view, 'pluginInfo.creator.accountId') === md.global.Account.accountId || hasPluginAuth
                ? true
                : o.key !== 'publish',
            )
            .map(a => {
              return (
                <div
                  className={cx('Hand Font14 flexRow alignItemsCenter pLeft12', { del: a.key === 'delete' })}
                  onClick={e => {
                    setState({ visible: false });
                    if (a.key === 'delete') {
                      Dialog.confirm({
                        className: '',
                        buttonType: 'danger',
                        title: <span className="Bold Font17">{_l('删除当前版本')}</span>,
                        description: _l('彻底删除提交版本，不可恢复'),
                        // removeCancelBtn: true,
                        onOk: () => {
                          onDel(id);
                        },
                        okText: _l('删除'),
                      });
                    } else {
                      setPublish();
                    }
                    e.stopPropagation();
                  }}
                >
                  <Icon icon={a.icon} className="mRight8" />
                  {a.txt}
                </div>
              );
            })}
        </WrapPopup>
      }
      popupAlign={{
        points: ['tl', 'bl'],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
      }}
      getPopupContainer={() => document.body}
    >
      <Icon icon={'more_horiz'} className="ThemeHoverColor3 Hand action mLeft12 Font16" />
    </Trigger>
  );
}
export default function SubmitConfig(params) {
  const { view = {}, onChangeView, appId, updateCurrentViewState, projectId } = params;
  const [{ pageIndex, loading, isMore, list, CommitId, configuration, publishVersion }, setState] = useSetState({
    pageIndex: 0,
    loading: false,
    isMore: true,
    CommitId: '',
    list: [],
    configuration: null,
    publishVersion: '',
  });
  useEffect(() => {
    handleScroll(1);
  }, []);
  useEffect(() => {
    const { pluginInfo = {}, advancedSetting = {} } = view;
    const { configuration } = pluginInfo;
    const { plugin_attachement_info } = advancedSetting;
    const { CommitId } = safeParse(plugin_attachement_info);
    setState({
      CommitId: CommitId,
      configuration,
    });
  }, [params]);
  const handleCopy = content => {
    copy(content);
    alert(_l('复制成功'));
  };
  const handleScroll = (pageIndex, reGet) => {
    if (!_.get(view, 'pluginInfo.id')) {
      return;
    }
    if (!reGet && (loading || !isMore)) {
      return;
    }
    setState({
      loading: true,
    });
    if (reGet) {
      setState({
        list: [],
      });
    }
    pluginAjax
      .getCommitHistory({
        id: _.get(view, 'pluginInfo.id'),
        pageIndex,
        pageSize,
        appId,
      })
      .then(res => {
        const { totalCount, history = [] } = res;
        let dataList = pageIndex <= 1 ? history : list.concat(history);
        setState({
          pageIndex,
          isMore: totalCount > dataList.length,
          loading: false,
          list: dataList,
        });
      });
  };
  const onDel = id => {
    pluginAjax
      .removeCommit({
        appId,
        id,
      })
      .then(res => {
        if (res) {
          setState({
            list: list.filter(o => o.id !== id),
          });
          if (CommitId === id) {
            const { plugin_attachement_info } = _.get(view, 'advancedSetting');
            onChangeView(
              {
                plugin_attachement_info: JSON.stringify({
                  ...safeParse(plugin_attachement_info),
                  CommitId: '',
                }),
              },
              false,
              { pluginId: _.get(view, 'pluginInfo.id'), editAttrs: ['advancedSetting', 'pluginId'] },
            );
          }
          alert(_l('删除成功'));
        } else {
          alert(_l('删除失败，稍后再试'), 3);
        }
      });
  };
  const renderText = (content, renderTxt) => {
    return (
      <div className="textCopyCon flexRow alignItemsCenter mTop16 Hand" onClick={() => handleCopy(content)}>
        <div className="flex">{renderTxt ? renderTxt() : content}</div>
        <Icon className="Hand mLeft10" icon={'content-copy'} />
      </div>
    );
  };

  return (
    <Wrap className="flexColumn">
      <ScrollView className="submitCon flex" onScrollEnd={() => handleScroll(pageIndex + 1)}>
        <div className="submitContent">
          <div className="viewSetTitle">{_l('提交')}</div>
          <div className="mTop4 Gray_9e">
            {_l('插件开发完成后，可以按以下步骤提交插件。发布成功后，本插件在组织下所有应用均可使用。')}
          </div>
          <div className="Gray_75 mTop24 Bold">{_l('第1步')}</div>
          <div className="mTop4">{_l('执行以下命令将本地项目打包')}</div>
          {renderText(`mdye build`)}
          <div className="Gray_75 mTop24 Bold">{_l('第2步')}</div>
          <div className="mTop4">
            {_l('执行以下命令将本地项目提交并推送到线上待发布插件列表。可以使用-m参数为本次推送添加备注信息：')}
          </div>
          {renderText(`mdye push -m "COMMENTS"`, () => {
            return (
              <div className="">
                {`mdye push -m `}
                <span className="ThemeColor3">{`"COMMENTS"`}</span>
              </div>
            );
          })}
          <div className="mTop24">{_l('提交时，需要登录账户，请按提示输入用户名（手机号或邮箱地址）和密码。')}</div>
          <div className="Bold mTop32">{_l('已提交')}</div>
          <div className="mTop8 TxtMiddle Gray_9e flexRow alignItemsCenter">
            {_l('选择一个已提交的代码应用到视图')}{' '}
            <Icon
              icon={'task-later'}
              className="Gray_bd ThemeHoverColor3 Hand Font16 mLeft5"
              onClick={() => {
                handleScroll(1, true);
              }}
            />
          </div>
          <WrapList className="flexColumn mTop12">
            <div className="con mTop10 flex">
              {list.map(o => {
                return (
                  <div className="flexRow conLi alignItemsCenter">
                    <Radio
                      className=""
                      // text={o.name}
                      checked={o.id === CommitId}
                      onClick={() => {
                        const { plugin_attachement_info } = _.get(view, 'advancedSetting');
                        if (o.id === CommitId) {
                          return;
                        }
                        onChangeView(
                          {
                            plugin_attachement_info: JSON.stringify({
                              ...safeParse(plugin_attachement_info),
                              CommitId: o.id,
                            }),
                          },
                          false,
                          { pluginId: _.get(view, 'pluginInfo.id'), editAttrs: ['advancedSetting', 'pluginId'] },
                        );
                      }}
                    />
                    <div className="flex Gray_9e mLeft12 WordBreak overflow_ellipsis" style={{ 'flex-shrink': 0 }}>
                      <div className="Gray overflow_ellipsis" title={_.get(o, 'message')}>
                        {_.get(o, 'message')}
                      </div>
                      <div className="Gray_9e">
                        {createTimeSpan(o.commitTime)}
                        {o.versionTags.filter(o => !!o).length > 0 && ` | `}
                        {o.versionTags.join('、')}
                        {o.beUsing && `(${_l('当前')})`}
                      </div>
                    </div>
                    <div className="mLeft12 Gray_9e actionOptions TxtRight flexRow alignItemsCenter">
                      <UserHead
                        size={20}
                        user={{
                          userHead: _.get(o.author, 'avatar'),
                          accountId: _.get(o.author, 'accountId'),
                        }}
                        projectId={projectId}
                      />
                      <ActionCon
                        {...o}
                        projectId={projectId}
                        view={view}
                        onDel={onDel}
                        setPublish={() => {
                          setState({
                            publishVersion: o.id,
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {list.length <= 0 && !loading && (
                <div className="Gray_bd nullCon TxtCenter pTop10">{_l('还没有提交')}</div>
              )}
              {loading && <LoadDiv />}
            </div>
          </WrapList>
        </div>
      </ScrollView>
      {!!publishVersion && (
        <PublishVersion
          latestVersion={_.get(view, 'pluginInfo.latestVersion')}
          pluginId={_.get(view, 'pluginInfo.id')}
          commitId={publishVersion}
          configuration={configuration}
          debugConfiguration={configuration}
          onClose={() => {
            setState({ publishVersion: '' });
          }}
          onRefreshDetail={() => {
            handleScroll(1, true);
            pluginAjax
              .getDetail({
                id: _.get(view, 'pluginInfo.id'),
                source: _.get(view, 'pluginInfo.source'),
              })
              .then(res => {
                updateCurrentViewState({
                  pluginInfo: res,
                });
              });
          }}
        />
      )}
    </Wrap>
  );
}
