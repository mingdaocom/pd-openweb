import React, { Fragment, Component } from 'react';
import MobileNewRecord from 'worksheet/common/newRecord/MobileNewRecord';
import functionWrap from 'worksheet/components/FunctionWrap';
import homeAppApi from 'src/api/homeApp';
import { Flex, ActivityIndicator } from 'antd-mobile';
import worksheetApi from 'src/api/worksheet';

export default class AddRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      worksheetInfo: undefined
    }
  }
  componentDidMount() {
    const { params } = this.props.match;
    worksheetApi.getWorksheetInfo({
      appId: params.appId,
      worksheetId: params.worksheetId,
      getTemplate: true,
      getViews: true
    }).then(data => {
      this.setState({ loading: false, worksheetInfo: data });
    });
  }
  render() {
    const { params } = this.props.match;
    const { loading, worksheetInfo } = this.state;

    return (
      <div className="h100" style={{ backgroundColor: '#fff' }}>
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          <div className="h100 pTop20">
            <MobileNewRecord
              appId={params.appId}
              worksheetId={params.worksheetId}
              viewId={params.viewId}
              worksheetInfo={worksheetInfo}
              addType={2}
              notDialog={true}
              onAdd={(data) => {
                homeAppApi.getAppSimpleInfo({
                  workSheetId: params.worksheetId
                }).then(data => {
                  const { appId, appSectionId } = data;
                  window.mobileNavigateTo(`/mobile/recordList/${appId}/${appSectionId}/${params.worksheetId}/${params.viewId}`);
                });
              }}
            />
          </div>
        )}
      </div>
    );
  }
}

export const openAddRecord = props => functionWrap(MobileNewRecord, { ...props, closeFnName: 'hideNewRecord' });
