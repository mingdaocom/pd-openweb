import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Icon, Radio, Checkbox } from 'ming-ui';
import _ from 'lodash';

const Wrap = styled.div`
  width: 320px;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.24);
  border-radius: 3px 3px 3px 3px;
  .viewList {
    border-top: 1px solid #f5f5f5;
    max-height: 300px;
    overflow: auto;
    .viewName {
      word-break: break-all;
    }
  }
  .pAll16 {
    padding: 16px;
  }
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
`;
const HeaderRange = styled.div`
  display: block;
  padding: 16px 24px;
  font-weight: bold;
  border-bottom: 1px solid #f5f5f5;
  .ming.icon-close {
    float: right;
  }
  .ming.icon-close:hover {
    color: #2196f3 !important;
  }
`;
export default function BtnRangeDrop(props) {
  const { onClose, data, onChange, views } = props;
  const noBatch = (data.writeObject === 2 || data.writeType === 2) && data.clickType === 3; //配置了关联=>不能设置成批量按钮
  const [{ isAllDt, isAllList, viewIds, viewSheetIds, hsDt, hsList }, setState] = useSetState({
    viewIds: [],
    viewSheetIds: [],
    isAllDt: false,
    isAllList: false,
    hsDt: false,
    hsList: false,
  });
  useEffect(() => {
    const viewIds = props.views.map(o => o.viewId);
    const viewSheetIds = props.views
      .filter(o => o.viewType === 0 || (o.viewType === 2 && _.get(o, 'advancedSetting.hierarchyViewType') === '3'))
      .map(o => o.viewId); //仅表视图、树形层级视图，支持批量
    setState({
      viewIds,
      viewSheetIds,
      isAllDt:
        viewIds.filter(o => !safeParse(_.get(data, 'advancedSetting.detailviews'), 'array').includes(o)).length <= 0,
      hsDt: viewIds.filter(o => safeParse(_.get(data, 'advancedSetting.detailviews'), 'array').includes(o)).length > 0,
      isAllList:
        viewSheetIds.filter(o => !safeParse(_.get(data, 'advancedSetting.listviews'), 'array').includes(o)).length <= 0,
      hsList:
        viewSheetIds.filter(o => safeParse(_.get(data, 'advancedSetting.listviews'), 'array').includes(o)).length > 0,
    });
  }, [props]);
  return (
    <Wrap className="">
      <HeaderRange className="headerRange Font14 Gray">
        {_l('使用范围')}
        <Icon
          icon="close"
          className="Font18 Gray_9e Hand"
          onClick={() => {
            onClose();
          }}
        />
      </HeaderRange>
      <div className="pLeft16 pBottom16">
        <div className="mTop16">
          <Radio
            text={_l('所有记录')}
            checked={data.isAllView === 1}
            onClick={() => {
              onChange({
                ...data,
                isAllView: 1,
                advancedSetting: _.omit(_.get(data, 'advancedSetting'), ['detailviews', 'listviews']),
              });
            }}
          />
        </div>
        <div className="mTop16">
          <Radio
            text={_l('应用于指定视图')}
            checked={data.isAllView !== 1}
            onClick={() => {
              onChange({
                ...data,
                isAllView: 0,
              });
            }}
          />
        </div>
      </div>
      <ul className="dropOptionTrigger">
        {data.isAllView !== 1 && (
          <div className="viewList">
            <div className="viewListLi pAll16">
              <div className="flexRow alignItemsCenter Bold">
                <span className="flex">{_l('视图')}</span>
                <span
                  className="flex Hand flexShrink0"
                  title={_l('记录详情')}
                  onClick={() => {
                    onChange({
                      ...data,
                      advancedSetting: isAllDt
                        ? _.omit(_.get(data, 'advancedSetting'), ['detailviews'])
                        : {
                            ..._.get(data, 'advancedSetting'),
                            detailviews: JSON.stringify(viewIds),
                          },
                    });
                  }}
                >
                  <Checkbox
                    className="viewInput TxtMiddle"
                    size="small"
                    checked={isAllDt}
                    clearselected={!isAllDt && hsDt}
                    text={_l('记录详情')}
                  />
                </span>
                {!noBatch ? (
                  <span
                    className="flex Hand flexShrink0"
                    onClick={() => {
                      onChange({
                        ...data,
                        advancedSetting: isAllList
                          ? _.omit(_.get(data, 'advancedSetting'), ['listviews'])
                          : {
                              ..._.get(data, 'advancedSetting'),
                              listviews: JSON.stringify(viewSheetIds),
                            },
                      });
                    }}
                    title={_l('批量操作')}
                  >
                    <Checkbox
                      className="viewInput TxtMiddle"
                      size="small"
                      checked={isAllList}
                      clearselected={!isAllList && hsList}
                      text={_l('批量操作')}
                    />
                  </span>
                ) : (
                  <span className="flex"></span>
                )}
              </div>
              {views.map(it => {
                let isDt = safeParse(_.get(data, 'advancedSetting.detailviews'), 'array').includes(it.viewId);
                let isList = safeParse(_.get(data, 'advancedSetting.listviews'), 'array').includes(it.viewId);
                return (
                  <div className="flexRow alignItemsCenter mTop10">
                    <span className="flex viewName">{it.name}</span>
                    <span
                      className="flex Hand"
                      onClick={() => {
                        onChange({
                          ...data,
                          advancedSetting: {
                            ..._.get(data, 'advancedSetting'),
                            detailviews: JSON.stringify(
                              isDt
                                ? safeParse(_.get(data, 'advancedSetting.detailviews'), 'array').filter(
                                    o => o !== it.viewId,
                                  )
                                : [...safeParse(_.get(data, 'advancedSetting.detailviews'), 'array'), it.viewId],
                            ),
                          },
                        });
                      }}
                    >
                      <Checkbox className="viewInput TxtMiddle" size="small" checked={isDt} text={null} />
                    </span>
                    {(it.viewType === 0 ||
                      (it.viewType === 2 && _.get(it, 'advancedSetting.hierarchyViewType') === '3')) &&
                    !noBatch ? (
                      <span
                        className="flex Hand"
                        onClick={() => {
                          onChange({
                            ...data,
                            advancedSetting: {
                              ..._.get(data, 'advancedSetting'),
                              listviews: JSON.stringify(
                                isList
                                  ? safeParse(_.get(data, 'advancedSetting.listviews'), 'array').filter(
                                      o => o !== it.viewId,
                                    )
                                  : [...safeParse(_.get(data, 'advancedSetting.listviews'), 'array'), it.viewId],
                              ),
                            },
                          });
                        }}
                      >
                        <Checkbox className="viewInput TxtMiddle" size="small" checked={isList} text={null} />
                      </span>
                    ) : (
                      <span className="flex"></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ul>
    </Wrap>
  );
}
