import PropTypes from 'prop-types';
import React, { Children } from 'react';

function withChildren(exceptionList, Component = exceptionList) {
  class withChildrenComponent extends React.Component {
    static propTypes = {
      children: PropTypes.any, // 子组件
      data: PropTypes.array,
    };

    formatData(data) {
      data = _.cloneDeep(data);
      Children.map(this.props.children, (child) => {
        if (typeof child === 'object') {
          let position = child.props.position;
          if (position === undefined) {
            position = data.length;
          }
          data.splice(position, 0, { ...child.props });
        }
      });
      return data;
    }

    render() {
      return <Component {...this.props} data={this.formatData(this.props.data)} />;
    }
  }

  return withChildrenComponent;
}

export default withChildren;
