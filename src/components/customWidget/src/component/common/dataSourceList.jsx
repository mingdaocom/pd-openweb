import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './dataSourceList.less';

class DataSourceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: props.list.slice(0, 5),
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      list: props.list.slice(0, 5),
    });
  }

  render() {
    let items = this.state.list.map((item, i, list) => {
      return <li key={item.value}>{item.label}</li>;
    });

    return <ul className="dataSourceList">{items}</ul>;
  }
}

DataSourceList.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any,
      label: PropTypes.label,
    })
  ),
};

DataSourceList.defaultProps = {
  list: [],
};

export default DataSourceList;
