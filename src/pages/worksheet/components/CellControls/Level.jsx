import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { CustomScore } from 'ming-ui';
import { FROM } from './enum';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';

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
    const isMobile = browserIsMobile();
    if (isMobile) {
      const itemnames = cell && cell.advancedSetting ? JSON.parse(cell.advancedSetting.itemnames || '[]') : [];
      const currentName =
        _.get(
          _.find(itemnames, i => i.key === `${value}`),
          'value',
        ) || _l('%0 级', value);
      return currentName;
    }
    return (
      <div
        className={cx(className, 'levelWrapper cellControl flexRow', {
          canedit: editable,
          isInCard: from === FROM.CARD,
        })}
        style={style}
        onClick={onClick}
      >
        <div className="flex flexRow">
          {isMobile && (
            <span className="mRight5" style={{ marginTop: '-2px' }}>
              {value}
            </span>
          )}
          <CustomScore
            hideTip
            score={value}
            data={cell}
            disabled={!editable || from === FROM.CARD}
            callback={this.handleChange}
          />
        </div>
      </div>
    );
  }
}
