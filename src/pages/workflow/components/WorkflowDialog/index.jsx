import React, { Component } from 'react';
import { string, func } from 'prop-types';
import FullScreenCurtain from '../FullScreenCurtain';
import WorkflowSettings from '../../WorkflowSettings';

export default class WorkflowDialog extends Component {
  static propTypes = {
    flowId: string,
    onBack: func,
  };

  static defaultProps = {
    flowId: '',
    onBack: () => {},
  };

  render() {
    const { flowId, onBack } = this.props;
    const match = {
      params: {
        flowId,
      },
    };

    return (
      <FullScreenCurtain>
        <WorkflowSettings match={match} onBack={onBack} />
      </FullScreenCurtain>
    );
  }
}
