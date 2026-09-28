import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv, ScrollView } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { toEditWidgetPage } from 'src/pages/widgetConfig/navigation';

const HIDDEN_CANCEL_BUTTON_PROPS = { style: { display: 'none' } };
const DANGER_OK_BUTTON_PROPS = { danger: true };

const OptionQuoteWrap = styled.div`
  height: 300px;
  .controlItem {
    cursor: pointer;
    width: fit-content;
    padding: 0 4px;
    border-radius: 3px;
    &:hover {
      background-color: var(--color-background-hover);
      color: var(--color-primary);
    }
    &.disabled {
      cursor: auto;
      &:hover {
        background-color: var(--color-background-primary);
        color: var(--color-text-title);
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
    background: var(--color-background-secondary);
  }
`;

export default function DeleteOptionList({
  collectionId,
  name,
  title,
  type,
  controls: defaultControls,
  dataInfo: defaultDataInfo,
  onOk,
  onCancel,
}) {
  const hasDefaultControls = !_.isUndefined(defaultControls);
  const [loading, setLoading] = useState(!hasDefaultControls);
  const [controls, setControls] = useState(defaultControls || []);
  const [dataInfo, setDataInfo] = useState(defaultDataInfo || {});
  const isCheckQuote = type === 'checkQuote';

  useEffect(() => {
    if (hasDefaultControls) return;

    let cancelled = false;

    worksheetAjax
      .getQuoteControlsById({ collectionId })
      .then(({ code, msg, data = [] }) => {
        if (cancelled) return;

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
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [collectionId, hasDefaultControls]);

  const description = isCheckQuote ? (
    controls.length ? (
      <Fragment>
        <div className="textPrimary">{_l('该选项集正被%0个字段引用。', controls.length)}</div>
        <div className="textSecondary mTop16">{_l('以下为具体引用的工作表，点击跳转到表单编辑页。')}</div>
      </Fragment>
    ) : null
  ) : (
    <span className="textPrimary">
      {_l(
        '此选项集正在被以下%0个字段引用，无法直接删除。请先解除引用关系后再删除选项集。若仅希望选项集不再被新字段引用，可将选项集停用。停用选项集不影响已引用字段的正常使用。',
        controls.length,
      )}
    </span>
  );

  return (
    <Modal
      open
      width={480}
      okText={_l('关闭')}
      cancelButtonProps={HIDDEN_CANCEL_BUTTON_PROPS}
      okButtonProps={isCheckQuote ? undefined : DANGER_OK_BUTTON_PROPS}
      title={
        <span className={cx('WordBreak', { textError: !isCheckQuote })}>
          {title || _l('无法直接删除选项集 “%0”', name)}
        </span>
      }
      keyboard
      onOk={onOk}
      onCancel={onCancel}
    >
      {description && <div className="mBottom20">{description}</div>}
      <OptionQuoteWrap>
        <ScrollView className="h100">
          {loading ? (
            <LoadDiv />
          ) : type === 'checkQuote' && _.isEmpty(dataInfo) ? (
            <Empty>
              <div className="emptyIconWrap">
                <i className="icon icon-link_record Font50 textTertiary" />
              </div>
              <div className="textDisabled mTop18 Font17">{_l('暂无引用字段')}</div>
            </Empty>
          ) : (
            Object.values(dataInfo).map(info => {
              const { appId, appName, data } = info;
              return (
                <div key={appId} className="mBottom20">
                  <div className="bold mBottom10">{appName || _l('其他')}</div>
                  {data.map((item, index) => {
                    const { controlId, controlName, worksheetId, worksheetName, worksheetType } = item;
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
    </Modal>
  );
}
