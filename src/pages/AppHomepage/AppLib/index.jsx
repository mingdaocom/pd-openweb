import React, { Component } from 'react';
import { connect } from 'react-redux';
import loadScript from 'load-script';
import _ from 'lodash';
import moment from 'moment';
import { LoadDiv } from 'ming-ui';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import * as actions from 'src/pages/chat/redux/actions';
import { emitter } from 'src/utils/common';

@connect(_ => ({}))
class AppLib extends Component {
  constructor(props) {
    super(props);
    let str = 'https://alifile.mingdaocloud.com/open/js/applibrary.js' + '?' + moment().format('YYYYMMDD');
    this.state = {
      str,
      projectId: localStorage.getItem('currentProjectId'),
    };
  }
  componentDidMount() {
    $('.loadBoxForWarehouse').hide();
    const { md = {} } = window;
    const { global = {} } = md;
    const { Config = {}, Account = {} } = global;
    const { AppFileServer = '', IsLocal } = Config;
    const { accountId = '', projects = [], avatar } = Account;
    emitter.addListener('CHANGE_CURRENT_PROJECT', this.reload);
    const param = {
      upgradeVersionDialog: data => {
        if (data.projectId === 'external') {
          alert(_l('安装失败'), 3);
        }
        const licenseType = _.get(_.find(projects, item => item.projectId === data.projectId) || {}, 'licenseType');
        return upgradeVersionDialog({ ...data, isFree: licenseType === 0 });
      },
      MDAppLibraryId: 'containerAppLib',
      getUrl: (md && md.global && md.global.SysSettings && md.global.SysSettings.templateLibraryTypes === '2') ? __api_server__.main : 'https://pd.mingdao.com/api/',
      installUrl: AppFileServer,
      accountId,
      projects,
      // getUrl: 'http://wwwapi-next.dev.mingdao.net/', //"http://wwwapi.dev.mingdao.net/",
      // installUrl: 'http://118.24.27.163:29288/',
      isPrivate: IsLocal,
      avatar: avatar,
      contactUser: accountId => {
        this.props.dispatch(actions.addUserSession(accountId));
      },
    };
    if (_.get(window, 'md.global.SysSettings.templateLibraryTypes') === '2') {
      import('src/library/applibrary').then(() => {
        if (window.MDLibrary) {
          window.MDLibrary(param);
        }
      });
    } else {
      loadScript(this.state.str, err => {
        if (!err && window.MDLibrary) {
          window.MDLibrary(param);
        }
      });
    }
  }

  componentWillUnmount() {
    let divStr = $(`script[src="${this.state.str}"]`);
    divStr.length > 0 && divStr.remove();
    $('html').removeClass('appListPage');
    emitter.removeListener('CHANGE_CURRENT_PROJECT', this.reload);
  }

  reload = () => {
    const projectId = localStorage.getItem('currentProjectId');
    if (projectId !== this.state.projectId) {
      location.href = `/app/lib?projectId=${projectId}`;
    }
  };

  render() {
    return (
      <div id="containerAppLib">
        <LoadDiv
          style={{
            paddingTop: document.documentElement.clientHeight / 2,
            paddingBottom: document.documentElement.clientHeight / 2,
          }}
        />
      </div>
    );
  }
}

export default AppLib;
