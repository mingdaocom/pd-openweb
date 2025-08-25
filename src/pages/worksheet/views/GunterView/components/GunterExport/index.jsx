import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DocumentTitle from 'react-document-title';
import _ from 'lodash';
import moment from 'moment';
import { LoadDiv } from 'ming-ui';
import { loadWorksheet, updateBase } from 'worksheet/redux/actions';
import Gunter from 'src/pages/worksheet/views/GunterView';
import printGunter from './print';
import './index.less';

@connect(
  state => ({
    ..._.pick(state.sheet, ['base', 'views']),
    ..._.pick(state.sheet.gunterView, ['loading']),
  }),
  dispatch => bindActionCreators({ updateBase, loadWorksheet }, dispatch),
)
export default class GunterExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
    };
  }
  componentDidMount() {
    const { match } = this.props;
    this.props.updateBase(match.params);
    this.props.loadWorksheet(match.params.worksheetId);
  }
  componentWillReceiveProps({ loading, views, base }) {
    if (loading !== this.props.loading) {
      setTimeout(() => {
        const view = _.find(views, { viewId: base.viewId });
        const name = `${view.name}${moment().format('_YYYYMMDDHHmmSS')}`;
        printGunter(name).then(error => {
          if (error) {
            this.setState({ error: true });
          }
        });
      }, 1000);
    }
  }
  renderContent() {
    const { base, views } = this.props;
    if (views.length) {
      const view = _.find(views, { viewId: base.viewId });
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
    const view = _.find(views, { viewId: base.viewId });
    return (
      <div className="gunterExportLoading">
        <div className="flexColumn">
          {error ? (
            <Fragment>
              <div className="mTop10 Gray_75">{_l('导出失败，请缩小视图类型再尝试~')}</div>
              <DocumentTitle title={_l('导出失败')} />
            </Fragment>
          ) : (
            <Fragment>
              <LoadDiv size="big" />
              <div className="mTop10 Gray_75">{_l('%0正在导出，请稍等...', view ? view.name : '')}</div>
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
}
