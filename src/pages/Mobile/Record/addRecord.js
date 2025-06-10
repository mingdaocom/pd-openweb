import React, { Component, Fragment } from 'react';
import { SpinLoading } from 'antd-mobile';
import styled from 'styled-components';
import AppPermissions from '../components/AppPermissions';
import { Button } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import homeAppApi from 'src/api/homeApp';
import worksheetApi from 'src/api/worksheet';
import State from 'mobile/RecordList/State/index.js';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import successPng from 'src/pages/NewRecord/success.png';
import { getRequest } from 'src/utils/common';
import { replaceControlsTranslateInfo } from 'src/utils/translate';

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

class AddRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      worksheetInfo: undefined,
      status: STATUS.NORMAL,
      writeControls: [],
    };
  }
  componentDidMount() {
    const { params = {} } = this.props.match || {};
    const { btnId } = getRequest();
    const { appId, worksheetId } = this.props;
    worksheetApi
      .getWorksheetInfo({
        appId: params.appId || appId,
        worksheetId: params.worksheetId || worksheetId,
        getTemplate: true,
        getViews: true,
      })
      .then(data => {
        if (btnId) {
          worksheetApi
            .getWorksheetBtnByID({
              appId: params.appId || appId,
              worksheetId: params.worksheetId || worksheetId,
              btnId,
            })
            .then(({ writeControls }) => {
              this.setState({ loading: false, worksheetInfo: data, writeControls });
            });
        } else {
          data.template.controls = replaceControlsTranslateInfo(params.appId || appId, params.worksheetId || worksheetId, data.template.controls);
          this.setState({ loading: false, worksheetInfo: data });
        }
      });
  }
  render() {
    const { params = {} } = this.props.match || {};
    const { appId, worksheetId, viewId, defaultFormData = {}, defaultFormDataEditable } = this.props;
    const { loading, worksheetInfo, writeControls, status } = this.state;

    return (
      <div className="h100" style={{ backgroundColor: '#fff' }}>
        {loading ? (
          <div className="flexRow justifyContentCenter alignItemsCenter h100">
            <SpinLoading color="primary" />
          </div>
        ) : worksheetInfo.resultCode !== 1 ? (
          <State type="sheet" />
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
                      {_.get(worksheetInfo, 'advancedSetting.continueBtnVisible') && (
                        <Button onClick={() => this.setState({ status: STATUS.NORMAL })}>{_l('继续创建')}</Button>
                      )}
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
                writeControls={writeControls}
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

export default AppPermissions(AddRecord);

export const openAddRecord = props => functionWrap(MobileNewRecord, { ...props, closeFnName: 'hideNewRecord' });
