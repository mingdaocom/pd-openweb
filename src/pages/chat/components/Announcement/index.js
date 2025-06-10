import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import * as utils from '../../utils';
import Textarea from 'ming-ui/components/Textarea';
import GroupController from 'src/api/group';

export default class Announcement extends Component {
  constructor(props) {
    super(props);
    const { about } = this.props.session;
    this.state = {
      value: about,
      compile: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { session } = nextProps;
    if (session.about !== this.state.value) {
      this.setState({
        value: session.about,
      });
    }
  }
  handleChange(value) {
    this.setState({
      value,
    });
  }
  handleFocus() {
    this.setState({
      compile: true,
    });
  }
  handleBlur(event) {
    const { groupId } = this.props.session;
    const { value } = event.target;
    GroupController.updateGroupAbout({
      groupId,
      groupAbout: value,
    }).then((reuslt) => {
      if (reuslt) {
        this.props.updateGroupAbout(value);
      }
    });
    this.setState({
      compile: false,
    });
  }
  renderTextarea() {
    const { value } = this.state;
    return (
      <Textarea
        className="ChatPanel-Announcement-textarea"
        value={value}
        placeholder={_l('暂无群公告')}
        minHeight={25}
        maxHeight={80}
        onChange={this.handleChange.bind(this)}
        onFocus={this.handleFocus.bind(this)}
        onBlur={this.handleBlur.bind(this)}
      />
    );
  }
  render() {
    const { isAdmin } = this.props.session;
    const { value, compile } = this.state;
    return (
      <div className={cx('ChatPanel-Announcement ChatPanel-sessionInfo-item', { 'ChatPanel-Announcement-compile': compile })}>
        <div className="ChatPanel-Announcement-hander ChatPanel-sessionInfo-hander">{_l('群公告')}</div>
        <div className="ChatPanel-Announcement-body">
          <div className="ChatPanel-Announcement-text" dangerouslySetInnerHTML={{ __html: utils.convertGroupAbout(value) }} />
        </div>
      </div>
    );
  }
}
