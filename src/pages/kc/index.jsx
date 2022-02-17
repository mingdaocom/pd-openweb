import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import qs from 'query-string';
import KcLeft from './common/KcLeft';
import KcMain from './common/KcMain';
import './Kc.less';

@withRouter
export default class KcEntrypoint extends Component {
  componentDidMount() {
    $('html').addClass('AppKc');
  }
  componentWillUnmount() {
    $('html').removeClass('AppKc');
  }
  render() {
    const {
      match: {
        params: { path },
      },
    } = this.props;
    return (
      <div className="kc flexRow">
        <KcLeft path={path} query={qs.parse((location.search || '').slice(1))} />
        <KcMain appBaseUrl="/apps/kc" path={path} query={qs.parse((location.search || '').slice(1))} />
      </div>
    );
  }
}
