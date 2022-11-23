import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import cx from 'classnames';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';

function getCoverControlData(data) {
  return _.find(data, file => File.isPicture(file.ext) || file.previewUrl);
}

const SIZE = {
  NORMAL: 1,
  BIG: 2,
};

const baseCle = 'RelateRecordListItem';

const Cover = styled.div(
  ({ size }) => `
  width: ${size}px;
  height: ${size}px;
  margin-right: ${size === SIZE.BIG ? 12 : 8}px;
  img {
    width: ${size}px;
    height: ${size}px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 4px;
  }
`,
);
export default class RecordItem extends React.PureComponent {
  static propTypes = {
    multiple: PropTypes.bool,
    coverCid: PropTypes.string,
    showControls: PropTypes.string,
    control: PropTypes.shape({}),
    selected: PropTypes.bool,
    data: PropTypes.shape({}),
    showCoverAndControls: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    controls: [],
    showControls: [],
    data: {},
  };

  constructor(props) {
    super(props);
  }

  get cover() {
    const { coverCid, data } = this.props;
    if (!coverCid) {
      return null;
    }
    let coverControlData;
    try {
      coverControlData = getCoverControlData(JSON.parse(data[coverCid]) || []);
    } catch (err) {
      return null;
    }
    return coverControlData;
  }

  get cardControls() {
    const { controls, showControls } = this.props;
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建者'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    const cardControls = new Array(showControls.length);
    allControls.forEach(control => {
      const indexOfShowControls = showControls.indexOf(control.controlId);
      if (indexOfShowControls > -1 && control.attribute !== 1) {
        cardControls[indexOfShowControls] = control;
      }
    });
    return cardControls.filter(c => !!c);
  }

  renderControls() {
    const { data } = this.props;
    const { cardControls = [] } = this;
    const texts = cardControls
      .map(control => renderCellText({ ...control, value: data[control.controlId] }))
      .filter(text => !!text);
    return (
      <div
        style={{
          marginLeft: '-7px',
        }}
      >
        {texts.map(text => (
          <div className={`${baseCle}-control ellipsis`}>{text}</div>
        ))}
      </div>
    );
  }

  render() {
    const { active, multiple, coverCid, control, showControls, data, selected, showCoverAndControls, onClick } =
      this.props;
    const { cover } = this;
    const titleText = getTitleTextFromRelateControl(control, data);
    const size = showCoverAndControls && showControls.length ? SIZE.BIG : SIZE.NORMAL;
    const height = size === SIZE.BIG ? 56 : 36;
    const coverSize = size === SIZE.BIG ? 44 : 24;
    const style =
      size === SIZE.BIG
        ? {
            lineHeight: height / 2 - 6 + 'px',
            padding: '6px 40px 6px 12px',
          }
        : {
            lineHeight: height - 12 + 'px',
            padding: '6px 40px 6px 12px',
          };
    let coverUrl;
    if (cover) {
      coverUrl = File.isPicture(cover.ext)
        ? cover.previewUrl.slice(0, cover.previewUrl.indexOf('?')) +
          `?imageMogr2/auto-orient|imageView2/1/w/${coverSize}/h/${coverSize}/q/90`
        : cover.previewUrl;
    }
    return (
      <div
        className={cx(baseCle, 'flexRow', { selected, big: size === SIZE.BIG, hover: active })}
        onClick={onClick}
        style={{ ...style, minHeight: height }}
      >
        {showCoverAndControls && coverCid && <Cover size={coverSize}>{coverUrl && <img src={coverUrl} />}</Cover>}
        <div className="flex overflowHidden">
          <div
            className="title"
            title={titleText}
            style={{
              color: '#333',
              fontWeight: size === SIZE.BIG ? 'bold' : 'normal',
              lineHeight: showCoverAndControls && !!showControls.length ? '1.5' : '24px',
              marginBottom: showCoverAndControls && !!showControls.length ? 4 : 0,
            }}
          >
            {titleText}
          </div>
          {showCoverAndControls && !!showControls.length && this.renderControls()}
        </div>
        {selected && multiple && (
          <span className={`${baseCle}-selectedIcon`}>
            <i className="icon icon-done_2" />
          </span>
        )}
      </div>
    );
  }
}
