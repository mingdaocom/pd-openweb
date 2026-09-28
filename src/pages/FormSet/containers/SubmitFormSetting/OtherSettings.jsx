import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Radio, Select, Switch } from 'ming-ui/antd-components';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { defaultDoubleConfirm } from './config';
import DoubleConfirmationDialog from './DoubleConfirmDialog';
import { WrapTxt } from './style';

export default function (props) {
  const { worksheetId, advancedSetting, onChangeSetting } = props;

  const [{ showDoubleConfirm }, setState] = useSetState({
    showDoubleConfirm: false,
  });

  const isReserve = () => {
    return (_.get(advancedSetting, 'reservecontrols') || '').indexOf('[') >= 0;
  };

  const renderTxt = () => {
    const doubleconfirm = safeParse(_.get(advancedSetting, 'doubleconfirm'));
    return (
      advancedSetting.enableconfirm === '1' &&
      !!doubleconfirm.confirmMsg && (
        <WrapTxt className="flexRow w100">
          <div className="txtFilter flex">
            <p>
              <span className="titleTxt textPrimary">{_l('提示文字')}</span>
              <span className="txt textPrimary WordBreak">{_.get(doubleconfirm, 'confirmMsg')}</span>
            </p>
            {!!(_.get(doubleconfirm, 'confirmContent') || '').trim() && (
              <p className="mTop5 flexRow w100">
                <span className="titleTxt textPrimary">{_l('详细内容')}</span>
                <span className="txt textPrimary WordBreak overflow_ellipsis flex">
                  {_.get(doubleconfirm, 'confirmContent')}
                </span>
              </p>
            )}
          </div>
          <Icon
            icon="hr_edit"
            className="textTertiary Font18 editFilter Hand"
            onClick={() => setState({ showDoubleConfirm: true })}
          />
        </WrapTxt>
      )
    );
  };

  const formatReserveControls = () => {
    return props.worksheetControls
      .filter(
        o =>
          !ALL_SYS.includes(o.controlId) &&
          [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 17, 18, 19, 21, 23, 24, 26, 27, 28, 29, 34, 35, 36, 40, 41,
            42, 44, 46, 48,
          ].includes(o.type),
      )
      .map(o => {
        return { label: o.controlName, value: o.controlId };
      });
  };

  const reserveControlIds = isReserve() ? safeParse(advancedSetting.reservecontrols) : [];
  const reserveControlOptions = formatReserveControls();
  const deletedControlOptions = reserveControlIds
    .filter(id => !reserveControlOptions.some(option => option.value === id))
    .map(value => ({ label: <span className="Red">{_l('字段已删除')}</span>, value }));

  return (
    <>
      <h5 className="mBottom12">{_l('更多设置')}</h5>
      {!md.global.SysSettings.hideAIBasicFun && (
        <div className="moreActionCon flexRow">
          <div className="flex">
            <h6 className="mTop20">{_l('AI填写')}</h6>
            <p className="textTertiary">
              {_l('在表单中显示“AI填写”按钮。支持上传文字、图片或文档，AI 将自动解析并填写字段')}
            </p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={advancedSetting.aifillin !== '1'}
              onClick={(checked, event) => {
                event.stopPropagation();
                return onChangeSetting({
                  aifillin: advancedSetting.aifillin === '1' ? '0' : '1',
                });
              }}
            />
          </div>
        </div>
      )}
      <div className="moreActionCon flexRow">
        <div className="flex">
          <h6 className="mTop20">{_l('存草稿')}</h6>
          <p className="textTertiary">{_l('在表单中显示存草稿按钮，草稿数据在下次打开时可以继续编辑并提交')}</p>
        </div>
        <div className="mRight16 mLeft40 Relative">
          <Switch
            checked={advancedSetting.closedrafts !== '1'}
            onClick={(checked, event) => {
              event.stopPropagation();
              return onChangeSetting({
                closedrafts: advancedSetting.closedrafts === '1' ? '0' : '1',
              });
            }}
          />
        </div>
      </div>
      <div className="moreActionCon">
        <div className="flexRow alignItemsCenter">
          <div className="flex">
            <h6 className="mTop20">{_l('继续创建时，保留本次提交内容')}</h6>
            <p className="textTertiary">{_l('启用后，在连续创建数据时可以自动填充上次提交的内容，减少重复输入')}</p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              className={cx('Hand TxtMiddle')}
              checked={advancedSetting.showcontinue !== '0'}
              onClick={(checked, event) => {
                event.stopPropagation();
                return onChangeSetting({
                  showcontinue: advancedSetting.showcontinue === '0' ? '1' : '0',
                });
              }}
            />
          </div>
        </div>
        {advancedSetting.showcontinue !== '0' && (
          <div className="mLeft12">
            <div className="flexRow mTop16 pRight16">
              <Select
                options={[
                  { label: _l('保留所有提交内容'), value: 'all' },
                  { label: _l('保留指定字段'), value: 'reserve' },
                ]}
                value={!isReserve() ? 'all' : 'reserve'}
                className={cx('act', !isReserve() ? 'flex' : 'w200')}
                onChange={value => {
                  onChangeSetting({
                    reservecontrols: value === 'all' ? 'all' : '[]',
                  });
                }}
              />
              {isReserve() && (
                <Select
                  mode="multiple"
                  key={worksheetId}
                  options={[...deletedControlOptions, ...reserveControlOptions]}
                  value={reserveControlIds}
                  className={cx('flex mLeft10 controlsDropdown')}
                  onChange={values => onChangeSetting({ reservecontrols: JSON.stringify(values) })}
                  placeholder={_l('请选择')}
                  allowClear
                />
              )}
            </div>
            <div className="mTop12 textSecondary Font13 Bold">{_l('保留方式')}</div>
            <Radio.Group
              className="autoreserveCon flexColumn"
              options={[
                { value: '0', text: _l('显示“保留上次提交内容”选项，由用户决定是否保留') },
                { value: '1', text: _l('无需询问，自动保留') },
              ].map(({ text, ...option }) => ({ ...option, label: text }))}
              value={advancedSetting.autoreserve === '1' ? '1' : '0'}
              onChange={event => {
                const autoreserve = event.target.value;

                onChangeSetting({
                  autoreserve: autoreserve,
                });
              }}
            />
          </div>
        )}
      </div>
      <div className="moreActionCon">
        <div className="flexRow alignItemsCenter">
          <div className="flex">
            <h6 className="mTop20">{_l('提交记录时二次确认')}</h6>
            <p className="textTertiary">{_l('在点击表单提交时，弹出二次确认层确认后提交')}</p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={advancedSetting.enableconfirm === '1'}
              onClick={(checked, event) => {
                event.stopPropagation();
                let info;

                if (advancedSetting.enableconfirm !== '1' && !_.get(advancedSetting, 'doubleconfirm')) {
                  info = {
                    doubleconfirm: JSON.stringify(defaultDoubleConfirm),
                  };
                  setState({
                    showDoubleConfirm: true,
                  });
                }

                onChangeSetting({
                  enableconfirm: advancedSetting.enableconfirm === '1' ? '0' : '1',
                  ...info,
                });
              }}
            />
          </div>
        </div>
        {showDoubleConfirm && (
          <DoubleConfirmationDialog
            visible={showDoubleConfirm}
            onCancel={() => setState({ showDoubleConfirm: false })}
            doubleConfirm={safeParse(advancedSetting.doubleconfirm)}
            onChange={doubleconfirm => {
              onChangeSetting({
                doubleconfirm: JSON.stringify(doubleconfirm),
              });
              setState({ showDoubleConfirm: false });
            }}
          />
        )}
        {renderTxt()}
      </div>
      <div className="moreActionCon flexRow borderB">
        <div className="flex">
          <h6 className="mTop20">{_l('通过提交按钮新增时，立即执行工作流')}</h6>
          <p className="textTertiary">
            {_l(
              '启用后，通过点击表单提交按钮创建的记录，在触发工作流后会立即开始执行（无需系统默认的5s延时等待）。当执行完成或等待时会同时刷新前端数据。',
            )}
          </p>
        </div>
        <div className="mRight16 mLeft40 Relative">
          <Switch
            checked={advancedSetting.executeworkflow === '1'}
            onClick={(checked, event) => {
              event.stopPropagation();
              onChangeSetting({
                executeworkflow: advancedSetting.executeworkflow === '1' ? '0' : '1',
              });
            }}
          />
        </div>
      </div>
    </>
  );
}
