import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'ming-ui/antd-components';

const SEARCH_INPUT_STYLE = { display: 'flex', width: 220, margin: '6px auto' };

class MDLeftNavSearch extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    onSearch: PropTypes.func,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
  };

  handleKeyUp = (evt, onSearch) => {
    if (evt.which === 13 && onSearch) {
      onSearch(evt.target.value);
    }
  };

  handleClear = (onClear, onSearch) => {
    onClear?.();
    onSearch?.('');
  };

  render() {
    const { onClear, onSearch, value, ...props } = this.props;

    return (
      <Input
        {...props}
        allowClear
        variant="underlined"
        value={value || ''}
        prefix={<i className="icon-search textSecondary" title={_l('搜索')} />}
        onClear={() => this.handleClear(onClear, onSearch)}
        onKeyUp={evt => this.handleKeyUp(evt, onSearch)}
        style={SEARCH_INPUT_STYLE}
        placeholder={_l('搜索')}
      />
    );
  }
}

export default MDLeftNavSearch;
