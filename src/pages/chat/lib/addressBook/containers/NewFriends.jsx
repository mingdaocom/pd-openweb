import React from 'react';

import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';

import NewFriendsList from '../components/NewFriendsList';
import RecommendsList from '../components/RecommendsList';
import ListNull from '../components/ListNull';

export default class NewFriends extends React.Component {
  constructor() {
    super();

    this.state = {
      loadedRecommends: false,
      haveRecommends: true,
      loadedApplys: false,
      haveApplys: true,
      firstLoading: true,
    };

    this.updateRecommendsFlag = this.updateRecommendsFlag.bind(this);
    this.updateApplysFlag = this.updateApplysFlag.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({
      loadedRecommends: false,
      haveRecommends: true,
      loadedApplys: false,
      haveApplys: true,
      firstLoading: true,
    });
  }

  updateRecommendsFlag(haveRecommends) {
    this.setState({
      loadedRecommends: true,
      haveRecommends,
      firstLoading: false,
    });
  }

  updateApplysFlag(haveApplys) {
    this.setState({
      loadedApplys: true,
      haveApplys,
      firstLoading: false,
    });
  }

  renderContent() {
    const { firstLoading, loadedApplys, loadedRecommends, haveRecommends, haveApplys } = this.state;
    if (loadedApplys && loadedRecommends && (!haveApplys && !haveRecommends)) {
      return <ListNull type="newfriends" />;
    }
    return (
      <ScrollView>
        <div className="pAll20">
          <NewFriendsList isLoaded={loadedApplys} update={this.updateApplysFlag} />
          <RecommendsList isLoaded={loadedRecommends} update={this.updateRecommendsFlag} />
          {firstLoading ? <LoadDiv className="mTop20" /> : null}
        </div>
      </ScrollView>
    );
  }

  render() {
    return <div className="contacts-new-friends">{this.renderContent()}</div>;
  }
}
