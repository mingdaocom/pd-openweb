import React, { Fragment, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { Motion, spring } from 'react-motion';
import SelectUser from '../SelectUser';
import CustomSelectDate from '../CustomSelectDate';
import styled from 'styled-components';
import cx from 'classnames';

const Wrap = styled.div`
  flex-wrap: wrap;
`;

const Item = styled.div(
  ({ maxWidth, isLastLine, fullShow }) => `
  display: flex;
  align-items: center;
  width: ${fullShow ? maxWidth : 'unset'};
  margin-bottom: ${isLastLine ? 18 : 8}px;
  ${
    fullShow
      ? `.label{
    max-width: 140px;
    min-width: 60px;
    text-align: right;
  }`
      : ''
  }
  .searcValueContent{
    ${fullShow ? `flex: 1;width: 0;margin: 0 10px;` : `width:200px;margin: 0 18px 0 10px;`}
    min-height: 34px;
    input::-webkit-input-placeholder {
      color: #bdbdbd;
    }
    input::-moz-placeholder {
      color: #bdbdbd;
    }
    input::-moz-placeholder {
      color: #bdbdbd;
    }
    input::-ms-input-placeholder {
      color: #bdbdbd;
    }
  }
`,
);

const ExpandBtn = styled.div`
  display: inline-block;
  height: 36px;
  line-height: 36px;
  margin-left: 20px;
  cursor: pointer;
  color: #2196f3;
  font-size: 13px;
  .icon {
    margin-right: 2px;
    font-size: 15px;
  }
  &:hover {
    color: #1565c0;
  }
`;

const Input = styled.input`
  border: 1px solid #ccc;
  box-sizing: border-box;
  height: 36px;
  border-radius: 3px;
  padding: 0 12px;
  font-size: 14px;
  &:hover {
    border-color: #bbb;
  }
  &:focus {
    border-color: #1e88e5;
  }
`;

let resizeObserver = null;
export default function SearchWrap(props) {
  const { wrapClassName, projectId, searchList = [], onChange = () => {}, searchValues = {}, showExpandBtn } = props;
  const { startDate, endDate, searchDateStr } = searchValues;
  const [fullShow, setFullShow] = useState(showExpandBtn ? false : true);
  const searchBoxRef = useRef();
  const inputRef = useRef();
  const [width, setWidth] = useState(searchBoxRef && searchBoxRef.current && searchBoxRef.current.clientWidth);
  let colNum = (width - 63) / 280;
  const showExpand = searchList.length > colNum;
  const visibleSearchList = fullShow ? searchList : searchList.slice(0, colNum);

  const renderSearchCon = item => {
    const { key, type, label, options = [], className, ...extra } = item;
    switch (type) {
      case 'selectUser':
        return (
          <SelectUser
            className={`w100 mdAntSelect ${className}`}
            projectId={projectId}
            userInfo={searchValues.selectUserInfo || []}
            changeData={data => onChange({ ...searchValues, selectUserInfo: data })}
            {...extra}
          />
        );
      case 'selectTime':
        return (
          <CustomSelectDate
            className={`w100 mdAntSelect ${className}`}
            dateFormat={'YYYY-MM-DD HH:mm:ss'}
            dateInfo={{ startDate, endDate, searchDateStr }}
            {...extra}
            changeDate={({ startDate, endDate, searchDateStr }) =>
              onChange({ ...searchValues, startDate, endDate, searchDateStr })
            }
          />
        );
      case 'select':
        return (
          <Select
            className={`w100 mdAntSelect ${className}`}
            {...extra}
            onChange={value => onChange({ ...searchValues, [key]: value })}
          >
            {options.map(it => {
              return (
                <Select.Option className="mdAntSelectOption" key={it.value} value={it.value}>
                  {it.label}
                </Select.Option>
              );
            })}
          </Select>
        );
      case 'input':
        return (
          <Input
            {...extra}
            ref={inputRef}
            className={`w100 ${className}`}
            onBlur={e => {
              const val = _.trim(e.target.value);
              inputRef.current.value = val ? val : '';
              onChange({ ...searchValues, [key]: val ? val : '' });
            }}
            onKeyDown={e => {
              if (e.which === 13) {
                const val = _.trim(e.target.value);
                inputRef.current.value = val ? val : '';
                onChange({ ...searchValues, [key]: val ? val : '' });
              }
            }}
          />
        );
      default:
    }
  };

  useEffect(() => {
    if (window.ResizeObserver && typeof window.ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
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
            fullShow={fullShow}
            maxWidth={`${100 / colNum}%`}
            isLastLine={Math.ceil((i + 1) / colNum) === Math.ceil((searchList.length + (showExpand ? 1 : 0)) / colNum)}
          >
            <div className={cx('label Gray_75', { pLeft16: i === 0 && !fullShow })}>{item.label}</div>
            <div className="searcValueContent">{renderSearchCon(item)}</div>
          </Item>
        );
      })}
      {showExpandBtn && (
        <Fragment>
          <ExpandBtn
            onClick={() => {
              if (inputRef && inputRef.current) {
                inputRef.current.value = '';
              }
              onChange({});
            }}
          >
            {_l('重置')}
          </ExpandBtn>
          {showExpand && (
            <ExpandBtn
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
