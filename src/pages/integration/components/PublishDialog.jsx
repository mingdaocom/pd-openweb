import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, Radio } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { hrefReg } from 'src/pages/customPage/components/previewContent/index.jsx';
import { WrapFooter } from '../apiIntegration/style';
import APITable from './APITable';

const WrapHeader = styled.div`
  .publishInfo {
    height: 72px;
    background: var(--color-background-secondary);
    border: 1px solid var(--color-border-primary);
    opacity: 1;
    border-radius: 6px;
    line-height: 72px;
    padding: 0 20px;
  }
`;
const Wrap = styled.div`
  p {
    margin: 0;
  }
  .desCon {
    .title {
      width: 116px;
      line-height: 36px;
    }
    input {
      width: 100%;
      height: 36px;
      line-height: 36px;
      padding: 0 12px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-primary);
      opacity: 1;
      border-radius: 3px;
    }
  }
  .warnCon {
    padding: 5px 10px;
    color: var(--color-warning);
    background: rgba(243, 180, 84, 0.1);
    border-radius: 3px;
  }
`;
function PublishDialog(props) {
  const { onCancel = () => {}, hasManageAuth, currentProjectId: propsCurrentProjectId, id } = props;

  const [
    { info, selectedList, list, isCheckAll, connectInfo, status, loadingList, loadingDetail, currentProjectId },
    setState,
  ] = useSetState({
    connectInfo: null,
    info: {
      name: '',
      explain: '',
      accountId: md.global.Account.accountId,
      companyId: '',
    },
    list: [],
    selectedList: [],
    isCheckAll: true,
    status: null,
    loadingList: true,
    loadingDetail: true,
    currentProjectId: propsCurrentProjectId || localStorage.getItem('currentProjectId'),
  });
  useEffect(() => {
    getApiListFetch();
    getDetailInfo();
  }, []);
  const desList = [
    { key: 'name', txt: _l('连接名称'), required: true },
    { key: 'explain', txt: _l('说明'), required: true },
    { key: 'company', txt: _l('API 服务厂商'), required: true },
    { key: 'docUrl', txt: _l('官网地址'), required: true },
    { key: 'identity', txt: _l('连接模板作者') },
  ];
  const isDisable = () => {
    return (
      selectedList.length <= 0 ||
      !(info.docUrl || '').trim() ||
      !(info.explain || '').trim() ||
      !(info.name || '').trim() ||
      !(info.company || '').trim()
    );
  };
  const getApiListFetch = () => {
    packageVersionAjax
      .getApiList(
        {
          companyId: currentProjectId,
          pageIndex: 1,
          pageSize: 100000,
          keyword: '',
          relationId: id,
        },
        { isIntegration: true },
      )
      .then(res => {
        setState({
          list: res.filter(o => o.enabled),
          selectedList: (res.filter(o => o.enabled) || []).map(o => o.id),
          loadingList: false,
        });
      });
  };
  // 获取基本详情
  const getDetailInfo = () => {
    packageVersionAjax
      .getDetail(
        {
          isPublic: true,
          id: id,
        },
        { isIntegration: true },
      )
      .then(
        res => {
          let newData = res;
          if (hasManageAuth || newData.isOwner) {
            setState({
              connectInfo: newData,
              info: newData.info || {
                name: _.get(newData, 'name'),
                explain: _.get(newData, 'explain'),
                accountId: md.global.Account.accountId,
                companyId: '',
              },
              status: newData.status,
              loadingDetail: false,
            });
          } else {
            setTimeout(() => {
              location.href = '/integration';
            }, 500);
            alert(_l('你暂时没有权限查看该连接！', 3));
          }
        },
        () => {
          setTimeout(() => {
            location.href = '/integration';
          }, 500);
          alert(_l('你暂时没有权限查看该连接！', 3));
        },
      );
  };

  // 上架连接
  const upperConnect = info => {
    packageVersionAjax
      .upper({ ...info, id, companyId: currentProjectId || info.companyId }, { isIntegration: true })
      .then(res => {
        if (res) {
          onCancel();
          alert(_l('已申请上架，请等待审核'));
        } else {
          alert(_l('申请失败，请稍后再试'), 2);
        }
      });
  };

  return (
    <Dialog
      className=""
      width="660"
      oneScreen
      oneScreenGap={240}
      visible={true}
      title={<span className="Font17 Bold">{_l('申请上架到API 库')}</span>}
      footer={
        <WrapFooter className="flexRow textSecondary TxtLeft mTop24">
          <span className="flex">{_l('共 %0 个API，已选择 %1 个', list.length, selectedList.length)}</span>
          <span className="cancel Hand Font14" onClick={onCancel}>
            {_l('取消')}
          </span>
          <div
            className={cx('btn Bold Font14', {
              disable: status === 2 || isDisable(),
            })}
            onClick={e => {
              if (status === 2 || isDisable()) {
                return;
              }
              e.stopPropagation();
              if (!hrefReg.test(info.docUrl || '')) {
                return alert(_l('请填入正确的官网地址'), 2);
              }
              upperConnect({
                apis: selectedList,
                accountId: info.accountId,
                companyId: info.companyId, //,
                docUrl: (info.docUrl || '').trim(),
                explain: (info.explain || '').trim(),
                name: (info.name || '').trim(),
                company: (info.company || '').trim(),
              });
            }}
          >
            {/* 状态 0已删除 1正常 2审核中 3已发布 connectInfo有值证明已发布过 */}
            {status === 2 ? _l('已申请，请等待审核') : status === 3 || status ? _l('申请上架新版本') : _l('申请上架')}
          </div>
        </WrapFooter>
      }
      onCancel={onCancel}
    >
      {loadingDetail || loadingList ? (
        <LoadDiv />
      ) : (
        <Wrap className="flexColumn">
          <WrapHeader>
            {[2, 3].includes(status) && (
              <div className="publishInfo flexRow">
                <span className="textSecondary flex">
                  {_l('上架 API 量')} <span className="Bold textPrimary Font20">{info.apiCount}</span>
                </span>
                <span className="textSecondary flex">
                  {_l('安装量')} <span className="Bold textPrimary Font20">{info.installCount}</span>
                </span>
                <span className="flex Green">
                  {_l('上架时间')}：{info.time}
                </span>
              </div>
            )}
          </WrapHeader>
          {connectInfo?.hasAuth && (
            <div className="warnCon flexRow alignItemsCenter mTop10">
              <Icon type="info" className="Font16 mRight5" />
              {_l('注意：该类型连接上架后，用户需要授权使用，共用一套API配置，且只能查看自己使用的数据')}
            </div>
          )}
          <div className="desCon">
            {desList.map(o => {
              return (
                <div className="flexRow mTop10">
                  <div className="title">
                    {o.txt} {o.required && <span className="Red">*</span>}
                  </div>
                  <div className="flex">
                    {o.key === 'identity' ? (
                      <div className="">
                        <div className="mTop12">
                          <Radio
                            className=""
                            text={_l('以企业组织身份')}
                            checked={!!info.companyId}
                            disabled={!hasManageAuth}
                            onClick={() => {
                              //只有有管理权限的可以选择「以企业组织身份」
                              if (!hasManageAuth) {
                                return;
                              }
                              setState({
                                info: { ...info, companyId: currentProjectId, accountId: '' },
                              });
                            }}
                          />
                          <Radio
                            className=""
                            text={_l('以个人身份')}
                            checked={!!info.accountId}
                            onClick={() => {
                              setState({ info: { ...info, accountId: md.global.Account.accountId, companyId: '' } });
                            }}
                          />
                        </div>
                        <input
                          type="text"
                          className="mTop20"
                          value={
                            info.accountId
                              ? md.global.Account.fullname
                              : md.global.Account.projects.find(o => o.projectId === currentProjectId).companyName
                          }
                          readOnly
                          placeholder={_l('请输入')}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={info[o.key]}
                        placeholder={_l('请输入')}
                        maxLength={['name', 'company'].includes(o.key) ? '20' : o.key === 'explain' ? '600' : '200'}
                        onChange={e => {
                          setState({ info: { ...info, [o.key]: e.target.value } });
                        }}
                        onBlur={e => {
                          setState({ info: { ...info, [o.key]: e.target.value.trim() } });
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="Bold mTop24">{_l('请选择要上架的 API')}</p>
          <div className="table flex">
            <APITable
              list={list}
              count={list.length}
              selectedList={selectedList}
              onChange={selectedList => {
                setState({
                  selectedList,
                  isCheckAll: selectedList.length >= list.length,
                });
              }}
              isCheckAll={isCheckAll}
              onCheck={checked => {
                setState({
                  selectedList: checked ? list.map(o => o.id) : [],
                  isCheckAll: checked,
                });
              }}
              // maxHeight={$(window).height() - 400}
              // noDataTxt={_l('所有 API 都已安装')}
            />
          </div>
        </Wrap>
      )}
    </Dialog>
  );
}

export default props => FunctionWrap(PublishDialog, { ...props });
