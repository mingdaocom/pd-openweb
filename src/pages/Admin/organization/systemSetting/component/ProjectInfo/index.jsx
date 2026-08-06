import React, { Component } from 'react';
import CloseNet from '../CloseNet';
import CommonInfo from '../CommonInfo';
import PositionInfo from '../PositionInfo';
import SubDomain from '../SubDomain';
import WorkPlace from '../WorkPlace';

export default class ProjectInfo extends Component {
  constructor() {
    super();
    let level = 1;

    if (window.location.search === '?destroy') {
      level = 4;
    }

    if (window.location.search === '?level3') {
      level = 3;
    }

    if (window.location.search === '?level5') {
      level = 5;
    }

    this.state = { level };
  }

  setLevel = level => {
    const { changeShowHeader } = this.props;
    this.setState({ level }, () => {
      changeShowHeader(level === 1);
    });
  };

  render() {
    const { changeTab } = this.props;
    const { level } = this.state;

    switch (level) {
      case 1:
        return <CommonInfo setLevel={this.setLevel} level={level} onViewCert={() => changeTab('certinfo')} />;

      case 2:
        return <SubDomain setLevel={this.setLevel} />;
      case 3:
        return <WorkPlace setLevel={this.setLevel} />;
      case 4:
        return <CloseNet setLevel={this.setLevel} />;
      case 5:
        return <PositionInfo setLevel={this.setLevel} />;
    }
  }
}
