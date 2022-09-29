import React, { Component, Fragment } from 'react';
import { string } from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Route } from 'react-router-dom';
import { getSuffix } from 'src/pages/PortalAccount/util';
import api from 'src/api/homeApp';
import { navigateTo } from 'router/navigateTo';
import { browserIsMobile } from 'src/util';

export default class WithTitle extends Component {
  static propTypes = {
    title: string,
  };

  compatibleWorksheetRoute = worksheetId => {
    //工作表老路由id补齐
    api.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId, workSheetId }) => {
      if (appId && appSectionId) {
        navigateTo(`/app/${appId}/${appSectionId}/${workSheetId}`, true);
      }
    });
  };

  renderComponentWithTitle = props => {
    const { title, component: Comp, ...rest } = this.props;

    // 外部门户 并且应用id对应不上 自定义后缀也对应不上
    if (
      md.global.Account.isPortal &&
      ![md.global.Account.appId, md.global.Account.addressSuffix].includes(
        _.get(this.props, 'computedMatch.params.appId'),
      ) &&
      getSuffix(location.href) !== md.global.Account.addressSuffix
    ) {
      if (location.href.indexOf('worksheet/') >= 0 && _.get(this.props, 'computedMatch.params.worksheetId')) {
        this.compatibleWorksheetRoute(_.get(this.props, 'computedMatch.params.worksheetId'));
      } else {
        location.href = `${window.subPath || ''}/logout?ReturnUrl=${encodeURIComponent(location.href)}`;
      }
    }
    //h5打开外部门户自定义后缀地址访问 地址处理
    if (
      md.global.Account.isPortal &&
      browserIsMobile() &&
      getSuffix(location.href) === md.global.Account.addressSuffix
    ) {
      let url = location.href;
      url = url.replace(md.global.Account.addressSuffix, 'app/' + md.global.Account.appId);
      location.href = url;
    }

    return (
      <Fragment>
        {title && <DocumentTitle title={title} />}
        <Comp {...props} {...rest} />
      </Fragment>
    );
  };

  render() {
    const { title, component, ...rest } = this.props;
    return <Route {...rest} component={this.renderComponentWithTitle} />;
  }
}
