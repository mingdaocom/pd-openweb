import React, { Fragment, Component } from 'react';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import functionWrap from 'ming-ui/components/FunctionWrap';
import homeAppApi from 'src/api/homeApp';
import { Button } from 'ming-ui';
import { Flex, ActivityIndicator } from 'antd-mobile';
import worksheetApi from 'src/api/worksheet';
import styled from 'styled-components';
import successPng from 'src/pages/NewRecord/success.png';

const STATUS = {
  NORMAL: 1,
  SUCCESS: 2,
  ERROR: 3,
};

const Success = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 120px;
  }
  .status {
    font-size: 17px;
    color: #757575;
    margin: 24px 0 32px;
  }
`;

export default class AddRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      worksheetInfo: undefined,
      status: STATUS.NORMAL,
    };
  }
  componentDidMount() {
    const { params = {} } = this.props.match || {};
    const { appId, worksheetId } = this.props;
    worksheetApi
      .getWorksheetInfo({
        appId: params.appId || appId,
        worksheetId: params.worksheetId || worksheetId,
        getTemplate: true,
        getViews: true,
      })
      .then(data => {
        this.setState({ loading: false, worksheetInfo: data });
      });
  }
  render() {
    const { params = {} } = this.props.match || {};
    const { appId, worksheetId, viewId, defaultFormData = {} ,defaultFormDataEditable} = this.props;
    const { loading, worksheetInfo, status } = this.state;

    return (
      <div className="h100" style={{ backgroundColor: '#fff' }}>
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          <div className="h100 pTop20">
            {status !== STATUS.NORMAL && (
              <Fragment>
                {status === STATUS.ERROR && _l('您没有新建记录权限，请联系该应用管理员')}
                {status === STATUS.SUCCESS && (
                  <Success className="h100">
                    <img src={successPng} alt="" />
                    <span className="status">{_l('创建成功')}</span>
                    <div>
                      <Button onClick={() => this.setState({ status: STATUS.NORMAL })}>{_l('继续创建')}</Button>
                      <Button
                        type="ghost"
                        className="mLeft10"
                        onClick={() => {
                          homeAppApi
                            .getAppSimpleInfo({
                              workSheetId: params.worksheetId,
                            })
                            .then(data => {
                              const { appId, appSectionId } = data;
                              window.mobileNavigateTo(
                                `/mobile/recordList/${appId}/${appSectionId}/${params.worksheetId}/${params.viewId}`,
                              );
                            });
                        }}
                      >
                        {_l('查看我的数据')}
                      </Button>
                    </div>
                  </Success>
                )}
              </Fragment>
            )}
            {status === STATUS.NORMAL && (
              <MobileNewRecord
                appId={params.appId || appId}
                worksheetId={params.worksheetId || worksheetId}
                viewId={params.viewId || viewId}
                worksheetInfo={worksheetInfo}
                addType={2}
                notDialog={true}
                changeWorksheetStatusCode={() => this.setState({ status: STATUS.ERROR })}
                onAdd={(data, { continueAdd }) => {
                  if (!continueAdd) {
                    this.setState({ status: STATUS.SUCCESS });
                  }
                }}
                defaultFormData={defaultFormData}
                defaultFormDataEditable={defaultFormDataEditable}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export const openAddRecord = props => functionWrap(MobileNewRecord, { ...props, closeFnName: 'hideNewRecord' });
