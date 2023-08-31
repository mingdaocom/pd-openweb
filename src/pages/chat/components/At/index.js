import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import config from '../../utils/config';
import * as utils from '../../utils';
import * as ajax from '../../utils/ajax';
import * as socket from '../../utils/socket';
import Constant from '../../utils/constant';
import ScrollView from 'ming-ui/components/ScrollView';
import groupAjax from 'src/api/group';

export default class At extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      loading: false,
      isMore: true,
      visible: true,
      member: [],
    };
  }
  componentDidMount() {
    const { session } = this.props;
    groupAjax.getGroupUsers({
      groupId: session.id,
      pageIndex: 1,
      pageSize: 20,
      keywords: '',
    }).then((res) => {
      this.setState({
        member: res.groupUsers,
      });
    });
  }
  handleScrollEnd() {
    console.log('end');
  }
  render() {
    const { member } = this.state;
    return (
      <div className="At">
        <ScrollView onScrollEnd={this.handleScrollEnd.bind(this)}>
          {member.map(item => (
            <div key={item.accountId} className="At-item" onClick={this.props.onSelected.bind(this, item)}>
              <img className="At-item-avatar" src={item.avatar} />
              <div className="At-item-name">{item.fullname}</div>
            </div>
          ))}
        </ScrollView>
      </div>
    );
  }
}
