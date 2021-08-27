import React, { Component } from 'react';
import CommonInfo from './component/CommonInfo';
import SubDomain from './component/SubDomain';
import WorkPlace from './component/WorkPlace';
import CloseNet from './component/CloseNet'
import Config from '../config';
import './index.less';

export default class OrgInfo extends Component {
  constructor() {
    super();
    Config.setPageTitle(_l('组织信息'));
    this.state = {
      level: 1,
    };
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
        return <CloseNet setLevel={this.setLevel}/>
    }
  };

  setLevel = level => {
    this.setState({ level });
  };

  render() {
    return (
      <div className="system-set-container">
        {this.renderBodyContent()}
      </div>
    );
  }
}
