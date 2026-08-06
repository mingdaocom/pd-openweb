import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { CustomScore } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { FROM } from './enum';

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: levelSafeParse(this.props.cell.value),
        });
      }
    }
  }

  handleTableKeyDown = e => {
    const { cell, updateCell, onValidate } = this.props;
    const { max } = cell.advancedSetting || {};
    const minNumber = 0;
    const maxNumber = levelSafeParse(max);

    switch (e.key) {
      default:
        if (/^[0-9]$/.test(e.key)) {
          let inputValue = Number(e.key);

          if (!_.isNaN(inputValue)) {
            if (this.prevValue) {
              inputValue = Number(this.prevValue + '' + inputValue);
            }

            if (
              !_.isUndefined(minNumber) &&
              !_.isUndefined(maxNumber) &&
              (inputValue < minNumber || inputValue > maxNumber)
            ) {
              return;
            }

            updateCell({
              value: inputValue || '',
            });

            if (_.isFunction(onValidate)) {
              onValidate(inputValue || '');
            }

            this.prevValue = inputValue;
            setTimeout(() => {
              this.prevValue = undefined;
            }, 500);
          }
        }

        break;
    }
  };

  handleChange = value => {
    const { cell, updateCell, onValidate } = this.props;

    if (cell.required && !value) {
      alert(_l('%0为必填字段', cell.controlName), 3);
      return;
    }

    this.setState({ value });
    updateCell({
      value,
    });
    // 等级通过点击即时提交，不走输入/失焦校验流程；必填报错后重新评分需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (_.isFunction(onValidate)) {
      onValidate(value);
    }
  };

  render() {
    const { from, recordId, className, style, cell, editable, onClick } = this.props;
    const { value } = this.state;
    const isMobile = browserIsMobile();

    if (isMobile) {
      const itemnames = cell && cell.advancedSetting ? JSON.parse(cell.advancedSetting.itemnames || '[]') : [];
      const currentName =
        _.get(
          _.find(itemnames, i => i.key === `${value}`),
          'value',
        ) || _l('%0 级', value);
      return <span>{currentName}</span>;
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
        {recordId !== 'empty' && !/^empty/.test(recordId) && (
          <div className="w100">
            {isMobile && (
              <span className="mRight5" style={{ marginTop: '-2px' }}>
                {value}
              </span>
            )}
            <CustomScore
              hideTip
              backgroundColor="var(--color-border-primary)"
              score={value}
              data={cell}
              disabled={!editable || from === FROM.CARD}
              callback={this.handleChange}
            />
          </div>
        )}
      </div>
    );
  }
}
