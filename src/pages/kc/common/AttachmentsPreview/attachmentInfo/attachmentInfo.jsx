import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { FROM_TYPE } from '../constant/enum';
import * as Actions from '../actions/action';
import attachmentAjax from 'src/api/attachment';
import { cutStringWithHtml, htmlEncodeReg } from 'src/util';
import { createLinksForMessage } from 'src/components/common/function';
import moment from 'moment';

class attachmentInfo extends React.Component {
  static propTypes = {
    attachments: PropTypes.array,
    index: PropTypes.number,
    imageViewerFn: PropTypes.object,
    changeIndex: PropTypes.func,
    extra: PropTypes.object,
    fromType: PropTypes.number,
    toggleInfo: PropTypes.func,
    visible: PropTypes.bool,
  };

  state = {
    attachments: this.props.attachments,
    index: this.props.index,
    postDetails: this.props.extra.postDetails,
    visible: this.props.visible || false,
    showThumbnail: true,
    showDetailLink: true,
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
    });
  }

  toggleVisible = flag => {
    this.setState({
      visible: flag,
    });
  };

  loadPreviewMsg = () => {
    const _this = this;
    const index = this.props.index;
    const sourceNode = this.props.attachments[index].originNode || this.props.attachments[index].sourceNode;
    let postDetails;
    attachmentAjax
      .getPreViewMsg({
        postID: sourceNode.sourceID,
        commentID: sourceNode.commentID,
        fromType: sourceNode.fromType || this.props.fromType,
      })
      .then(data => {
        if (!data.result) {
          postDetails = _l('该内容已被删除或您没有查看权限');
          _this.setState({
            showDetailLink: false,
            postDetails,
          });
          // $('.attInfo .viewDetails .postDetails').hide();
          return;
        }

        const detailMsg = createLinksForMessage({
          message: data.result.replace(/\n/g, ' <br>'),
          rUserList: data.rUserList,
          rGroupList: data.rGroupList,
          categories: data.categories,
        });
        const tempStr = detailMsg.replace(cutStringWithHtml(detailMsg, 200, 5), '');
        if (tempStr.length > 0) {
          postDetails = cutStringWithHtml(detailMsg, 200, 5) + '...';
        } else {
          postDetails = cutStringWithHtml(detailMsg, 200, 5);
        }
        _this.setState({
          postDetails,
        });
      })
      .fail(() => {});
  };

  toggleInfo = () => {
    if (!this.state.visible) {
      this.props.toggleInfo(true);
    } else {
      this.props.toggleInfo(false);
    }
  };

  render() {
    if (!this.state.visible) {
      return (
        <div className="attachmentInfo" style={{ width: 0 }}>
          <div className="toggleBtn" onClick={this.toggleInfo}>
            <i className="icon-arrow-left-tip" />
          </div>
        </div>
      );
    }
    const index = this.props.index;
    const fromType = this.props.fromType;
    const sourceNode = this.props.attachments[index].originNode || this.props.attachments[index].sourceNode;
    const accountId = sourceNode.accountId;
    const sourceID = sourceNode.sourceID;
    const createUserAvatar = sourceNode.createUserAvatar;
    const createUserName = sourceNode.createUserName;
    const createTime = sourceNode.createTime.replace(/-/g, '/');
    let postDetails;
    if (this.state.postDetails) {
      const postDetailsEle = document.createElement('div');
      postDetails = this.state.postDetails;
      postDetailsEle.innerHTML = postDetails;
      postDetails = postDetailsEle.innerHTML;
    } else {
      this.loadPreviewMsg();
    }
    let detailLink;
    switch (fromType) {
      case FROM_TYPE.TASK: {
        detailLink = '/apps/task/task_' + sourceID;
        break;
      }
      case FROM_TYPE.FOLDER: {
        detailLink = '/apps/task/folder_' + sourceID + '#detail';
        break;
      }
      case FROM_TYPE.CALENDAR: {
        detailLink = '/apps/calendar/detail_' + sourceID;
        break;
      }
      case FROM_TYPE.POST: {
        detailLink = '/feeddetail?itemID=' + sourceID;
        break;
      }
      default: {
        detailLink = '';
        break;
      }
    }

    return (
      <div className="attachmentInfo">
        <div className="toggleBtn active" onClick={this.toggleInfo}>
          <i className="icon-arrow-right-tip" />
        </div>
        <div className="attDetails">
          <div className="attCreator">
            <a href={'/user_' + accountId} target="_blank">
              <img className="attAvater" src={createUserAvatar} alt="" />
            </a>
            <span className="attCreatorName ellipsis">{htmlEncodeReg(createUserName)}</span>
          </div>
          <div className="attOperateTime">{moment(new Date(createTime)).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div className="attPostInfo">
            {postDetails ? <div dangerouslySetInnerHTML={{ __html: postDetails }} /> : <LoadDiv />}
          </div>
          <div className="viewDetails">
            {this.state.showDetailLink && (
              <a href={detailLink} className="postDetails" target="_blank">
                {_l('查看详情')}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    attachments: state.attachments,
    fromType: state.fromType,
    index: state.index,
    extra: state.extra || {},
    force: state.force,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeIndex: bindActionCreators(Actions.changeIndex, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(attachmentInfo);
