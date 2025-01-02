import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog } from 'ming-ui';
import { useSetState } from 'react-use';
import JsonView from 'react-json-view';
import _ from 'lodash';
import cx from 'classnames';
import moment from 'moment';
const TABLIST = ['请求参数', '返回值'];
import { METHODS_TYPE } from 'src/pages/workflow/WorkflowSettings/enum.js';

const Wrap = styled.div`
  .tabCon {
    border-bottom: 1px solid #f5f5f5;
    li {
      font-size: 15px;
      font-weight: 600;
      color: #151515;
      display: inline-block;
      margin: 0 18px;
      padding: 0 20px 10px;
      box-sizing: border-box;
      border-bottom: 3px solid rgba(0, 0, 0, 0);
      &.isCur {
        color: #2196f3;
        border-bottom: 3px solid #2196f3;
      }
    }
  }
  .con {
    height: 380px;
    background: #efffff;
    overflow: auto;
    padding: 16px;
  }
`;
export default function LogDialog(props) {
  const { logInfo = {}, isErr } = props;
  const [{ data, tab }, setState] = useSetState({
    data: logInfo.requestCatch,
    tab: 0,
  });

  const renderTabCon = () => {
    return (
      <div className="tabCon TxtLeft mTop22">
        <ul>
          {TABLIST.map((o, i) => {
            return (
              <li
                className={cx('Hand Font15', { isCur: tab === i })}
                onClick={() => {
                  setState({ tab: i });
                }}
              >
                {o}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
  const getInfo = info => {
    let da = {};
    try {
      da = JSON.parse(info);
    } catch (error) {
      da = {
        data: info,
      };
    }
    return da;
  };
  return (
    <Dialog
      className=""
      width="740"
      visible={true}
      title={props.title ? props.title : _l('查看 API 请求日志详情')}
      footer={null}
      onCancel={props.onCancel}
    >
      <Wrap className="">
        {!logInfo.requestCatch ? (
          <div className="con mTop16">
            <JsonView src={logInfo.msg || {}} displayDataTypes={false} displayObjectSize={false} />
          </div>
        ) : (
          <React.Fragment>
            {renderTabCon()}
            <p className="Gray_9e mTop24 WordBreak">
              {tab === 0 ? (
                <React.Fragment>
                  {`(${(METHODS_TYPE.find(o => o.value === data.method) || {}).text})`} {data.url}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {!_.get(data, 'json.code')
                    ? _l(
                        '请求时间 %0, 耗时 %1 秒',
                        _.get(props, 'logInfo.createdDate'),
                        !_.get(props, 'logInfo.completeDate')
                          ? ''
                          : moment(_.get(props, 'logInfo.completeDate')).diff(
                              moment(_.get(props, 'logInfo.createdDate')),
                              'seconds',
                            ),
                      )
                    : _l(
                        '请求时间 %0, 状态码 %1，耗时 %2 秒',
                        _.get(props, 'logInfo.createdDate'),
                        _.get(data, 'json.code'),
                        !_.get(props, 'logInfo.completeDate')
                          ? ''
                          : moment(_.get(props, 'logInfo.completeDate')).diff(
                              moment(_.get(props, 'logInfo.createdDate')),
                              'seconds',
                            ),
                      )}
                  ，{_l('请求结果')}
                  <span className={cx('mLeft5', { Red: logInfo.completeType !== 1 })}>
                    {logInfo.completeType === 1 ? _l('完成') : _l('未完成')}
                  </span>
                </React.Fragment>
              )}
            </p>
            <div className="con mTop16">
              <JsonView
                src={
                  tab !== 0
                    ? getInfo(_.get(data, 'json.result'))
                    : [1, 4, 5].includes(data.contentType)
                      ? data.requests
                      : getInfo(data.body)
                }
                displayDataTypes={false}
                displayObjectSize={false}
              />
            </div>
          </React.Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}
