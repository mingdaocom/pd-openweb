import React from 'react';
import { connect } from 'react-redux';
import DepartmentTree from './departmentTree';

class TreeView extends React.Component {
  render() {
    const { root } = this.props;
    return <DepartmentTree id={root} autoLoad={true} isRoot={true} />;
  }
}

const mapStateToProps = state => {
  const {
    current: { root },
    entities: { departments },
  } = state;
  return {
    root,
    departments,
  };
};

const ConnectedTreeView = connect(mapStateToProps)(TreeView);

export default ConnectedTreeView;
