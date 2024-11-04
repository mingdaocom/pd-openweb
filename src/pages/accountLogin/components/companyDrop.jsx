import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Icon, Dropdown } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
const WrapCon = styled.div`
  .controlDropdown {
    height: auto;
    .itemT {
      background: #f5f5f5;
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid #e0e0e0;
      line-height: 20px;
      i {
        color: #9e9e9e;
        &:hover {
          color: #757575;
        }
      }
    }
    span.itemSpan {
      color: #333 !important;
      font-size: 15px;
    }
    .ming.Item .Item-content:not(.disabled):hover {
      span.itemSpan {
        color: white !important;
        font-size: 15px;
      }
    }
    .Dropdown--border,
    .dropdownTrigger .Dropdown--border {
      height: auto !important;
    }
    .Dropdown--input {
      height: auto !important;
      min-height: 40px;
      padding: 4px !important;
      .Dropdown--placeholder {
        line-height: 42px !important;
      }
      .icon-arrow-down-border {
        line-height: 52px !important;
      }
      .value {
        line-height: 42px !important;
        display: flex !important;
        & > div {
          flex: 1 !important;
          display: flex !important;
          flex-flow: row wrap !important;
          gap: 5px;
        }
      }
    }
  }
`;
function Drop(props) {
  const {
    inputOnFocus = () => {},
    inputOnBlur = () => {},
    updateCompany = () => {},
    updateState = () => {},
    info = {},
  } = props;
  const [{ dropDownVisible, extraDatas, warnningData }, setState] = useSetState({
    dropDownVisible: false,
    extraDatas: {},
    warnningData: [],
  });

  useEffect(() => {
    setState({
      extraDatas: props.extraDatas,
      warnningData: props.warnningData,
    });
  }, [props]);

  return (
    <WrapCon>
      <Dropdown
        selectClose={info.multiple !== 1}
        cancelAble={info.multiple === 1}
        showItemTitle
        openSearch
        menuClass={''}
        value={
          !_.get(extraDatas, `${info.id}`) || _.get(extraDatas, `${info.id}`).length <= 0
            ? undefined
            : _.get(extraDatas, `${info.id}`)
        }
        className={cx('w100 controlDropdown flexRow alignItemsCenter', {
          // hs: values.length > 0,
        })}
        onChange={value => {
          if (info.multiple === 1 && (_.get(extraDatas, `${info.id}`) || []).includes(value)) {
            return;
          }
          updateState({
            warnningData: _.filter(warnningData, it => it.tipDom !== `.${info.id}`),
          });
          updateCompany({
            extraDatas: {
              ...extraDatas,
              [info.id]: info.multiple === 1 ? [...(_.get(extraDatas, `${info.id}`) || []), value] : [value],
            },
          });
        }}
        onBlur={inputOnBlur}
        onFocus={() => inputOnFocus(`.${info.id}`)}
        data={(info.options || []).map((o, i) => {
          return { value: o.id, text: o.name };
        })}
        renderItem={item => {
          const isCur = info.multiple === 1 && (_.get(extraDatas, `${info.id}`) || []).includes(item.value);
          return (
            <div
              className={cx('itemText liBox flexRow alignItemsCenter', {
                isCur,
              })}
            >
              <span
                className="flex itemSpan Font15"
                dangerouslySetInnerHTML={{
                  __html: item.text,
                }}
              />
              {isCur && <Icon icon="done_2" className="Relative ThemeColor3 Font18" style={{ left: 0 }} />}
            </div>
          );
        }}
        isAppendToBody
        onVisibleChange={props.onVisibleChange}
        renderTitle={() => {
          let ids = _.get(extraDatas, `${info.id}`) || [];
          if (info.multiple === 1) {
            return (
              <div className="">
                {ids.map(it => {
                  return (
                    <div className="itemT InlineBlock">
                      {(info.options.find(a => it === a.id) || {}).name}
                      <Icon
                        icon={'close'}
                        className="Hand mLeft3"
                        onClick={e => {
                          e.stopPropagation();
                          let data = (_.get(extraDatas, `${info.id}`) || []).filter(a => a !== it);
                          updateCompany({
                            extraDatas: {
                              ...extraDatas,
                              [info.id]: data,
                            },
                          });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          }
          let id = ids[0];
          return (
            <span
              className=""
              dangerouslySetInnerHTML={{
                __html: (info.options.find(a => a.id === id) || {}).name,
              }}
            />
          );
        }}
        {...(info.multiple === 1
          ? {
              placeholder: _l('请选择'),
              popupVisible: dropDownVisible,
              onVisibleChange: visible => setState({ dropDownVisible: visible }),
              openSearch: true,
            }
          : {})}
      />
    </WrapCon>
  );
}

export default Drop;
