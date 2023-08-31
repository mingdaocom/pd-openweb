import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import APICard from '../../components/APICard';
import APISetting from '../APIWrap';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { LoadDiv, Dialog, Icon } from 'ming-ui';
import processAjax from 'src/pages/workflow/api/process.js';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import loadScript from 'load-script';
import _ from 'lodash';
import moment from 'moment';

const Wrap = styled.div`
  .noData {
    .iconCon {
      width: 130px;
      height: 130px;
      line-height: 130px;
      background: #ffffff;
      border-radius: 50%;
      margin: 120px auto 0;
      color: #9e9e9e;
    }
  }
  .addApi {
    padding: 8px 24px;
    background: #2196f3;
    border-radius: 21px;
    color: #fff;
    display: inline-block;
    &:hover {
      background: #1764c0;
    }
  }
  .apiCon {
    max-width: 1000px;
    margin: 32px auto;
    .searchCon {
      & > div {
        background: #fff;
        height: 36px;
      }
    }
  }
`;

const SortableItem = SortableElement(props => <APICard {...props} />);
const SortableList = SortableContainer(({ items, ...rest }) => {
  return (
    <div className="">
      {_.map(items, (item, index) => {
        return <SortableItem {...rest} item={item} key={'item_' + index} sortIndex={index} index={index} />;
      })}
    </div>
  );
});

//api 管理 列表
// 可以搜索和添加新的API；
// 滚动加载分页，每页30条，排序按拖动排序号、创建时间升序；
// 发布后的API有修改未发布时，显示「{时间}更新未发布」字样；
// 卡片上有「启用开关」、「查看请求日志」、「复制API」和「删除API」操作按钮；
// hover时，标题变为蓝色，描述说明变为创建者和创建时间；请求日志、复制和删除按钮只在hover时出现，覆盖掉未发布文案；
// 点击卡片，右侧抽屉拉出API详情；
// 用户可以上下拖动卡片进行排序，拖动释放后自动保存排序；
// 点击卡片可以侧拉弹出API详情；
function APIList(props) {
  let str = 'https://alifile.mingdaocloud.com/open/js/apilibrary.js' + '?' + moment().format('YYYYMMDD');
  const featureType = getFeatureStatus(props.companyId, VersionProductType.apiIntergration);
  const [{ list, keywords, show, listId, loading, pageIndex, publishing, showType, change, listSearch }, setState] =
    useSetState({
      list: props.apiList || [],
      keywords: '',
      show: false,
      listId: '',
      loading: false,
      pageIndex: 1,
      publishing: false,
      showType: 0,
      change: 0,
      listSearch: props.apiList || [],
    });
  const fetchData = () => {
    setState({ loading: true });
    packageVersionAjax
      .getApiList(
        {
          companyId: localStorage.getItem('currentProjectId'),
          // types: [1, 2],
          pageIndex,
          pageSize: 10000, //PageSize,
          keyword: keywords,
          relationId: props.id,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({ loading: false, list: res });
        props.updateList(res); //更新tab上的计数
      });
  };
  useEffect(() => {
    fetchData();
  }, [pageIndex, change]);
  const showInstallDialog = () => {
    if (window.MDAPIInstallDialog) {
      showInstall();
    } else {
      loadScript(str, err => {
        if (!err && window.MDAPIInstallDialog) {
          showInstall();
        }
      });
    }
  };
  const installCallBack = () => {
    setState({ keywords: '', pageIndex: 1, change: change + 1 });
  };
  const showInstall = () => {
    window.MDAPIInstallDialog({
      featureType: featureType,
      installCallBack: installCallBack,
      info: props,
      buriedUpgradeVersionDialog: () => {
        buriedUpgradeVersionDialog(props.companyId, VersionProductType.apiIntergration);
      },
      currentProjectId: props.companyId,
      getUrl: __api_server__.integration || md.global.Config.IntegrationAPIUrl,
      installUrl: __api_server__.integration || md.global.Config.IntegrationAPIUrl,
    });
  };
  /**
   * 切换流程的启用状态
   */
  const switchEnabled = item => {
    if (publishing) {
      return;
    }
    setState({ publishing: true });
    processAjax.publish({ isPublish: !item.enabled, processId: item.id }, { isIntegration: true }).then(publishData => {
      const { isPublish } = publishData;
      if (isPublish) {
        let listN = list.map(o => {
          if (o.id !== item.id) {
            return o;
          } else {
            let data = {};
            if (!item.enabled) {
              data = {
                publishStatus: 2,
              };
            }
            return { ...o, enabled: !item.enabled, ...data };
          }
        });
        setState({
          publishing: false,
          list: listN,
          listSearch: listN,
        });
        props.updateList(listN);
      } else {
        setState({
          publishing: false,
        });
        alert(_l('更新失败'), 2);
      }
    });
  };
  /**
   * 复制工作流
   */
  const onCopyProcess = item => {
    Dialog.confirm({
      title: _l('复制“%0”', item.name),
      // description: _l('将复制目标工作流的所有节点和配置'),
      okText: _l('复制'),
      onOk: () => {
        processAjax.copyProcess({ processId: item.id, name: _l('-复制') }, { isIntegration: true }).then(res => {
          if (res) {
            setState({ keywords: '', pageIndex: 1, change: change + 1 });
          }
        });
      },
    });
  };
  /**
   * 删除api
   */
  const onDel = async item => {
    const cite = await packageVersionAjax.getApiRelationList(
      {
        id: item.id,
        isPublic: true,
      },
      { isIntegration: true },
    );
    Dialog.confirm({
      title: (
        <span className="Red">
          {cite.length > 0 ? <Icon type="warning" className="mRight8" /> : ''}
          {_l('删除“%0”', item.name)}
        </span>
      ),
      description: (
        <div>
          {cite.length > 0 ? (
            <React.Fragment>
              <span className="Font14 Bold Gray">{_l('注意：当前API正在被组织内引用')}</span>
              <span
                className="ThemeColor3 Font14 mLeft3 Hand"
                onClick={() => {
                  setState({ show: true, listId: item.id, showType: 1 });
                  $('.Dialog-footer-btns .Button--link').click();
                }}
              >
                {_l('查看引用')}
              </span>
              <p className="Gray_75 Font14 mTop8">{_l('请务必确认引用位置不再需要此API，再执行此操作')}</p>
            </React.Fragment>
          ) : (
            _l('API 删除后将不可恢复，确认删除吗？')
          )}
        </div>
      ),
      buttonType: 'danger',
      onOk: () => {
        packageVersionAjax.deleteApi({ id: item.id }, { isIntegration: true }).then(res => {
          if (res) {
            setState({
              list: list.filter(o => o.id !== item.id),
              show: false,
              listSearch: list.filter(o => o.id !== item.id),
            });
            props.updateList(list.filter(o => o.id !== item.id));
          }
        });
      },
    });
  };
  const noDataRender = () => {
    return (
      <div className="noData TxtCenter">
        <span className="iconCon InlineBlock TxtCenter ">
          <i className="icon-workflow_webhook Font64 TxtMiddle" />
        </span>
        <p className="Gray_9e mTop20 mBottom0">
          {keywords ? _l('无匹配的结果，换一个关键词试试吧') : _l('暂无 API 可用，请先创建新的第三方 API')}
        </p>
        {!keywords && (
          <span
            className="addApi Bold Hand mTop24"
            onClick={() => {
              if (props.type === 2) {
                //安装的连接，添加=>继续安装
                showInstallDialog();
              } else {
                //自定义的的连接，添加=>创建
                setState({ show: true, listId: '' });
                props.hasChange();
              }
            }}
          >
            {props.type === 2 ? _l('添加 API') : _l('创建 API')}
          </span>
        )}
      </div>
    );
  };
  //拖拽排序
  const handleSortEnd = ({ oldIndex, newIndex }) => {
    // 安装的连接 api 不能排序
    if (oldIndex === newIndex || props.connectType === 2) return;
    let listNew = arrayMove(list, oldIndex, newIndex);
    setState({
      list: listNew,
      listSearch: listNew,
    });
    packageVersionAjax
      .sortApis(
        {
          apis: listNew.map(o => o.id),
          id: props.id,
        },
        { isIntegration: true },
      )
      .then(res => {
        if (res) {
          props.updateList(listNew);
        } else {
          alert(_l('排序出错，请稍后再试'), 3);
        }
      });
  };

  return (
    <Wrap className="">
      {
        <div className="apiCon">
          {!(!keywords && list.length <= 0) && (
            <div className="headCon flexRow">
              <div className="flex searchCon">
                <SearchInput
                  placeholder={_l('搜索 API')}
                  value={keywords}
                  className="search"
                  onChange={v => {
                    setState({ keywords: v, listSearch: list.filter(o => o.name.indexOf(v) >= 0) });
                  }}
                />
              </div>
              <span
                className="addApi Bold Hand"
                onClick={() => {
                  if (props.type === 2) {
                    //安装的连接，添加=>继续安装
                    showInstallDialog();
                  } else {
                    //自定义的的连接，添加=>创建
                    setState({ show: true, listId: '' });
                    props.hasChange();
                  }
                }}
              >
                {_l('添加 API')}
              </span>
            </div>
          )}
          <div className="con mTop25">
            {(!!keywords ? listSearch.length <= 0 : list.length <= 0) && pageIndex === 1 ? (
              noDataRender()
            ) : loading && pageIndex === 1 ? (
              <LoadDiv />
            ) : (
              <SortableList
                items={keywords ? listSearch : list}
                isConnectOwner={props.isConnectOwner}
                canEdit={props.type === 1 && props.isConnectOwner}
                distance={5}
                onSortEnd={handleSortEnd}
                helperClass={'cardWrap'}
                onOpenInfo={item => {
                  setState({ show: true, listId: item.id });
                }}
                switchEnabled={item => {
                  switchEnabled(item);
                }}
                onCopyProcess={item => {
                  onCopyProcess(item);
                }}
                onDel={item => {
                  onDel(item);
                }}
                onOpenLog={item => setState({ show: true, listId: item.id, showType: 2 })}
              />
            )}
            {loading && pageIndex !== 1 && <LoadDiv />}
          </div>
        </div>
      }
      {show && (
        <APISetting
          {...props}
          connectInfo={{
            ...props.connectData,
            apkCount: (props.apks || []).length,
            isOwner: props.isConnectOwner, //权限以连接为准
          }}
          data={listId ? list.find(o => o.id === listId) : {}}
          listId={listId}
          tab={showType}
          onClickAwayExceptions={['.dropdownTrigger', '.selectIconWrap', '.mui-dialog-dialog', '.Menu']}
          onClickAway={() => setState({ show: false })}
          onCancel={() => setState({ show: false })}
          onDel={() => {
            onDel(list.find(o => o.id === listId));
          }}
          onChange={obj => {
            let listNew = listId
              ? list.map(o => {
                  if (o.id === obj.id) {
                    return { ...o, ...obj };
                  } else {
                    return o;
                  }
                })
              : list.concat(obj);
            setState({
              listId: obj.id,
              list: listNew,
              listSearch: listNew,
            });
            props.updateList(listNew);
          }}
        />
      )}
    </Wrap>
  );
}

export default APIList;
