import React, { Component } from 'react';
import { withRouter } from 'react-router';
import autoSize from 'ming-ui/decorators/autoSize';
import LoadDiv from 'ming-ui/components/LoadDiv';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import { navigateTo } from 'src/router/navigateTo';
import RecordInfoWrapper from '../../common/recordInfo/RecordInfoWrapper';
import FixedContent from 'src/components/FixedContent';
import { connect } from 'react-redux';
import './WorksheetRowLand.less';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';

class WorksheetRowLand extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    const { appId } = match.params;
    this.state = {
      loading: !appId,
      worksheetId: match.params.worksheetId,
      rowId: match.params.rowId,
      appId: md.global.Account.isPortal ? md.global.Account.appId : appId,
      viewId: match.params.viewId,
      sheetSwitchPermit: [],
      loadingSwitchPermit: true,
    };
  }
  componentDidMount() {
    const { loading, appId, worksheetId, rowId } = this.state;
    worksheetAjax
      .getSwitchPermit({
        appId: appId,
        worksheetId: worksheetId,
      })
      .then(res => {
        this.setState(
          {
            loadingSwitchPermit: false,
            sheetSwitchPermit: res,
          },
          () => {
            if (loading && !appId) {
              this.navigate(worksheetId, rowId);
            }
          },
        );
      });
  }
  componentWillReceiveProps(nextProps) {
    const params = this.props.match.params;
    const nextParams = nextProps.match.params;
    if (!nextParams.appId && nextParams.rowId !== params.rowId) {
      this.setState({
        loading: true,
      });
      this.navigate(nextParams.worksheetId, nextParams.rowId);
    } else if (nextParams.appId && nextParams.rowId !== params.rowId) {
      this.setState({
        appId: nextParams.appId,
        worksheetId: nextParams.worksheetId,
        viewId: nextParams.viewId,
        rowId: nextParams.rowId,
      });
    }
  }
  navigate(worksheetId, rowId) {
    homeAppAjax.getAppSimpleInfo({ workSheetId: worksheetId }).then(data => {
      if (data.appId) {
        navigateTo(`/app/${data.appId}/${worksheetId}/row/${rowId}`, true);
      }
    });
  }
  render() {
    const { loading, worksheetId, rowId, appId, viewId, loadingSwitchPermit } = this.state;
    const { appPkg } = this.props;
    const { fixed, permissionType, pcDisplay, projectId } = appPkg;
    const isAuthorityApp = canEditApp(permissionType);
    return (
      <div className="worksheetRowLand">
        {loading || loadingSwitchPermit || _.isEmpty(appPkg) ? (
          <div className="workSheetRecordInfo">
            <LoadDiv className="mTop32" />
          </div>
        ) : (fixed || pcDisplay) && !isAuthorityApp ? (
          <FixedContent showLeftSkeleton={false} appPkg={appPkg} isNoPublish={pcDisplay} />
        ) : (
          <RecordInfoWrapper
            isWorksheetRowLand
            sheetSwitchPermit={this.state.sheetSwitchPermit}
            notDialog
            from={2}
            appId={appId}
            worksheetId={worksheetId}
            projectId={projectId}
            viewId={viewId}
            recordId={rowId}
            hideRecordInfo={() => navigateTo(worksheetId ? `/worksheet/${worksheetId}` : `/app/${appId}`)}
          />
        )}
      </div>
    );
  }
}

export default withRouter(
  connect(state => {
    return {
      appPkg: state.appPkg,
    };
  })(WorksheetRowLand),
);
