import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Button } from 'ming-ui/antd-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import FixedContent from 'src/components/FixedContent';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { canEditApp } from 'src/utils/domain/permission/app';
import RecordInfoWrapper from '../../common/recordInfo/RecordInfoWrapper';
import './WorksheetRowLand.less';

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
      loadError: false,
    };
  }

  handleLoadError = () => {
    this.setState({ loading: false, loadingSwitchPermit: false, loadError: true });
  };

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
      })
      .catch(this.handleLoadError);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const params = prevProps.match.params;
      const nextParams = this.props.match.params;

      if (!nextParams.appId && nextParams.rowId !== params.rowId) {
        this.setState({
          loading: true,
          loadError: false,
        });
        this.navigate(nextParams.worksheetId, nextParams.rowId);
      } else if (nextParams.appId && nextParams.rowId !== params.rowId) {
        this.setState({
          appId: nextParams.appId,
          worksheetId: nextParams.worksheetId,
          viewId: nextParams.viewId,
          rowId: nextParams.rowId,
          loadError: false,
        });
      }
    }
  }
  navigate(worksheetId, rowId) {
    return homeAppAjax
      .getAppSimpleInfo({ workSheetId: worksheetId })
      .then(data => {
        if (data.appId) {
          navigateTo(`/app/${data.appId}/${worksheetId}/row/${rowId}${location.search || ''}`, true);
        } else {
          this.handleLoadError();
        }
      })
      .catch(this.handleLoadError);
  }
  render() {
    const { loading, worksheetId, rowId, appId, viewId, loadingSwitchPermit, loadError, landRightComp } = this.state;
    const { appPkg } = this.props;
    const { fixed, permissionType, pcDisplay, projectId } = appPkg;
    const isAuthorityApp = canEditApp(permissionType);
    return (
      <div className={cx('worksheetRowLand', { hasLandRightComp: !!landRightComp })}>
        {loadError ? (
          <div className="h100 flexColumn flexCenter">
            <div className="mBottom16 textSecondary">{_l('加载失败，请重试')}</div>
            <Button onClick={() => location.reload()}>{_l('重新加载')}</Button>
          </div>
        ) : loading || loadingSwitchPermit || _.isEmpty(appPkg) ? (
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
            setLandRightComp={comp => {
              this.setState({ landRightComp: comp });
            }}
          />
        )}
        {landRightComp && <div className="landRightComp">{landRightComp}</div>}
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
