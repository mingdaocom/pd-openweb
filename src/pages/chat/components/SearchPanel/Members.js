import React, { Component } from 'react';
import cx from 'classnames';
import { LoadDiv, ScrollView } from 'ming-ui';
import GroupController from 'src/api/group';
import { Member } from '../Members/Panel';

export default class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageIndex: 1,
      members: [],
    };
  }
  componentDidMount() {
    const { searchText } = this.props;
    this.updateMembers(searchText);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.searchText !== this.props.searchText) {
      this.setState(
        {
          loading: false,
          pageIndex: 1,
          members: [],
        },
        () => {
          this.updateMembers(nextProps.searchText);
        },
      );
    }
  }
  updateMembers(searchText) {
    const { session } = this.props;
    const { loading, pageIndex, members } = this.state;
    if (loading || !pageIndex) {
      return;
    }
    this.setState({
      loading: true,
    });
    GroupController.getGroupUsers({
      groupId: session.id,
      pageIndex,
      keywords: searchText,
      pageSize: 18,
    }).then(result => {
      const { groupUsers } = result;
      this.setState({
        pageIndex: groupUsers && groupUsers.length >= 18 ? pageIndex + 1 : 0,
        loading: false,
        members: members.concat(groupUsers || []),
      });
    });
  }
  handleScrollEnd() {
    const { searchText } = this.props;
    this.updateMembers(searchText);
  }
  render() {
    const { members, loading } = this.state;
    return (
      <ScrollView
        className="ChatPanel-SearchPanelContent ChatPanel-SearchPanel-Member"
        onScrollEnd={this.handleScrollEnd.bind(this)}
      >
        {members.map(item => (
          <Member item={item} key={item.accountId} onOpenSession={this.props.onOpenSession} />
        ))}
        <LoadDiv className={cx('loading', { Hidden: !loading })} size="small" />
        {!loading && !members.length ? (
          <div className="nodata-wrapper">
            <div className="nodata-img" />
            <p>{_l('无匹配结果')}</p>
          </div>
        ) : undefined}
      </ScrollView>
    );
  }
}
