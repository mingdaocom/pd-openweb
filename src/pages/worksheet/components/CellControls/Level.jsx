import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { Score } from 'ming-ui';
import { FROM } from './enum';
import cx from 'classnames';

function levelSafeParse(value) {
  let levelValue = parseInt(value, 10);
  if (!_.isNumber(levelValue) || _.isNaN(levelValue)) {
    levelValue = 0;
  }
  return levelValue;
}
export default class Level extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    cell: PropTypes.shape({}),
    updateCell: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: levelSafeParse(props.cell.value),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: levelSafeParse(nextProps.cell.value) });
    }
  }

  getLineColor = score => {
    const { cell } = this.props;

    if (cell.enumDefault === 1) {
      return false;
    }

    let foregroundColor = '#f44336';
    if (score >= 5 && score <= 7) {
      foregroundColor = '#fed156';
    } else if (score >= 8) {
      foregroundColor = '#4caf50';
    }

    return foregroundColor;
  };

  @autobind
  handleChange(value) {
    const { updateCell } = this.props;
    this.setState({ value });
    updateCell({
      value,
    });
  }

  render() {
    const { from, className, style, cell, editable, isediting, onClick } = this.props;
    const { value } = this.state;
    if (from === FROM.CARD && cell.enumDefault !== 1) {
      return _l('%0 级', value);
    }
    return (
      <div className={cx(className, 'levelWrapper cellControl flexRow', { canedit: editable, isInCard: from === FROM.CARD })} style={style} onClick={onClick}>
        { cell.enumDefault !== 1 && <span className="mRight10">{ _l('%0 级', value) }</span> }
        <div className={cx('flex', { mTop7: cell.enumDefault !== 1 }, cell.enumDefault === 1 ? 'star' : 'line')}>
          <Score
            hideTip
            disabled={!editable}
            type={cell.enumDefault === 1 ? 'star' : 'line'}
            score={value}
            foregroundColor={cell.enumDefault === 1 ? '#fed156' : this.getLineColor(value)}
            hover={this.getLineColor}
            callback={this.handleChange}
            count={cell.enumDefault === 1 ? 5 : 10}
          />
        </div>
      </div>
    );
  }
}
