import PropTypes from 'prop-types';
import React, { Component } from 'react';

import PrintContainer from './container';
import PrintGroup from './group';

class UiPrintView extends Component {
  /**
   * 渲染 PrintContainer 列表
   */
  renderContents = () => {
    const contents = [];

    let groupList = [];

    this.props.data.map((item, i, list) => {
      if (item.type && item.type === 'divider') {
        // divider
        if (groupList.length) {
          contents.push(<PrintContainer key={`formcontainer-${i}`}>{groupList}</PrintContainer>);

          groupList = [];
        }
      } else {
        // group
        groupList.push(
          <PrintGroup
            key={`formgroup-${i}`}
            {...item}
            saveForm={(groupId, data) => {
              return this.saveForm(groupId, data);
            }}
          />
        );
      }
      return null;
    });

    if (groupList.length) {
      contents.push(<PrintContainer key="formcontainer-0">{groupList}</PrintContainer>);

      groupList = [];
    }

    return contents;
  };

  render() {
    let contents = [];
    if (this.props.data && this.props.data.length) {
      contents = this.renderContents();
    }

    return <div>{contents}</div>;
  }
}

UiPrintView.propTypes = {
  /**
   * 表单数据
   */
  data: PropTypes.any,
};

UiPrintView.defaultProps = {
  data: null,
};

export default UiPrintView;
