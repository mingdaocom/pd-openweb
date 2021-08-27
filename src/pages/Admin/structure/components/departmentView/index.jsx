import React from 'react';
import { connect } from 'react-redux';
import DepartmentTree from './departmentTree';

class TreeView extends React.Component {
  render() {
    const { root } = this.props;
    return (
      <div
        className=""
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: '24px',
          top: '274px',
          height: 'auto', // override
          zIndex: 0,
        }}>
        <DepartmentTree id={root} autoLoad={true} isRoot={true} />
      </div>
    );
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
