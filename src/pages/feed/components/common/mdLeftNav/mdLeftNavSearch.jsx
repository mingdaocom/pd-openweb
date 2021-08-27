import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import './mdLeftNavSearch.css';

class MDLeftNavSearch extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    onSearch: PropTypes.func,
    onChange: PropTypes.func,
  };

  handleKeyUp = (evt) => {
    if (evt.which === 13 && this.props.onSearch) {
      this.props.onSearch(evt.target.value);
    }
  };

  handleFocus = () => {
    $(ReactDom.findDOMNode(this))
      .addClass('ThemeBorderColor3')
      .removeClass('ThemeBorderColor8');
  };

  handleBlur = () => {
    $(ReactDom.findDOMNode(this))
      .removeClass('ThemeBorderColor3')
      .addClass('ThemeBorderColor8');
  };

  render() {
    const { onSearch, value, ...props } = this.props;

    return (
      <div className="mdLeftNavSearch ThemeBorderColor8">
        <span className="icon-search btnSearch ThemeColor9" title={_l('搜索')} />
        <input
          {...props}
          value={value || ''}
          onKeyUp={this.handleKeyUp}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          type="text"
          className="searchBox ThemeColor10"
          placeholder={_l('搜索')}
        />
      </div>
    );
  }
}

module.exports = MDLeftNavSearch;
