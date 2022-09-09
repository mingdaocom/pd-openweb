import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { useSetState } from 'react-use';
import { getApiRelationList } from 'src/pages/workflow/api/packageVersion';
import cx from 'classnames';
const Wrap = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  .info,
  .liCon {
    width: 100%;
    background: #ffffff;
    // border: 1px solid #ebebeb;
    padding: 20px 24px;
    border-radius: 6px;
    &.liCon {
      padding: 0;
    }
    .li {
      padding: 14px 20px;
      &.borTop {
        border-top: 1px solid #f4f4f4;
      }
      .name a {
        color: #333;
      }
      &:hover {
        .name a {
          color: #2196f3;
        }
      }
    }
  }
  .noData .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    border-radius: 50%;
    margin: 120px auto 0;
    color: #e0e0e0;
    background: #fff !important;
    color: #9e9e9e;
  }
  .Green_fr {
    color: #4caf50;
  }
`;
export default function Cite(props) {
  const [{ data, loading }, setState] = useSetState({
    data: [],
    loading: true,
  });
  //获取引用信息
  const getCiteInfo = () => {
    getApiRelationList(
      {
        id: props.processId,
        isPublic: true,
      },
      { isIntegration: true },
    ).then(data => {
      setState({
        data,
        loading: false,
      });
    });
  };
  useEffect(() => {
    getCiteInfo();
  }, []);
  const noDataRender = () => {
    return (
      <div className="noData TxtCenter">
        <span className="iconCon InlineBlock TxtCenter ">
          <Icon icon="connect" className="icon InlineBlock Font64 TxtMiddle" />
        </span>
        <p className="Gray_9e Font15 mTop20 mBottom0">{_l('暂无引用')}</p>
      </div>
    );
  };
  if (loading) {
    return <LoadDiv className="mTop24" />;
  }
  return (
    <Wrap className="">
      {/* 状态 0已删除 1正常 2审核中 3已发布  只有自定义的连接并且已经「申请上架」或「已上架」的自定义连接，才需要显示在 API库 中的安装量等信息。*/}
      {props.connectInfo.info && props.connectInfo.type === 1 && [2, 3].includes(props.connectInfo.info.status) && (
        <React.Fragment>
          <div className="title Bold Font15">{_l('API 库')}</div>
          <div className="info mTop12 mBottom32">
            <div className="Green_fr">
              {_l('上架时间：%0', props.connectInfo.lastModifiedDate || props.connectInfo.createdDate)}
            </div>
            <div className="">
              <span className="Gray_75 flex">
                {_l('安装量')}
                <span className="Bold Gray Font20 mLeft3">
                  {_.get(props, ['connectInfo', 'info', 'installCount']) || 0}
                </span>
              </span>
              <span className="Gray_75 flex mLeft50">
                {_l('引用量')}
                <span className="Bold Gray Font20 mLeft3">
                  {_.get(props, ['connectInfo', 'info', 'relationCount']) || 0}
                </span>
              </span>
            </div>
          </div>
        </React.Fragment>
      )}
      {props.connectInfo.info && data.length > 0 && <div className="title Font15 Bold">{_l('本组织')}</div>}
      {data.length <= 0 && noDataRender()}
      {data.filter(o => o.type === 2).length > 0 && (
        <React.Fragment>
          <div className="txt mTop15">{_l('被以下工作流引用')}</div>
          <div className="liCon mTop8">
            {/* // 1工作表控件 2流程节点 */}
            {data
              .filter(o => o.type === 2)
              .map((o, i) => {
                return (
                  <div className={cx('li flexRow Hand', { borTop: i !== 0 })}>
                    <div className="flex Bold name Font14">
                      <a target="_blank" className="" href={`/workflowedit/${o.primaryId}`}>
                        {o.primaryName}
                      </a>
                    </div>
                    <div className="flex Gray_75">{_l('节点：%0', o.minorName)}</div>
                  </div>
                );
              })}
          </div>
        </React.Fragment>
      )}
      {data.filter(o => o.type === 1).length > 0 && (
        <React.Fragment>
          <div className="txt mTop20">{_l('被以下工作表引用')}</div>
          <div className="liCon mTop8">
            {/* // 1工作表控件 2流程节点 */}
            {data
              .filter(o => o.type === 1)
              .map((o, i) => {
                return (
                  <div className={cx('li flexRow Hand', { borTop: i !== 0 })}>
                    <div className="flex Bold name Font14">
                      <a target="_blank" className="" href={`/worksheet/${o.primaryId}`}>
                        {o.primaryName}
                      </a>
                    </div>
                    <div className="flex Gray_75">{_l('字段：%0', o.minorName)}</div>
                  </div>
                );
              })}
          </div>
        </React.Fragment>
      )}
    </Wrap>
  );
}
