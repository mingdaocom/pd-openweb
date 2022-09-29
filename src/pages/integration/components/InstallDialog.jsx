import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Icon, Dialog, LoadDiv } from 'ming-ui';
import { useSetState } from 'react-use';
import cx from 'classnames';
import APITable from './APITable';
import { validate, getApiList, install, getDetail } from 'src/pages/workflow/api/packageVersion';
import axios from 'axios';
import ConnectAvator from './ConnectAvator';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
const WrapHeader = styled.div(
  ({}) => `
  .des {
    img {
      width: 60px;
      height: 60px;
    }
  }
  p,
  h5 {
    margin: 0;
  }
  .Install {
    padding: 0px 32px;
    line-height: 36px;
    height: 36px;
    border-radius: 20px;
    background: #2196f3;
    color: #fff;
    &:hover {
      background: rgba(23, 100, 192, 1);
    }
    &.disable{
      background: #bdbdbd;
    }
  }
`,
);
const WrapFooter = styled.div``;
const Wrap = styled.div`
  .headTr {
    padding-right: 10px;
  }
`;
export default function InstallDialog(props) {
  const projectId = localStorage.getItem('currentProjectId');
  const [{ info, selectedList, list, isCheckAll, loading }, setState] = useSetState({
    info: props.info || {},
    list: [],
    selectedList: [],
    isCheckAll: true,
    loading: true,
  });
  // 获取基本详情
  const getDetailInfo = id => {
    let ajaxList = [
      getDetail(
        {
          isPublic: true,
          id: info.id,
        },
        { isIntegration: true },
      ),
    ];
    if (props.info.type === 2) {
      ajaxList.push(
        validate(
          //安装的连接，需要验证还有哪些api还没安装
          {
            id: info.id,
            isPublic: true,
          },
          { isIntegration: true },
        ),
      );
    } else {
      ajaxList.push(
        getApiList(
          {
            companyId: projectId,
            pageIndex: 1,
            pageSize: 100000, //PageSize, API列表不分页、全部加载、排序按排序号+创建时间升序
            keyword: '',
            relationId: info.id,
          },
          { isIntegration: true },
        ),
      );
    }
    axios.all(ajaxList).then(res => {
      setState({
        loading: false,
        info: { ...info, ...res[0].info },
        list: res[1],
        selectedList: res[1].map(o => o.id),
      });
    });
  };

  const onInstall = () => {
    install(
      {
        apis: selectedList,
        companyId: projectId, // info.companyId, //安装的时候 companyId传下
        id: info.id,
        accountId: info.accountId,
        company: info.company,
        docUrl: info.docUrl,
        explain: info.explain,
        name: info.name,
      },
      { isIntegration: true },
    ).then(id => {
      if (props.callback) {
        props.callback(id);
      } else {
        window.open(`/integrationConnect/${projectId}/${id}`);
        props.onCancel();
      }
    });
  };
  useEffect(() => {
    getDetailInfo();
  }, []);
  let h = ($(window).height() > 1000 ? 1000 : $(window).height()) - 250;
  const featureType = getFeatureStatus(projectId, 3);
  return (
    <Dialog
      className="installConnectDialog"
      width="800"
      headerClass="pAll0"
      visible={true}
      title={null}
      footer={null}
      onCancel={props.onCancel}
    >
      {loading ? (
        <LoadDiv />
      ) : (
        <Wrap className="flexColumn">
          <WrapHeader>
            <div className="flexRow des mTop28">
              <div className="flex flexRow">
                <ConnectAvator {...info} width={56} size={32} />
                <div className="flex mLeft15 overflowHidden">
                  <h5 className="Font20 Bold InlineBlock">{info.name}</h5>
                  {info.docUrl && (
                    <Icon
                      className="Hand InlineBlock ThemeColor3 mLeft5 TxtTop mTop10"
                      icon="task-new-detail"
                      onClick={() => {
                        window.open(info.docUrl);
                      }}
                    />
                  )}
                  <p className="Gray_9e Font13 mTop8 pRight15 breakAll">{info.explain}</p>
                  <p className="Gray_9e Font13 breakAll overflow_ellipsis mTop8">
                    {_l('由')}
                    <span className="Bold mLeft3 mRight3">
                      {info.companyId ? info.companyName : (info.createdBy || {}).fullName}
                    </span>
                    {_l('提供 API 连接模板')}
                  </p>
                </div>
              </div>
              {featureType && (
                <span
                  className={cx('Install Hand Font13 Bold', { disable: selectedList.length <= 0 })}
                  onClick={() => {
                    if (!projectId) {
                      return alert(_l('请创建或申请加入一个组织', 3));
                    }
                    if (selectedList.length <= 0) {
                      return;
                    }
                    if (featureType === '2') {
                      buriedUpgradeVersionDialog(projectId, 3);
                    } else {
                      onInstall();
                    }
                  }}
                >
                  {_l('立即安装')}
                </span>
              )}
            </div>
            <p className="Gray Bold Font14 mTop24">{_l('请选择API （%0/%1）', selectedList.length, list.length)}</p>
          </WrapHeader>
          <div className="table flex">
            <APITable
              list={list}
              count={list.length}
              selectedList={selectedList}
              onChange={selectedList => {
                setState({
                  selectedList,
                  isCheckAll: selectedList.length > list.length,
                });
              }}
              isCheckAll={isCheckAll}
              onCheck={checked => {
                setState({
                  selectedList: checked ? list.map(o => o.id) : [],
                  isCheckAll: checked,
                });
              }}
              maxHeight={h - 250}
              minHeight={0}
              noDataTxt={_l('所有 API 都已安装')}
            />
          </div>
          <WrapFooter className="apiDes Gray_9e TxtLeft mTop24">
            API 由第三方平台 <span className="Bold">{info.company || info.name}</span>{' '}
            提供，调用时可能产生的接口费用也由第三方平台收取。以上服务价格仅是对接服务模板提供方{' '}
            <span className="Bold">{info.companyId ? info.companyName : (info.createdBy || {}).fullName}</span>{' '}
            收取的连接模板技术服务费。
          </WrapFooter>
        </Wrap>
      )}
    </Dialog>
  );
}
