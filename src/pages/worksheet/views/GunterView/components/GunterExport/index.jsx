import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import moment from 'moment';
import qs from 'query-string';
import { LoadDiv } from 'ming-ui';
import { loadWorksheet, updateBase } from 'worksheet/redux/actions';
import { restoreGunterExportFilters } from 'worksheet/redux/actions/gunterview';
import Gunter from 'src/pages/worksheet/views/GunterView';
import { takeGunterExportFilters } from './filterSnapshot';
import printGunter from './print';
import './index.less';

let GunterExport = class GunterExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
      ready: false,
    };
  }

  componentDidMount() {
    const { match } = this.props;

    this.mounted = true;
    try {
      this.filterSnapshot = takeGunterExportFilters(qs.parse(location.search).exportId, match.params);
    } catch {
      this.setState({ error: _l('导出条件已失效，请返回视图重新导出') });
      return;
    }

    this.props.updateBase(match.params);
    this.props.loadWorksheet(match.params.worksheetId);
  }

  componentDidUpdate(prevProps) {
    const { loading, views, base, worksheetInfo, worksheetError, restoreGunterExportFilters } = this.props;

    if (this.state.error) return;

    if (worksheetError) {
      this.setState({ error: _l('导出失败，请返回视图重新导出') });
      return;
    }

    const view = _.find(views, { viewId: base.viewId });

    if (!this.state.ready) {
      if (
        worksheetInfo.worksheetId !== this.props.match.params.worksheetId ||
        worksheetInfo.isRequestingRelationControls !== false ||
        this.restoringFilters
      ) {
        return;
      }

      if (!view) {
        this.setState({ error: _l('导出失败，请返回视图重新导出') });
        return;
      }

      this.restoringFilters = true;
      if (this.filterSnapshot) restoreGunterExportFilters(this.filterSnapshot);
      this.setState({ ready: true });
      return;
    }

    if (!view || !prevProps.loading || loading || this.printStarted) return;

    this.printStarted = true;
    this.printTimer = setTimeout(() => {
      const name = `${view.name}${moment().format('_YYYYMMDDHHmmSS')}`;

      Promise.resolve()
        .then(() => printGunter(name))
        .then(error => {
          if (error) this.handlePrintError();
        })
        .catch(this.handlePrintError);
    }, 1000);
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.printTimer);
  }

  handlePrintError = () => {
    if (this.mounted) {
      this.setState({ error: _l('导出失败，请缩小视图类型再尝试~') });
    }
  };

  renderContent() {
    const { base, views } = this.props;

    if (!this.state.ready) return null;

    if (views.length) {
      const view = _.find(views, {
        viewId: base.viewId,
      });

      return (
        <Fragment>
          <Gunter view={view} />
          <DocumentTitle title={_l('%0正在导出，请稍候...', view.name)} />
        </Fragment>
      );
    } else {
      return <div>gunter loading</div>;
    }
  }

  renderLoading() {
    const { error } = this.state;
    const { base, views } = this.props;

    const view = _.find(views, {
      viewId: base.viewId,
    });

    return (
      <div className="gunterExportLoading">
        <div className="flexColumn">
          {error ? (
            <Fragment>
              <div className="mTop10 textSecondary">{error}</div>
              <DocumentTitle title={_l('导出失败')} />
            </Fragment>
          ) : (
            <Fragment>
              <LoadDiv size="big" />
              <div className="mTop10 textSecondary">{_l('%0正在导出，请稍等...', view ? view.name : '')}</div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }

  render() {
    return (
      <Fragment>
        {this.renderContent()}
        {this.renderLoading()}
      </Fragment>
    );
  }
};
GunterExport = connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'views', 'worksheetInfo']),
    worksheetError: state.sheet.error,
    ..._.pick(state.sheet.gunterView, ['loading']),
  }),
  dispatch =>
    bindActionCreators(
      {
        updateBase,
        loadWorksheet,
        restoreGunterExportFilters,
      },
      dispatch,
    ),
)(GunterExport);
export default GunterExport;
