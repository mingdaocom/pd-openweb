import React from 'react';
import PropTypes from 'prop-types';
import './mdLeftNavSearch.css';

class MDLeftNavSearch extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    onSearch: PropTypes.func,
    onChange: PropTypes.func,
  };

  handleKeyUp = evt => {
    if (evt.which === 13 && this.props.onSearch) {
      this.props.onSearch(evt.target.value);
    }
  };

  handleFocus = () => {
    $(this.root).addClass('borderColorPrimary').removeClass('borderSecondary');
  };

  handleBlur = () => {
    $(this.root).removeClass('borderColorPrimary').addClass('borderSecondary');
  };

  render() {
    const { value, ...props } = this.props;

    return (
      <div className="mdLeftNavSearch borderSecondary" ref={root => (this.root = root)}>
        <span className="icon-search btnSearch textSecondary" title={_l('搜索')} />
        <input
          {...props}
          value={value || ''}
          onKeyUp={this.handleKeyUp}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          type="text"
          className="searchBox textPrimary"
          placeholder={_l('搜索')}
        />
      </div>
    );
  }
}

export default MDLeftNavSearch;
