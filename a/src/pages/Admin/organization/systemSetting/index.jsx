import React, { Component } from 'react';
import CommonInfo from './component/CommonInfo';
import SubDomain from './component/SubDomain';
import WorkPlace from './component/WorkPlace';
import CloseNet from './component/CloseNet';
import PositionInfo from './component/PositionInfo';
import Config from '../../config';

export default class OrgInfo extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('基础信息'));
    this.state = {
      level: 1,
    };
  }
  componentWillMount() {
    if (this.props.location.search === '?destroy') {
      this.setState({ level: 4 });
    }
    if (this.props.location.search === '?level3') {
      this.setState({ level: 3 });
    }
    if (this.props.location.search === '?level5') {
      this.setState({ level: 5 });
    }
  }

  renderBodyContent = () => {
    const { level } = this.state;
    switch (level) {
      case 1:
        return <CommonInfo setLevel={this.setLevel} level={level} />;
      case 2:
        return <SubDomain setLevel={this.setLevel} />;
      case 3:
        return <WorkPlace setLevel={this.setLevel} />;
      case 4:
        return <CloseNet setLevel={this.setLevel} />;
      case 5:
        return <PositionInfo setLevel={this.setLevel} />;
    }
  };

  setLevel = level => {
    this.setState({ level });
  };

  render() {
    return <div className="orgManagementWrap">{this.renderBodyContent()}</div>;
  }
}
