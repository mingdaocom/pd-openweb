import React from 'react';
import { withRouter } from 'react-router-dom';
import { Swiper } from 'antd-mobile';
import AddDialog from './AddDialog';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { pick, isEqual, map } from 'lodash';
import { Linkify, SvgIcon } from 'ming-ui';
import axios from 'axios';
import { browserIsMobile } from 'src/util';
import './index.less';

const url = !md.global.Account.accountId ? '/library' : '/app/lib';

@withRouter
class AppDetails extends React.Component {
  constructor(props) {
    super(props);
    this.saveRef = ref => {
      this.refDom = ref;
    };
  }
  state = {
    showDialog: false,
    data: [],
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    const keys = [].concat(['libraryId']);
    if (!isEqual(pick(this.props, keys), pick(prevProps, keys))) {
      this.fetch();
    }
  }

  IsPC = () => {
    let userAgentInfo = navigator.userAgent;
    let Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
    let flag = true;
    for (let v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  };

  fetch = () => {
    let baseUrl = (md && md.global && md.global.SysSettings && md.global.SysSettings.templateLibraryTypes === '2') ? __api_server__.main : 'https://pd.mingdao.com/api/';
    axios
      .post(`${baseUrl}AppManagement/GetAppLibraryDetail`, {
        libraryId: this.props.libraryId,
      })
      .then(result => {
        const { data } = result.data;
        if (data.length <= 0) {
          return window.mobileNavigateTo(!md.global.Account.accountId ? '/library' : '/app/lib');
        } else {
          this.setState({
            ...this.state,
            data: data,
          });
        }
      });
  };

  appDone = () => {
    if (window.isWxWork) {
      const { projects } = md.global.Account;
      if (projects.length) {
        this.addDialogEl.installApp(projects[0].projectId, this.props.libraryId);
      } else {
        alert(_l('您没有可安装模板的组织'), 3);
      }
    } else {
      this.setState({ showDialog: true });
    }
  };

  renderTag = categoryInfo => {
    return (
      <React.Fragment>
        {map(categoryInfo, ({ categoryId, name }) => (
          <span key={`more-${categoryId}`} className="tag Font13 mRight8">
            {name}
          </span>
        ))}
      </React.Fragment>
    );
  };

  render() {
    if (this.state.data.length <= 0) {
      return (
        <div className="mTop100">
          <LoadDiv />
        </div>
      );
    }
    const isMobile = browserIsMobile();
    const { name, intro, description, iconUrl, iconColor, cover, pictures, mobilePictures, categoryInfo } =
      this.state.data;
    return (
      <React.Fragment>
        <div className="flex detailsBox pAll20 WhiteBG">
          <div className="detailsHead">
            <div className="headLeft">
              <div className="appIcon Left mRight20" style={{ backgroundColor: iconColor }}>
                <SvgIcon url={iconUrl} fill="#fff" size={40} addClassName="mTop20" />
              </div>
              <div className="appTitle Left">
                <span className="Gray Font34 TxtLeft title Bold WordBreak">{name}</span>
                <br />
                {this.renderTag(categoryInfo)}
              </div>
            </div>
          </div>
          <div className="details">
            <div className="Font26 Gray_9e detailsTitle">{!intro ? '' : `“${intro}”`}</div>
            <p className="Font16 Gray detailsText">
              <Linkify properties={{ target: '_blank' }}>{description}</Linkify>
            </p>
            <Swiper className="mBottom50">
              {(mobilePictures.length ? mobilePictures : pictures).map((item, index) => (
                <Swiper.Item
                  key={index}
                  style={{
                    display: 'block',
                    position: 'relative',
                  }}
                >
                  <img
                    src={item.previewUrl}
                    style={{ width: '100%', verticalAlign: 'top' }}
                    onLoad={() => {
                      window.dispatchEvent(new Event('resize'));
                    }}
                  />
                </Swiper.Item>
              ))}
            </Swiper>
          </div>
          <AddDialog
            getRef={ref => (this.addDialogEl = ref)}
            visible={this.state.showDialog}
            onCancel={() => this.setState({ showDialog: false })}
            libraryId={this.props.libraryId}
            projectId={this.props.projectId}
          />
        </div>
        <div className="appOperation">
          <div className="btnForApp Font16 btn" onClick={this.appDone}>
            {_l('添加模板')}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default AppDetails;
