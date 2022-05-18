import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Input, Dropdown } from 'ming-ui';

const Con = styled.div`
  font-size: 14px;
  color: #888;
  cursor: default;
`;
const NoData = styled.div`
  padding: 0 15px;
  line-height: 28px;
`;
const PageNum = styled.span`
  padding: 6px 8px;
  margin: 0 8px;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;
const Btn = styled.span`
  display: inline-block;
  cursor: pointer;
  font-size: 18px;
  color: #9e9e9e;
  width: 25px;
  text-align: center;
  &.disabled {
    color: #ddd;
  }
`;

const Popup = styled.div`
  width: 160px;
  border-radius: 3px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  background: #fff;
  padding: 6px 0 10px;
`;
const PageList = styled.div`
  .pageIndex {
    padding: 0 14px;
    line-height: 28px;
    height: 28px;
    color: #333;
    &.dot {
      line-height: 20px;
    }
    &:not(.current, .dot) {
      cursor: pointer;
      &:hover {
        background: #f0f0f0;
      }
    }
  }
`;
const PageSizeConfig = styled.div`
  margin-top: 12px;
  padding: 0 14px;
  .Dropdown--input {
    height: 28px !important;
    width: 90px;
  }
`;
const JumpPage = styled.div`
  margin: 12px 0 6px;
  padding: 0 14px;
  .Input {
    margin: 0 10px;
    width: 57px;
    height: 28px !important;
  }
`;

const pageSizeNums = [
  { text: 20, value: 20 },
  { text: 25, value: 25 },
  { text: 30, value: 30 },
  { text: 50, value: 50 },
  { text: 100, value: 100 },
];

export default class Pagination extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    allowChangePageSize: PropTypes.bool,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    allCount: PropTypes.number,
    onPrev: PropTypes.func,
    onNext: PropTypes.func,
    changePageIndex: PropTypes.func,
    changePageSize: PropTypes.func,
  };

  static defaultProps = {
    allowChangePageSize: true,
    pageIndex: 0,
    pageSize: 0,
    allCount: 0,
    onPrev: () => {},
    onNext: () => {},
    changePageIndex: () => {},
    changePageSize: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      popupVisible: false,
    };
  }

  conRef = React.createRef();
  jumpInputRef = React.createRef();

  get pageNum() {
    return Math.ceil(this.props.allCount / this.props.pageSize);
  }

  renderPopup() {
    const { pageIndex, pageSize, allowChangePageSize, changePageIndex, changePageSize } = this.props;
    let minShowPage = pageIndex - 2;
    let isEnd;
    if (minShowPage + 5 >= this.pageNum - 1) {
      minShowPage = this.pageNum - 1 - 5;
      isEnd = true;
    }
    if (minShowPage <= 3) {
      minShowPage = 2;
      isEnd = true;
    }
    return (
      <Popup className="flexColumn">
        <PageList>
          <div
            key="begin"
            className={cx('pageIndex', { 'current ThemeColor3': pageIndex === 1 })}
            onClick={() => pageIndex !== 1 && changePageIndex(1)}
          >
            {1}
          </div>
          {minShowPage > 2 && (
            <div key="dotbegin" className="pageIndex dot">
              ...
            </div>
          )}
          {[...new Array(isEnd ? 6 : 5)]
            .map((a, i) => minShowPage + i)
            .filter(page => page < this.pageNum)
            .map((page, i) => (
              <div
                key={i}
                className={cx('pageIndex', { 'current ThemeColor3': pageIndex === page })}
                onClick={() => pageIndex !== page && changePageIndex(page)}
              >
                {page}
              </div>
            ))}
          {minShowPage + 5 < this.pageNum - 1 && (
            <div key="dotend" className="pageIndex dot">
              ...
            </div>
          )}
          {this.pageNum > 1 && (
            <div
              key="end"
              className={cx('pageIndex', { 'current ThemeColor3': pageIndex === this.pageNum })}
              onClick={() => pageIndex !== this.pageNum && changePageIndex(this.pageNum)}
            >
              {this.pageNum}
            </div>
          )}
        </PageList>
        {allowChangePageSize && (
          <PageSizeConfig>
            <Dropdown
              width={90}
              style={{ marginRight: 10, height: 28 }}
              isAppendToBody
              border
              value={pageSize}
              renderTitle={selected => _l('%0行', selected.text)}
              data={pageSizeNums}
              onChange={changePageSize}
            />
            {_l('/页')}
          </PageSizeConfig>
        )}
        <JumpPage>
          {_l('跳至')}
          <Input
            manualRef={this.jumpInputRef}
            valueFilter={v => v.replace(/[^0-9]/g, '')}
            onKeyDown={e => {
              if (e.keyCode === 13 && this.jumpInputRef.current && this.jumpInputRef.current.value) {
                const jumpPage = parseInt(this.jumpInputRef.current.value, 10);
                if (!_.isNaN(jumpPage)) {
                  if (jumpPage > 0 && jumpPage <= this.pageNum) {
                    changePageIndex(jumpPage);
                  } else {
                    alert(_l('请输入正确的页数'), 3);
                  }
                }
              }
            }}
          />
          {_l('页')}
        </JumpPage>
      </Popup>
    );
  }

  render() {
    const { className = '', pageIndex, maxCount, allCount, onPrev, onNext } = this.props;
    const { popupVisible } = this.state;
    if (maxCount) {
      return (
        <Con className={className}>
          <NoData>{_l('共%0行', allCount > maxCount ? maxCount : allCount)}</NoData>
        </Con>
      );
    }
    if (!allCount) {
      return (
        <Con className={className}>
          <NoData>{_l('共0行')}</NoData>
        </Con>
      );
    }
    return (
      <Con className={className} ref={this.conRef}>
        <Trigger
          action={['click']}
          popupVisible={popupVisible}
          onPopupVisibleChange={value => this.setState({ popupVisible: value })}
          destroyPopupOnHide
          popupAlign={{
            points: ['tl', 'bl'],
          }}
          popup={this.renderPopup()}
          getPopupContainer={() => this.conRef.current || document.body}
        >
          <PageNum>{_l('共%0行，%1/%2页', allCount, pageIndex, this.pageNum)}</PageNum>
        </Trigger>
        <Btn className={pageIndex === 1 && 'disabled'} onClick={pageIndex === 1 ? () => {} : onPrev}>
          <i className="icon icon-arrow-left-border" />
        </Btn>
        <Btn
          className={pageIndex === this.pageNum && 'disabled'}
          onClick={pageIndex === this.pageNum ? () => {} : onNext}
        >
          <i className="icon icon-arrow-right-border" />
        </Btn>
      </Con>
    );
  }
}
