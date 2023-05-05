import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog, Radio } from 'ming-ui';
import { useSetState } from 'react-use';
import cx from 'classnames';
import APITable from './APITable';
import { WrapFooter } from '../apiIntegration/style';
import { hrefReg } from 'src/pages/customPage/components/previewContent/index.jsx';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
const WrapHeader = styled.div`
  .publishInfo {
    height: 72px;
    background: #fcfcfc;
    border: 1px solid #dddddd;
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
      background: #ffffff;
      border: 1px solid #dddddd;
      opacity: 1;
      border-radius: 3px;
    }
  }
`;
export default function PublishDialog(props) {
  const [{ info, selectedList, list, isCheckAll, connectInfo, status, loadingList, loadingDetail }, setState] =
    useSetState({
      connectInfo: props.connectInfo,
      info: props.info || {
        name: _.get(props, 'connectInfo.name'),
        explain: _.get(props, 'connectInfo.explain'),
        accountId: md.global.Account.accountId,
        companyId: '',
      },
      list: props.list || [],
      selectedList: (props.list || []).map(o => o.id),
      isCheckAll: true,
      status: props.status,
      loadingList: true,
      loadingDetail: true,
    });
  useEffect(() => {
    if (props.isGetData) {
      getApiListFetch();
      getDetailInfo();
    }
  }, []);
  const desList = [
    { key: 'name', txt: '连接名称', required: true },
    { key: 'explain', txt: '说明', required: true },
    { key: 'company', txt: 'API 服务厂商', required: true },
    { key: 'docUrl', txt: 'API 文档地址', required: true },
    { key: 'identity', txt: '连接模板作者' },
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
    const { id, currentProjectId } = props;
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
    const { id } = props;
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
          if (props.isSuperAdmin || newData.isOwner) {
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

  return (
    <Dialog
      className=""
      width="660"
      oneScreen
      oneScreenGap={240}
      visible={true}
      title={<span className="Font17 Bold">{_l('申请上架到API 库')}</span>}
      footer={
        <WrapFooter className="flexRow Gray_75 TxtLeft mTop24">
          <span className="flex">{_l('共 %0 个API，已选择 %1 个', list.length, selectedList.length)}</span>
          <span className="cancel Hand Font14" onClick={props.onCancel}>
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
                return alert(_l('请填入正确的API文档地址'), 2);
              }
              props.onOk({
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
      onCancel={props.onCancel}
    >
      {props.isGetData && (loadingDetail || loadingList) ? (
        <LoadDiv />
      ) : (
        <Wrap className="flexColumn">
          <WrapHeader>
            {[2, 3].includes(status) && (
              <div className="publishInfo flexRow">
                <span className="Gray_75 flex">
                  {_l('上架 API 量')} <span className="Bold Gray Font20">{info.apiCount}</span>
                </span>
                <span className="Gray_75 flex">
                  {_l('安装量')} <span className="Bold Gray Font20">{info.installCount}</span>
                </span>
                <span className="flex Green">
                  {_l('上架时间')}：{info.time}
                </span>
              </div>
            )}
          </WrapHeader>
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
                            disabled={!props.isSuperAdmin}
                            onClick={() => {
                              //只有超级管理员可以选择「以企业组织身份」
                              if (!props.isSuperAdmin) {
                                return;
                              }
                              setState({
                                info: { ...info, companyId: localStorage.getItem('currentProjectId'), accountId: '' },
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
                            !!info.accountId
                              ? md.global.Account.fullname
                              : md.global.Account.projects.find(
                                  o => o.projectId === localStorage.getItem('currentProjectId'),
                                ).companyName
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
                        maxLength={['name', 'company'].includes(o.key) ? '20' : '200'}
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
