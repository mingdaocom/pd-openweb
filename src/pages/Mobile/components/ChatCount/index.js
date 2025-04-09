import React, { Fragment, Component } from 'react';
import discussionAjax from 'src/api/discussion';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import DiscussInfo from 'mobile/Discuss';
import { handlePushState, compatibleMDJS } from 'src/util';
import _ from 'lodash';

const ChartCountWrap = styled.div`
  padding: 0 10px;
  width: auto;
  height: 32px;
  color: #757575;
  text-align: center;
  line-height: 32px;
  border-radius: 16px;
  background-color: #fff;
  box-shadow: 0 3px 6px 0px rgba(0, 0, 0, 0.16);
  position: fixed;
  bottom: 60px;
  right: 20px;
  z-index: 99;
  &.low {
    bottom: 20px;
  }
`;

export default class ChatCount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      discussionCount: 0,
      visible: false,
    };
  }

  componentDidMount() {
    const { autoOpenDiscuss } = this.props;
    this.getDiscussionsCount();
    if (autoOpenDiscuss) {
      this.setState({ visible: true });
    }
  }

  getDiscussionsCount = () => {
    const { worksheetId, rowId, allowExAccountDiscuss, exAccountDiscussEnum } = this.props;
    let entityType = 0;
    //外部用户且未开启讨论 不能内部讨论
    if (md.global.Account.isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1) {
      entityType = 2;
    }
    discussionAjax
      .getDiscussionsCount({
        sourceId: worksheetId + '|' + rowId,
        sourceType: 8,
        entityType,
      })
      .then(res => {
        this.setState({ discussionCount: res.data });
      });
  };

  render() {
    const {
      appId,
      worksheetId,
      rowId,
      viewId,
      onClick = _.noop,
      autoOpenDiscuss,
      originalData,
      className,
      recordDiscussSwitch,
      recordLogSwitch,
      projectId,
      ...rest
    } = this.props;
    const { discussionCount, visible } = this.state;
    return (
      <Fragment>
        <ChartCountWrap
          className={className}
          onClick={() => {
            compatibleMDJS(
              'showDiscussion',
              {
                projectId, // 网络ID
                appId, // 应用ID
                sheetId: worksheetId, // 工作表ID
                viewId: viewId, // 视图ID
                rowId, // 记录ID, 为空则打开工作表讨论/日志
                showLog: !md.global.Account.isPortal && recordLogSwitch, // 根据应用权限判断是否开启日志显示
                showDiscussion: recordDiscussSwitch, // 根据应用权限判断是否开启讨论显示
                controls: (this.props.formData || []).filter(v => v.type === 26), // 传入所有成员字段, 包含创建人, 最近修改人和拥有者
                success: res => {
                  // 给到最终讨论数量, 可能会有多次回调, 每次都更新计数即可
                  let count = res.count;
                  this.setState({ discussionCount: count });
                },
              },
              () => {
                handlePushState('page', 'discussInfos');
                this.setState({ visible: true });
                onClick();
              },
            );
          }}
        >
          <Icon icon={recordDiscussSwitch ? 'chat' : 'assignment'} className="TxtMiddle Font20" />
          {recordDiscussSwitch && <span className="mLeft5">{discussionCount}</span>}
        </ChartCountWrap>
        <DiscussInfo
          isModal
          className="full"
          visible={visible}
          {...rest}
          appId={appId}
          worksheetId={worksheetId}
          rowId={rowId}
          viewId={viewId}
          originalData={originalData}
          projectId={projectId}
          discussionCount={discussionCount}
          getDiscussionsCount={this.getDiscussionsCount}
          onClose={() => {
            this.setState({
              visible: false,
            });
            if (autoOpenDiscuss) {
              window.mobileNavigateTo(location.pathname, true);
            }
          }}
          onAddCount={() => {
            this.setState({
              discussionCount: discussionCount + 1,
            });
          }}
        ></DiscussInfo>
      </Fragment>
    );
  }
}
