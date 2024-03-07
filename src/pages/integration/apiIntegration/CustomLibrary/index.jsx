import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import SelectApiPackage from 'src/pages/workflow/components/SelectApiPackage';
import Apply from './Apply';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { getCurrentProject } from 'src/util';
import AuthorizationList from './AuthorizationList';

const minWidth = 325;

const ApplyNumber = styled.div`
  width: 20px;
  height: 20px;
  background: #f8d4d3;
  color: #f44336;
  border-radius: 50%;
`;

const SearchBox = styled.div`
  width: 220px;
  height: 36px;
  border-radius: 36px;
  background-color: rgb(245, 245, 245);
  padding-left: 10px;
  overflow: hidden;
  &:hover {
    background-color: rgb(234, 234, 234);
  }
  input {
    flex: 1;
    border: none;
    margin-left: 2px;
    background-color: inherit;
  }
  .searchClear {
    cursor: pointer;
    width: 28px;
    height: 28px;
    border-radius: 28px;
    margin-right: 2px;
    &:hover {
      background: rgb(245, 245, 245);
    }
  }
`;

const Content = styled.div`
  margin-left: -12px;
  margin-right: -12px;
  flex-wrap: wrap;
  .listItem {
    flex: 1;
    min-width: 325px;
    height: 220px;
    margin: 12px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 24px 24px 0;
    cursor: pointer;
    &:hover {
      box-shadow: rgba(0, 0, 0, 0.16) 0 2px 5px;
    }
    &.null {
      color: #e0e0e0;
      font-size: 60px;
    }
    .listItemHeader {
      height: 32px;
      align-items: center;
      justify-content: space-between;
      img,
      .icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        max-width: 100%;
        max-height: 100%;
        background-color: #eaeaea;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9e9e9e;
      }
    }
    .listApplyBtn {
      min-width: 66px;
      height: 30px;
      padding: 0px 12px;
      background: rgba(33, 150, 243, 0.08);
      border-radius: 15px;
      color: rgb(33, 150, 243);
      line-height: 30px;
      cursor: pointer;
    }
    .listItemDesc {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      height: 40px;
      overflow: hidden;
    }
    .listItemRemove {
      color: #f44336;
      cursor: pointer;
    }
  }

  .empty {
    margin-top: 64px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .iconCon {
      width: 130px;
      height: 130px;
      text-align: center;
      background: #f5f5f5;
      border-radius: 50%;
      color: #c2c3c3;
      i {
        line-height: 130px;
      }
    }
  }
`;

// 渲染占位块
const RenderBlankBlock = ({ columnSize, number }) => {
  const list = [];

  if (!number) return null;

  for (let i = 0; i < columnSize - number; i++) {
    list.push(<div className="listItem Visibility" />);
  }

  return list;
};

let ajaxRequest = null;

export default function CustomLibrary(props) {
  const { width, currentProjectId, loadMore, setHasMore } = props;
  const keywordsRef = useRef(null);
  const [addAPIDialogVisible, setAddAPIDialogVisible] = useState(false);
  const [applyDialog, setApplyDialog] = useSetState({ visible: false });
  const [authListVisible, setAuthListVisible] = useState(false);
  const [applyCount, setApplyCount] = useState(0);
  const [list, setList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(true);
  const columnSize = Math.floor((width - 76) / minWidth);
  const { isProjectAppManager, isSuperAdmin } = getCurrentProject(currentProjectId);
  const isAdmin = isProjectAppManager || isSuperAdmin;

  useEffect(() => {
    packageVersionAjax
      .getAuthorizationList(
        {
          companyId: currentProjectId,
          isOwner: !isAdmin,
          pageIndex: 1,
          pageSize: 1000,
          status: [1],
        },
        { isIntegration: true },
      )
      .then(res => {
        res && setApplyCount(res.length);
      });
  }, []);

  useEffect(() => {
    getList();
  }, [pageIndex, keywords]);

  useEffect(() => {
    if (!loading && !ajaxRequest) {
      setPageIndex(pageIndex + 1);
    }
  }, [loadMore]);

  // 列表
  const getList = designatedPageNo => {
    setLoading(true);

    ajaxRequest = packageVersionAjax.getList(
      {
        companyId: currentProjectId,
        types: [1, 2],
        authorization: true,
        pageIndex: designatedPageNo || pageIndex,
        pageSize: 30,
        keyword: keywords,
      },
      { isIntegration: true },
    );

    ajaxRequest.then(res => {
      ajaxRequest = '';
      setList(pageIndex > 1 ? list.concat(res) : res);
      setLoading(false);
      setHasMore(res.length >= 30);
    });
  };

  // 开启关闭授权
  const updateAuthorization = ({ id, authorization = true }) => {
    const isAdded = !!list.filter(item => item.id === id).length;
    if (isAdded && authorization) {
      alert(_l('API已存在'), 3);
      return;
    }
    packageVersionAjax
      .updateAuthorization(
        {
          authorization,
          id,
        },
        { isIntegration: true },
      )
      .then(res => {
        if (res) {
          alert(authorization ? _l('添加成功') : _l('移除成功'));

          if (authorization) {
            getList(1);
          } else {
            setList(list.filter(o => o.id !== id));
          }
        }
      });
  };

  // 搜索
  const onChange = _.debounce(keyword => {
    setPageIndex(1);
    setKeywords(keyword);
  }, 500);

  return (
    <Fragment>
      <div className="flexRow alignItemsCenter">
        <div className="Bold Font17 flex">
          {_l('组织')}({list.length})
        </div>

        <div className="Font14 Gray_75 ThemeHoverColor3 pointer" onClick={() => setAuthListVisible(true)}>
          {_l('申请使用')}
        </div>
        {!!applyCount && (
          <ApplyNumber className="mLeft5 flexRow alignItemsCenter justifyContentCenter">{applyCount}</ApplyNumber>
        )}

        <SearchBox className="flexRow alignItemsCenter mLeft20">
          <Icon type="search" className="Font18 Gray_9d" />
          <input type="text" ref={keywordsRef} placeholder={_l('搜索连接')} onChange={e => onChange(e.target.value.trim())} />
          {keywords && (
            <div
              className="searchClear flexRow alignItemsCenter justifyContentCenter"
              onClick={() => {
                keywordsRef.current.value = '';
                setPageIndex(1);
                setKeywords('');
              }}
            >
              <Icon type="cancel" className="Gray_9e Font16" />
            </div>
          )}
        </SearchBox>
      </div>

      <Content className="flexRow">
        {isAdmin && (
          <div
            className="listItem null flexColumn alignItemsCenter justifyContentCenter"
            onClick={() => setAddAPIDialogVisible(true)}
          >
            <Icon type="task-add-member-circle" className="null" />
            <div className="mTop25 Font13 Gray_75">{_l('添加组织下创建的连接至API库')}</div>
          </div>
        )}

        {!list.length && !isAdmin ? (
          <div className="empty">
            <div className="iconCon">
              <Icon icon="connect" className="Font64" />
            </div>
            <div className="mTop24 Font16 Gray_9e">{!keywords ? _l('组织下暂未开放可用API') : _l('暂无搜索结果')}</div>
          </div>
        ) : (
          list.map(item => (
            <div className="listItem" key={item.id} onClick={() => setApplyDialog({ visible: true, apiDetail: item })}>
              <div className="flexRow listItemHeader">
                {item.iconName ? <img src={item.iconName} /> : <Icon icon="connect" className="Font16" />}
                <div className="listApplyBtn">{_l('申请使用')}</div>
              </div>
              <div className="bold Font20 ellipsis mTop20">{item.name}</div>
              <div className="listItemDesc Gray_75 breakAll mTop20">{item.explain}</div>
              <div className="flexRow mTop20">
                <span className="Gray_75">{_l('包含')}</span>
                <span className="mLeft3 mRight3">{item.apiCount}</span>
                <span className="Gray_75">API</span>
                <div className="flex" />
                {isAdmin && (
                  <div
                    className="listItemRemove"
                    onClick={e => {
                      e.stopPropagation();
                      updateAuthorization({ id: item.id, authorization: false });
                    }}
                  >
                    {_l('移除')}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <RenderBlankBlock columnSize={columnSize} number={(list.length + (isAdmin ? 1 : 0)) % columnSize} />
      </Content>

      {loading && (!isAdmin || pageIndex > 1) && <LoadDiv className="mTop10" />}

      <SelectApiPackage
        companyId={currentProjectId}
        title={_l('选择组织下连接')}
        types={[1, 2]}
        allowAdd={false}
        visible={addAPIDialogVisible}
        onSave={updateAuthorization}
        onClose={() => setAddAPIDialogVisible(false)}
      />

      {applyDialog.visible && (
        <Apply
          companyId={currentProjectId}
          apiDetail={applyDialog.apiDetail}
          onClose={() => setApplyDialog({ visible: false })}
          onApplySuccess={() => setApplyCount(applyCount + 1)}
        />
      )}

      {authListVisible && (
        <AuthorizationList
          companyId={currentProjectId}
          isAdmin={isAdmin}
          onClose={() => setAuthListVisible(false)}
          onApproveSuccess={() => setApplyCount(applyCount - 1)}
        />
      )}
    </Fragment>
  );
}
