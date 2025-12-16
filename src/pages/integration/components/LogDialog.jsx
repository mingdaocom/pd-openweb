import React, { useEffect } from 'react';
import JsonView from 'react-json-view';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, LoadDiv } from 'ming-ui';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { METHODS_TYPE } from 'src/pages/workflow/WorkflowSettings/enum.js';
import { FLOW_STATUS } from 'src/pages/workflow/WorkflowSettings/History/config.js';

const TABLIST = [_l('请求参数'), _l('返回值')];

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
        color: #1677ff;
        border-bottom: 3px solid #1677ff;
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
  const [{ data, tab, loading, isErr }, setState] = useSetState({
    data: {},
    tab: 0,
    loading: true,
    isErr: false,
  });
  useEffect(() => {
    getLogDetail();
  }, []);
  const getLogDetail = () => {
    setState({ loading: true });
    packageVersionAjax
      .getHistoryDetail(
        {
          instanceId: props.info.id,
        },
        { isIntegration: true },
      )
      .then(
        res => {
          setState({ loading: false, data: res, isErr: false });
        },
        () => {
          setState({
            isErr: true,

            loading: false,
            data: props.info.instanceLog,
          });
        },
      );
  };
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
    if (!info) {
      return da;
    }
    try {
      da = JSON.parse(info);
    } catch (error) {
      console.log(error);
      da = {
        //无法JSON.parse，兼容呈现
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
      title={_l('查看 API 请求日志详情')}
      footer={null}
      onCancel={props.onCancel}
    >
      <Wrap className="">
        {loading ? (
          <LoadDiv />
        ) : isErr ? (
          <div className="con mTop16">
            <JsonView
              src={data}
              // theme="brewer"
              displayDataTypes={false}
              displayObjectSize={false}
              // name={_l('成功')}
            />
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
                        _.get(props, 'info.createDate'),
                        !_.get(props, 'info.completeDate')
                          ? ''
                          : moment(_.get(props, 'info.completeDate')).diff(
                              moment(_.get(props, 'info.createDate')),
                              'seconds',
                            ),
                      )
                    : _l(
                        '请求时间 %0, 状态码 %1，耗时 %2 秒',
                        _.get(props, 'info.createDate'),
                        _.get(data, 'json.code'),
                        !_.get(props, 'info.completeDate')
                          ? ''
                          : moment(_.get(props, 'info.completeDate')).diff(
                              moment(_.get(props, 'info.createDate')),
                              'seconds',
                            ),
                      )}
                  ，{_l('请求结果')}
                  <span className={cx('mLeft5', { Red: _.get(props, 'info.status') === 4 })}>
                    {FLOW_STATUS[_.get(props, 'info.status')].text}
                    {_.get(props, 'info.status') === 4
                      ? _.get(props, ['info', 'instanceLog', 'causeMsg'])
                        ? `: ${_.get(props, ['info', 'instanceLog', 'causeMsg'])}`
                        : ''
                      : ''}
                  </span>
                </React.Fragment>
              )}
            </p>
            <div className="con mTop16">
              <JsonView
                src={
                  tab !== 0
                    ? getInfo(_.get(data, 'json.result'))
                    : [1, 4, 5].includes(data.contentType) //contentType 1 4 5 请求使用这个requests
                      ? data.requests
                      : getInfo(data.body)
                }
                // theme="brewer"
                displayDataTypes={false}
                displayObjectSize={false}
                // name={_l('成功')}
              />
            </div>
          </React.Fragment>
        )}
      </Wrap>
    </Dialog>
  );
}
