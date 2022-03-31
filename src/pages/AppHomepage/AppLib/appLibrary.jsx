import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import loadScript from 'load-script';
import { LoadDiv } from 'ming-ui';
// import preall from 'src/common/preall';
import styled from 'styled-components';
export const Wrap = styled.div`
  .appCon {
    max-height: 100% !important;
  }
`;
// @preall
class AppLib extends Component {
  constructor(props) {
    super(props);
    // let str =
    //   'https://alifile.mingdaocloud.com/open/js/applibrary.js' +
    //   '?' +
    //   moment().format('YYYYMMDD');
    let str = '/src/library/applibrary.js';
    this.state = {
      str,
      param: null,
    };
    window.getPara = para => {
      const { ...rest } = JSON.parse(Base64.decode(para));
      // const { ...rest } = para;
      this.setState({
        param: rest,
      });
    };
    // const { md = {} } = window;
    // const { global = {} } = md;
    // const { Config = {}, Account = {} } = global;
    // const { AppFileServer = '', IsLocal } = Config;
    // const { accountId = '', projects = [], avatar } = Account;
    // let data = {
    //   upgradeVersionDialog: data => {
    //     // const licenseType = _.get(_.find(projects, item => item.projectId === data.projectId) || {}, 'licenseType');
    //     // return upgradeVersionDialog({ ...data, isFree: licenseType === 0 });
    //   },
    //   MDAppLibraryId: 'containerAppLib',
    //   getUrl: __api_server__.main,
    //   installUrl: AppFileServer,
    //   accountId,
    //   projects,
    //   // getUrl: 'http://wwwapi-next.dev.mingdao.net/', //"http://wwwapi.dev.mingdao.net/",
    //   // installUrl: 'http://118.24.27.163:29288/',
    //   isPrivate: IsLocal,
    //   avatar: avatar,
    //   contactUser: accountId => {
    //     // this.props.dispatch(actions.addUserSession(accountId));
    //   },
    // };
    // setTimeout(() => {
    //   window.getPara(data);
    // }, 3000);
  }
  componentDidMount() {
    $('.loadBoxForWarehouse').hide();
  }

  componentWillUpdate(nextProps, nextState) {
    if (!!nextState.param) {
      this.getReander();
    }
  }

  componentWillUnmount() {
    let divStr = $(`script[src="${this.state.str}"]`);
    divStr.length > 0 && divStr.remove();
  }

  getReander = () => {
    loadScript(this.state.str, err => {
      if (!err && window.MDLibrary && this.state.param) {
        window.MDLibrary({ ...this.state.param, MDAppLibraryId: 'containerAppLib' });
      }
    });
  };

  render() {
    return (
      <Wrap id="containerAppLib">
        <LoadDiv
          style={{
            paddingTop: document.documentElement.clientHeight / 2,
            paddingBottom: document.documentElement.clientHeight / 2,
          }}
        />
      </Wrap>
    );
  }
}

ReactDOM.render(<AppLib />, document.getElementById('app'));
