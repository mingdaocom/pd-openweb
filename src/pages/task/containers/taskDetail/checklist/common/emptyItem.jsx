import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import config from './config';

const cardTarget = {
  hover(props, monitor) {
    if (!monitor.isOver({ shallow: true })) {
      props.checklistItemHover(props.index, props.topIndex);
    }
  },
};

@DropTarget(config.CHECKLIST_ITEM, cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))
export default class EmptyItem extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    topIndex: PropTypes.number.isRequired, // 上一级的index
    checklistItemHover: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return this.props.connectDropTarget(<div className="emptyItem" />);
  }
}
