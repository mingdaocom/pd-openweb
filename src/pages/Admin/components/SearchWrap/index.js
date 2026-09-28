import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Motion, spring } from 'react-motion';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DatePicker, Input, Select } from 'ming-ui/antd-components';
import CustomSelectDate from '../CustomSelectDate';
import SearchApp from '../SearchApp';
import SelectUser from '../SelectUser';

const Wrap = styled.div`
  flex-wrap: wrap;
`;

const Item = styled.div(
  ({ $maxWidth, $isLastLine, $fullShow }) => `
  display: flex;
  align-items: center;
  width: ${$fullShow ? $maxWidth : 'unset'};
  margin-bottom: ${$isLastLine ? 18 : 8}px;
  ${
    $fullShow
      ? `.label{
    max-width: 140px;
    min-width: 60px;
    text-align: right;
  }`
      : ''
  }
  .searcValueContent{
    ${$fullShow ? `flex: 1;width: 0;margin: 0 10px;` : `min-width:200px;margin: 0 18px 0 10px;`}
    min-height: 34px;
  }
`,
);

const ExpandBtn = styled.div`
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 34px;
  cursor: pointer;
  color: var(--color-primary);
  font-size: 13px;
  .icon {
    margin-right: 2px;
    font-size: 15px;
  }
  &:hover {
    color: var(--color-link-hover);
  }
`;

const { RangePicker } = DatePicker;

let resizeObserver = null;

export default function SearchWrap(props) {
  const {
    wrapClassName,
    projectId,
    searchList = [],
    onChange = () => {},
    searchValues = {},
    showExpandBtn,
    hideReset,
  } = props;
  const [fullShow, setFullShow] = useState(
    showExpandBtn ? false : !_.isUndefined(props.fullShow) ? props.fullShow : true,
  );
  const searchBoxRef = useRef();
  const [width, setWidth] = useState();
  const [values, setValues] = useSetState(searchValues);
  let colNum = (width - 63) / 280;
  const showExpand = searchList.length > colNum;
  const visibleSearchList = fullShow ? searchList : searchList.slice(0, colNum);

  const renderSearchCon = item => {
    const { key, type, options = [], className, ...extra } = item;

    switch (type) {
      case 'selectUser':
        return (
          <SelectUser
            className={cx('w100', className)}
            projectId={projectId}
            userInfo={searchValues[key] || []}
            changeData={data => onChange({ ...searchValues, [key]: data })}
            isAdmin
            {...extra}
            style={fullShow ? extra.style : { ...extra.style, maxWidth: 200 }}
          />
        );
      case 'selectTime':
        return (
          <CustomSelectDate
            className={cx('w100', className)}
            dateInfo={searchValues[key] || {}}
            {...extra}
            changeDate={({ startDate, endDate, searchDateStr }) =>
              onChange({ ...searchValues, [key]: { startDate, endDate, searchDateStr } })
            }
          />
        );
      case 'select':
        return (
          <Select
            className={cx('w100', className)}
            notFoundContent={<span className="textTertiary">{_l('暂无数据')}</span>}
            {...extra}
            onChange={value => onChange({ ...searchValues, [key]: value })}
            options={options}
          />
        );
      case 'selectApp':
        return (
          <SearchApp
            {...extra}
            className={cx('w100', className)}
            projectId={projectId}
            onChange={value => onChange({ ...searchValues, [key]: value })}
          />
        );
      case 'input':
        return (
          <Input
            {...extra}
            value={values[key]}
            className={`w100 ${className}`}
            onChange={e => setValues({ [key]: e.target.value })}
            onBlur={e => {
              const val = _.trim(e.target.value);

              if (!val && !searchValues[key]) {
                setValues({ [key]: '' });
                return;
              }

              onChange({ ...searchValues, [key]: val ? val : '' });
            }}
            onKeyDown={e => {
              if (e.which === 13) {
                const val = _.trim(e.target.value);
                if (!val && !searchValues[key]) return;
                onChange({ ...searchValues, [key]: val ? val : '' }, true);
              }
            }}
          />
        );
      case 'antdRangePicker':
        return (
          <RangePicker
            {...extra}
            onChange={(dates = []) => {
              onChange({ ...searchValues, [key]: !_.isEmpty(dates) ? { startDate: dates[0], endDate: dates[1] } : {} });
            }}
          />
        );
      case 'antdDatePicker':
        return (
          <DatePicker
            className="w100"
            {...extra}
            onChange={date => {
              onChange({
                ...searchValues,
                [key]: date,
              });
            }}
          />
        );
      default:
    }
  };

  useEffect(() => {
    if (window.ResizeObserver && typeof window.ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        setWidth(searchBoxRef && searchBoxRef.current && searchBoxRef.current.clientWidth);
      });
      resizeObserver.observe(searchBoxRef.current);
    }
  }, []);

  return (
    <Wrap className={`w100 flexRow pTop25 ${wrapClassName}`} ref={searchBoxRef}>
      {visibleSearchList.map((item, i) => {
        return (
          <Item
            key={i}
            $fullShow={fullShow}
            $maxWidth={`${100 / colNum}%`}
            $isLastLine={Math.ceil((i + 1) / colNum) === Math.ceil((searchList.length + (showExpand ? 1 : 0)) / colNum)}
          >
            <div className={cx('label textSecondary', { pLeft16: i === 0 && !fullShow })}>{item.label}</div>
            <div className="searcValueContent">{renderSearchCon(item)}</div>
          </Item>
        );
      })}
      {showExpandBtn && (
        <Fragment>
          {!hideReset && (
            <ExpandBtn
              onClick={() => {
                const inputValues = {};
                searchList
                  .filter(v => v.type === 'input')
                  .forEach(({ key }) => {
                    inputValues[key] = '';
                  });

                setValues(inputValues);
                onChange({});
              }}
            >
              {_l('重置')}
            </ExpandBtn>
          )}
          {showExpand && (
            <ExpandBtn
              className="mLeft12"
              onClick={() => {
                setFullShow(!fullShow);
              }}
            >
              <Motion
                defaultStyle={{ rotate: fullShow ? 0 : 180 }}
                style={{
                  rotate: spring(fullShow ? 0 : 180),
                }}
              >
                {({ rotate }) => (
                  <i
                    className="InlineBlock icon icon-arrow-up-border"
                    style={{ transform: `rotate(${rotate}deg)` }}
                  ></i>
                )}
              </Motion>
              {fullShow ? _l('收起') : _l('展开')}
            </ExpandBtn>
          )}
        </Fragment>
      )}
    </Wrap>
  );
}

SearchWrap.propTypes = {
  wrapClassName: PropTypes.string,
  projectId: PropTypes.string,
  searchList: PropTypes.array,
  onChange: PropTypes.func,
  showExpandBtn: PropTypes.bool,
};
