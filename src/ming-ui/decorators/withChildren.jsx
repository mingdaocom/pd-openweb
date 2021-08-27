/**
 * 使用后，添加子组件，组件的props会进入data里，并根据position排序,子组件需按position从小到达排列，无position默认排后面
 * 用法:
 * var insertChildrenComponent = require('ming-ui/decorators/insertChildrenComponent');
 *
 * // ES5/ES6:
 * var Parent = React.createClass({...});
 * Parent = insertChildrenComponent(Parent);
 *
 * // ES7:
 * @insertChildrenComponent
 * class Parent {...}
 *
 * var component = <Parent data={data}>
 *  <Child text="text" id="id" position={0}></child>
 *  <Child text="text" id="id" position={5}></child>
 * </Parent>;
 */

/**
 * 使用后，添加子组件，组件的props会进入data里，并根据position排序,子组件需按position从小到达排列，无position默认排后面
 * 用法:
 * var insertChildrenComponent = require('ming-ui/decorators/insertChildrenComponent');
 *
 * // ES5/ES6:
 * var Parent = React.createClass({...});
 * Parent = insertChildrenComponent(Parent);
 *
 * // ES7:
 * @insertChildrenComponent
 * class Parent {...}
 *
 * var component = <Parent data={data}>
 *  <Child text="text" id="id" position={0}></child>
 *  <Child text="text" id="id" position={5}></child>
 * </Parent>;
 */

/**
 * 使用后，添加子组件，组件的props会进入data里，并根据position排序,子组件需按position从小到达排列，无position默认排后面
 * 用法:
 * var insertChildrenComponent = require('ming-ui/decorators/insertChildrenComponent');
 *
 * // ES5/ES6:
 * var Parent = React.createClass({...});
 * Parent = insertChildrenComponent(Parent);
 *
 * // ES7:
 * @insertChildrenComponent
 * class Parent {...}
 *
 * var component = <Parent data={data}>
 *  <Child text="text" id="id" position={0}></child>
 *  <Child text="text" id="id" position={5}></child>
 * </Parent>;
 */

/**
 * 使用后，添加子组件，组件的props会进入data里，并根据position排序,子组件需按position从小到达排列，无position默认排后面
 * 用法:
 * var insertChildrenComponent = require('ming-ui/decorators/insertChildrenComponent');
 *
 * // ES5/ES6:
 * var Parent = React.createClass({...});
 * Parent = insertChildrenComponent(Parent);
 *
 * // ES7:
 * @insertChildrenComponent
 * class Parent {...}
 *
 * var component = <Parent data={data}>
 *  <Child text="text" id="id" position={0}></child>
 *  <Child text="text" id="id" position={5}></child>
 * </Parent>;
 */

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

module.exports = withChildren;
