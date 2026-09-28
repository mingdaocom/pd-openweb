import React from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input, Popover, Select } from 'ming-ui/antd-components';

const Con = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: default;
  display: flex;
  align-items: center;
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
  &.abnormalMode {
    cursor: default;
  }
  &:not(.abnormalMode):hover {
    background: var(--color-background-hover);
  }
`;
const Btn = styled.span`
  display: inline-block;
  cursor: pointer;
  font-size: 18px;
  color: var(--color-text-tertiary);
  width: 25px;
  text-align: center;
  &.disabled {
    color: var(--color-border-primary);
  }
`;

const Popup = styled.div`
  padding: 6px 0 10px;
`;
const PageList = styled.div`
  .pageIndex {
    padding: 0 14px;
    line-height: 28px;
    height: 28px;
    color: var(--color-text-title);
    &.dot {
      line-height: 20px;
    }
    &:not(.current, .dot) {
      cursor: pointer;
      &:hover {
        background: var(--color-background-disabled);
      }
    }
  }
`;
const PageSizeConfig = styled.div`
  margin-top: 12px;
  padding: 0 14px;
`;
const JumpPage = styled.div`
  margin: 12px 0 6px;
  padding: 0 14px;
  .jumpPageInput {
    margin: 0 10px;
    width: 57px;
  }
`;

const pageSizeNums = [
  { label: 20, value: 20 },
  { label: 25, value: 25 },
  { label: 30, value: 30 },
  { label: 50, value: 50 },
  { label: 100, value: 100 },
  { label: 200, value: 200 },
];
export default class Pagination extends React.Component {
  static propTypes = {
    appendToBody: PropTypes.bool,
    disabled: PropTypes.bool,
    abnormalMode: PropTypes.bool,
    className: PropTypes.string,
    allowChangePageSize: PropTypes.bool,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    allCount: PropTypes.number,
    showCount: PropTypes.bool,
    countForShow: PropTypes.number,
    onPrev: PropTypes.func,
    onNext: PropTypes.func,
    changePageIndex: PropTypes.func,
    changePageSize: PropTypes.func,
  };

  static defaultProps = {
    abnormalMode: false,
    allowChangePageSize: true,
    pageIndex: 0,
    pageSize: 0,
    showCount: true,
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
      jumpPageValue: String(props.pageIndex),
    };
  }

  conRef = React.createRef();

  get displayCount() {
    const { allCount, countForShow } = this.props;

    const hasCountForShow = typeof countForShow === 'number';
    const hasAllCount = typeof allCount === 'number';

    if (hasCountForShow) return countForShow;
    if (hasAllCount) return allCount;

    return 0;
  }

  get pageNum() {
    return Math.ceil((this.displayCount || 0) / this.props.pageSize);
  }

  renderPopup() {
    const { abnormalMode, pageIndex, pageSize, allowChangePageSize, changePageIndex, changePageSize } = this.props;
    const { jumpPageValue } = this.state;
    let minShowPage = pageIndex - 2;
    let isEnd;

    if (minShowPage + 5 >= this.pageNum - 1 && !abnormalMode) {
      minShowPage = this.pageNum - 1 - 5;
      isEnd = true;
    }

    if (minShowPage <= 3 && !abnormalMode) {
      minShowPage = 2;
      isEnd = true;
    }

    if (minShowPage < 2) {
      minShowPage = 2;
    }

    return (
      <Popup className="flexColumn">
        <PageList>
          <div
            key="begin"
            className={cx('pageIndex', { 'current colorPrimary': pageIndex === 1 })}
            onClick={() => pageIndex !== 1 && changePageIndex(1)}
          >
            {1}
          </div>
          {minShowPage > 2 && (
            <div key="dotbegin" className="pageIndex dot">
              ...
            </div>
          )}
          {[...new Array(abnormalMode ? 7 : isEnd ? 6 : 5)]
            .map((a, i) => minShowPage + i)
            .filter(page => page < this.pageNum || abnormalMode)
            .map((page, i) => (
              <div
                key={i}
                className={cx('pageIndex', { 'current colorPrimary': pageIndex === page })}
                onClick={() => pageIndex !== page && changePageIndex(page)}
              >
                {page}
              </div>
            ))}
          {(minShowPage + 5 < this.pageNum - 1 || abnormalMode) && (
            <div key="dotend" className="pageIndex dot">
              ...
            </div>
          )}
          {this.pageNum > 1 && (
            <div
              key="end"
              className={cx('pageIndex', { 'current colorPrimary': pageIndex === this.pageNum })}
              onClick={() => pageIndex !== this.pageNum && changePageIndex(this.pageNum)}
            >
              {this.pageNum}
            </div>
          )}
        </PageList>
        {allowChangePageSize && (
          <PageSizeConfig>
            <Select
              size="small"
              style={{ width: 90, marginRight: 10 }}
              value={pageSize}
              labelRender={({ label }) => _l('%0行', label || pageSize)}
              options={pageSizeNums}
              onChange={value => changePageSize(value)}
            />
            {_l('/页')}
          </PageSizeConfig>
        )}
        <JumpPage>
          {_l('跳至')}
          <Input
            className="jumpPageInput"
            inputMode="numeric"
            size="small"
            value={jumpPageValue}
            onChange={event => {
              this.setState({ jumpPageValue: event.target.value.replace(/[^0-9]/g, '') });
            }}
            onKeyDown={e => {
              if (e.keyCode === 13 && jumpPageValue) {
                const jumpPage = parseInt(jumpPageValue, 10);

                if (!_.isNaN(jumpPage)) {
                  if ((jumpPage > 0 && jumpPage <= this.pageNum) || abnormalMode) {
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
    const {
      disabled,
      abnormalMode,
      className = '',
      pageIndex,
      onlyShowCount,
      maxCount,
      appendToBody,
      showCount,
      onPrev,
      onNext,
    } = this.props;
    const { popupVisible } = this.state;

    if (onlyShowCount) {
      return (
        <Con className={className}>
          <NoData>{_l('共%0条', this.displayCount)}</NoData>
        </Con>
      );
    }

    if (maxCount) {
      return (
        <Con className={className}>
          <NoData>{_l('共%0行', this.displayCount > maxCount ? maxCount : this.displayCount)}</NoData>
        </Con>
      );
    }

    if (!this.displayCount && !abnormalMode) {
      return (
        <Con className={className}>
          <NoData>{_l('共0行')}</NoData>
        </Con>
      );
    }

    return (
      <Con className={className} ref={this.conRef}>
        <Popover
          trigger="click"
          open={!(disabled || abnormalMode) && popupVisible}
          onOpenChange={value =>
            this.setState({
              popupVisible: value,
              ...(value ? { jumpPageValue: String(this.props.pageIndex) } : {}),
            })
          }
          destroyOnHidden
          placement="bottomLeft"
          noPadding
          content={this.renderPopup()}
          getPopupContainer={() => (appendToBody || !get(this, 'conRef.current') ? document.body : this.conRef.current)}
        >
          <PageNum className={cx({ abnormalMode })}>
            {abnormalMode
              ? _l('第%0页', pageIndex)
              : !showCount
                ? _l('%0/%1页', pageIndex, this.pageNum)
                : _l('共%0行，%1/%2页', this.displayCount, pageIndex, this.pageNum)}
          </PageNum>
        </Popover>
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
