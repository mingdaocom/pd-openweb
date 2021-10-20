import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { Tabs, Flex } from 'antd-mobile';
import * as actions from './redux/actions';
import DiscussList from './DiscussList';
import AttachmentList from './AttachmentList';
import Logs from './Logs';
import Back from '../components/Back';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import './index.less';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');

const tabs = [
  { title: _l('讨论'), type: 1 },
  { title: _l('文件'), type: 2 },
  { title: _l('日志'), type: 3 },
];

const tabsHeight = 43;
const bottomHeight = 52;

const getGroupId = (appSectionDetail, worksheetId) => {
  let groupId = null;
  for(let i = 0; i < appSectionDetail.length; i++) {
    let section = appSectionDetail[i];
    for(let j = 0; j < section.workSheetInfo.length; j++) {
      if (section.workSheetInfo[j].workSheetId === worksheetId) {
        groupId = section.appSectionId;
        break;
      }
    }
    if (groupId) break;
  }
  return groupId;
}

class Discuss extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: document.documentElement.clientHeight - tabsHeight - bottomHeight,
      groupId: null,
      switchPermit: {},
    }
  }
  componentDidMount() {
    const { params } = this.props.match;
    if (_.isEmpty(params.rowId)) {
      this.getGroupInfo();
    }
    worksheetAjax.getSwitchPermit({
      appId: params.appId,
      worksheetId: params.worksheetId,
    }).then(res => {
      this.setState({
        switchPermit: res,
      });
    });
  }
  componentWillUnmount() {
    this.props.dispatch(actions.emptySheetDiscussion());
    this.props.dispatch(actions.emptySheetLogs());
  }
  navigateTo(url) {
    if (window.isPublicApp && !new URL('http://z.z' + url).hash) {
      url = url + '#publicapp' + window.publicAppAuthorization;
    }
    this.props.history.push(url);
  }
  getGroupInfo() {
    const { params } = this.props.match;
    const { appId, worksheetId } = params;
    homeAppAjax.getAppInfo({
      appId,
    }).then(result => {
      this.setState({
        groupId: getGroupId(result.appSectionDetail, worksheetId),
      });
    });
  }
  render() {
    const { params } = this.props.match;
    const { worksheetId, rowId } = params;
    const style = { height: this.state.height };
    const { switchPermit } = this.state;
    return (
      <div className="discussTabs">
        <Tabs
          tabs={isOpenPermit(permitList.logSwitch, switchPermit) ? tabs : tabs.filter(item => item.type !== 3)}
          tabBarInactiveTextColor="#9e9e9e"
          renderTabBar={props => <Tabs.DefaultTabBar {...props} />}
        >
          <div style={style}>
            <DiscussList
              worksheetId={worksheetId}
              rowId={rowId}
              height={style.height}
              onReply={(discussionId, name) => {
                this.navigateTo(`/mobile/addDiscuss/${params.appId}/${params.worksheetId}/${params.viewId}/${params.rowId || null}/${discussionId}|${name}`);
              }}
            />
          </div>
          <div style={style}>
            <AttachmentList
              worksheetId={params.worksheetId}
              rowId={rowId}
              height={style.height}
            />
          </div>
          <div style={style}>
            <Logs
              worksheetId={params.worksheetId}
              rowId={rowId || ''}
              height={style.height}
            />
          </div>
        </Tabs>
        <Flex
          className="participation"
          onClick={() => {
            if (window.isPublicApp) {
              alert(_l('预览模式下，不能操作'), 3);
              return;
            }
            this.navigateTo(`/mobile/addDiscuss/${params.appId}/${params.worksheetId}/${params.viewId}/${params.rowId || ''}`);
          }}
        >
          <div className="text">{_l('参与讨论...')}</div>
          <Icon icon="h5_reply" />
        </Flex>
        <Back
          onClick={() => {
            const { groupId } = this.state;
            const { location } = this.props.history;
            if (location.search.includes('processRecord')) {
              history.back();
              return;
            }
            if (rowId) {
              this.navigateTo(`/mobile/record/${params.appId}/${params.worksheetId}/${params.viewId}/${rowId}`);
            } else if (groupId) {
              this.navigateTo(`/mobile/recordList/${params.appId}/${groupId}/${params.worksheetId}`);
            } else {
              history.back();
            }
          }}
        />
      </div>
    );
  }
}

export default connect((state) => {
  return {};
})(Discuss);
