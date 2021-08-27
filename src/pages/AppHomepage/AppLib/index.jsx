import React, { Component } from 'react';
import loadScript from 'load-script';
import { connect } from 'react-redux';
import { upgradeVersionDialog } from 'src/util';
import { LoadDiv } from 'ming-ui';
import * as actions from 'src/pages/chat/redux/actions';

@connect(_ => ({}))
class AppLib extends Component {
  constructor(props) {
    super(props);
    let str = 'https://alifile.mingdaocloud.com/open/js/applibrary.js' + '?' + moment().format('YYYYMMDD');
    this.state = {
      str,
    };
  }
  componentDidMount() {
    $('.loadBoxForWarehouse').hide();
    const { md = {} } = window;
    const { global = {} } = md;
    const { Config = {}, Account = {} } = global;
    const { AppFileServer = '', IsLocal } = Config;
    const { accountId = '', projects = [], avatar } = Account;

    loadScript(this.state.str, err => {
      if (!err && window.MDLibrary) {
        window.MDLibrary({
          upgradeVersionDialog: data => {
            const licenseType = _.get(_.find(projects, item => item.projectId === data.projectId) || {}, 'licenseType');
            return upgradeVersionDialog({ ...data, isFree: licenseType === 0 });
          },
          MDAppLibraryId: 'containerAppLib',
          getUrl: 'https://pd.mingdao.com/api/',
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
        });
      }
    });
    $('.appManagementHeaderWrap .active').on('click', () => {
      location.href = '/app/lib';
    });
  }
  componentWillUnmount() {
    let divStr = $(`script[src="${this.state.str}"]`);
    divStr.length > 0 && divStr.remove();
    $('html').removeClass('appListPage');
  }

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
