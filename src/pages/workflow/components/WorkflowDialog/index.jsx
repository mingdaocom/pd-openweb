import React, { Component } from 'react';
import { func, string } from 'prop-types';
import WorkflowSettings from '../../WorkflowSettings';
import FullScreenCurtain from '../FullScreenCurtain';

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
