import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Button, Input, Popover, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import { getShowViews } from 'src/utils/services/worksheet/view';
import { btnList, SUBMIT_NEXT_ACTION_LIST } from './config';
import { Wrap } from './style';

const InputComponent = ({ str, handleBlur }) => {
  return (
    <Wrap>
      <p className="Font13">{_l('按钮名称')}</p>
      <Input className="btnName mTop10" defaultValue={str} autoFocus onBlur={handleBlur} />
    </Wrap>
  );
};

export default function SubmitButtonSettings(props) {
  const { advancedSetting, onChangeSetting } = props;

  const [{ str, index }, setState] = useSetState({
    str: '',
    index: null,
  });

  const renderBtnCon = (data, i) => {
    const noAction = i === 1 && advancedSetting.continuestatus === '0';
    const btnStr = _.get(advancedSetting, data[1]) || (i === 0 ? _l('提交') : _l('继续创建'));

    return (
      <React.Fragment>
        <div
          className={cx('con', {
            nextBtn: i === 1,
            mTop10: i !== 0,
            noAction,
          })}
        >
          <div className="buttonPreviewCon">
            <Popover
              noPadding
              trigger="click"
              content={
                <InputComponent
                  str={str}
                  handleBlur={e => {
                    const value = e.target.value.trim();
                    setState({ str: '', index: null });
                    onChangeSetting({ [data[1]]: value ? value : str });
                  }}
                />
              }
              placement="bottomLeft"
            >
              <div className="flexRow alignItemsCenter">
                <Button
                  className="submitButtonPreview"
                  color={i === 0 ? 'primary' : 'default'}
                  variant={i === 0 ? 'solid' : 'outlined'}
                >
                  <span className="overflow_ellipsis">{!!str && !!index && index === i ? str : btnStr}</span>
                </Button>
                {!noAction && (
                  <Tooltip placement="bottom" title={_l('修改按钮名称')}>
                    <Icon
                      icon="workflow_write"
                      className="Font16 Hand mLeft5 TxtTop LineHeight30"
                      onClick={() => setState({ index: i, str: btnStr })}
                    />
                  </Tooltip>
                )}
              </div>
            </Popover>
          </div>
          <span className="after flex">
            <span className="textSecondary TxtMiddle">{_l('提交后：')}</span>
            <Select
              variant="borderless"
              styles={{ popup: { root: { minWidth: 150, width: 'auto' } } }}
              options={SUBMIT_NEXT_ACTION_LIST}
              value={_.get(advancedSetting, data[0]) || (i === 0 ? '1' : '2')}
              className={cx('flex')}
              onChange={newValue => {
                if (newValue === _.get(advancedSetting, data[0])) return;
                let param = {};

                if (newValue === '3') {
                  if (!_.get(advancedSetting, data[2])) {
                    param = {
                      ...param,
                      [data[2]]: _.get(props, 'worksheetInfo.views[0].viewId'),
                    };
                  }
                }

                onChangeSetting({
                  ...param,
                  [data[0]]: newValue,
                });
              }}
            />
            {_.get(advancedSetting, data[0]) === '3' && (
              <span className="viewCon mLeft25">
                <span className="textSecondary TxtMiddle">{_l('视图：')}</span>
                <Select
                  variant="borderless"
                  options={getShowViews(_.get(props, 'worksheetInfo.views') || []).map(item => {
                    return { label: item.name, value: item.viewId };
                  })}
                  value={_.get(advancedSetting, data[2])}
                  placeholder={
                    _.get(advancedSetting, data[2]) ? <span className="Red">{_l('视图已删除')}</span> : _l('选择视图')
                  }
                  className={cx('flex')}
                  onChange={newValue => {
                    if (newValue === _.get(advancedSetting, data[2])) return;
                    onChangeSetting({ [data[2]]: newValue });
                  }}
                  styles={{ popup: { root: { minWidth: 160 } } }}
                />
              </span>
            )}
          </span>
          {noAction && <div className="cover" />}
          {i === 1 && (
            <Switch
              className="Hand switchBtn"
              checked={_.get(advancedSetting, data[3]) !== '0'}
              onClick={(checked, event) => {
                event.stopPropagation();
                onChangeSetting({
                  [data[3]]: _.get(advancedSetting, data[3]) === '0' ? '1' : '0',
                });
              }}
            />
          )}
        </div>
      </React.Fragment>
    );
  };

  return (
    <>
      <h5>{_l('提交按钮')}</h5>
      {btnList.map((o, i) => renderBtnCon(o, i))}
    </>
  );
}
