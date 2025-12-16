import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dropdown, Icon, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getShowViews } from 'src/pages/worksheet/views/util';
import { btnList, SUBMIT_NEXT_ACTION_LIST } from './config';
import { Wrap } from './style';

const InputComponent = ({ str, handleBlur }) => {
  return (
    <Wrap>
      <p className="Font13">{_l('按钮名称')}</p>
      <input type="text" className="btnName mTop10" defaultValue={str} autoFocus={true} onBlur={handleBlur} />
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
          <div className="btnCon">
            <Trigger
              action={['click']}
              popup={
                <InputComponent
                  str={str}
                  handleBlur={e => {
                    const value = e.target.value.trim();
                    setState({ str: '', index: null });
                    onChangeSetting({ [data[1]]: value ? value : str });
                  }}
                />
              }
              popupClassName={cx('inputTrigger')}
              popupAlign={{
                points: ['tl', 'bl'],
                overflow: {
                  adjustX: true,
                  adjustY: true,
                },
              }}
            >
              <div className="TxtMiddle">
                <span className="btnStr InlineBlock overflow_ellipsis">
                  {!!str && !!index && index === i ? str : btnStr}
                </span>
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
            </Trigger>
          </div>
          <span className="after flex">
            <span className="Gray_75 TxtMiddle">{_l('提交后：')}</span>
            <Dropdown
              menuStyle={{ minWidth: 150, width: 'auto' }}
              currentItemClass="currentMenu"
              data={SUBMIT_NEXT_ACTION_LIST}
              value={_.get(advancedSetting, data[0]) || (i === 0 ? '1' : '2')}
              className={cx('flex InlineBlock')}
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
                <span className="Gray_75 TxtMiddle">{_l('视图：')}</span>
                <Dropdown
                  menuStyle={{ width: 150 }}
                  currentItemClass="currentMenu"
                  data={getShowViews(_.get(props, 'worksheetInfo.views') || []).map(item => {
                    return { text: item.name, value: item.viewId };
                  })}
                  value={_.get(advancedSetting, data[2])}
                  placeholder={
                    _.get(advancedSetting, data[2]) ? <span className="Red">{_l('视图已删除')}</span> : _l('选择视图')
                  }
                  className={cx('flex InlineBlock')}
                  onChange={newValue => {
                    if (newValue === _.get(advancedSetting, data[2])) return;
                    onChangeSetting({ [data[2]]: newValue });
                  }}
                />
              </span>
            )}
          </span>
          {noAction && <div className="cover" />}
          {i === 1 && (
            <Switch
              className="Hand switchBtn"
              checked={_.get(advancedSetting, data[3]) !== '0'}
              onClick={() => {
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
