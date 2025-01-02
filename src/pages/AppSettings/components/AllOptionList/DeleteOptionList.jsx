import React, { useState, useEffect, Fragment } from 'react';
import { LoadDiv, ScrollView, Dialog } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import styled from 'styled-components';
import { toEditWidgetPage } from 'src/pages/widgetConfig/util';
import { navigateTo } from 'src/router/navigateTo';
import cx from 'classnames';
import _ from 'lodash';

const OptionQuoteWrap = styled.div`
  height: 300px;
  .controlItem {
    cursor: pointer;
    width: fit-content;
    padding: 0 4px;
    border-radius: 3px;
    &:hover {
      background-color: #f5f5f5;
      color: #2196f3;
    }
    &.disabled {
      cursor: auto;
      &:hover {
        background-color: #fff;
        color: #151515;
      }
    }
  }
`;

const Empty = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .emptyIconWrap {
    width: 130px;
    height: 130px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #f5f5f5;
  }
`;
export default function DeleteOptionList({ collectionId, name, title, description, type, ...rest }) {
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(rest.controls || []);
  const [dataInfo, setDataInfo] = useState(rest.dataInfo || {});

  const getData = () => {
    worksheetAjax
      .getQuoteControlsById({ collectionId })
      .then(({ code, msg, data = [] }) => {
        if (code === 1) {
          const obj = {};
          data.forEach(item => {
            if (!obj[item.appId]) {
              obj[item.appId] = { appId: item.appId, appName: item.appName, data: [].concat(item) };
            } else {
              obj[item.appId].data.push(item);
            }
          });
          setDataInfo(obj);
          setControls(data);
        } else {
          alert(msg);
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!_.isUndefined(rest.controls)) {
      setLoading(false);
      return;
    }
    getData();
  }, []);

  return (
    <Dialog
      visible
      confirm={type === 'checkQuote' ? '' : 'danger'}
      okText={_l('关闭')}
      showCancel={false}
      description={
        type === 'checkQuote' ? (
          controls.length ? (
            <Fragment>
              <div className="Gray">{_l('该选项集正被%0个字段引用。', controls.length)}</div>
              <div className="Gray_75 mTop16">{_l('以下为具体引用的工作表，点击跳转到表单编辑页。')}</div>
            </Fragment>
          ) : (
            ''
          )
        ) : (
          <span className="Gray">
            {_l(
              '此选项集正在被以下%0个字段引用，无法直接删除。请先解除引用关系后再删除选项集。若仅希望选项集不再被新字段引用，可将选项集停用。停用选项集不影响已引用字段的正常使用。',
              controls.length,
            )}
          </span>
        )
      }
      title={
        title ? (
          title
        ) : (
          <span className="Bold" style={{ color: '#f44336' }}>
            {_l('无法直接删除选项集 “%0”', name)}
          </span>
        )
      }
      {...rest}
    >
      <OptionQuoteWrap>
        <ScrollView>
          {loading ? (
            <LoadDiv />
          ) : type === 'checkQuote' && _.isEmpty(dataInfo) ? (
            <Empty>
              <div className="emptyIconWrap">
                <i className="icon icon-link_record Font50 Gray_9e" />
              </div>
              <div className="Gray_bd mTop18 Font17">{_l('暂无引用字段')}</div>
            </Empty>
          ) : (
            Object.values(dataInfo).map(info => {
              const { appId, appName, data } = info;
              return (
                <div key={appId} className="mBottom20">
                  <div className="bold mBottom10">{appName || _l('其他')}</div>
                  {data.map((item, index) => {
                    const { controlId, controlName, worksheetId, worksheetName, appId, worksheetType } = item;
                    return (
                      <div
                        key={index}
                        className={cx('flexRow mBottom10 controlItem', {
                          disabled: _.includes([2, 3, 4], worksheetType),
                        })}
                        onClick={() => {
                          if (_.includes([2, 3, 4], worksheetType)) return;
                          toEditWidgetPage({ sourceId: worksheetId, targetControl: controlId });
                        }}
                      >
                        <span>{controlName}</span>
                        <span className="mLeft10 mRight10">-</span>
                        <span>
                          {worksheetName}
                          {worksheetType === 2
                            ? '（' + _l('空白子表') + '）'
                            : worksheetType === 3
                            ? '（' + _l('外部门户') + '）'
                            : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </ScrollView>
      </OptionQuoteWrap>
    </Dialog>
  );
}
