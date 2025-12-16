import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dropdown, Icon, RadioGroup, Switch } from 'ming-ui';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { defaultDoubleConfirm } from './config';
import DoubleConfirmationDialog from './DoubleConfirmDialog';
import { WrapTxt } from './style';

export default function (props) {
  const { worksheetId, advancedSetting, onChangeSetting } = props;

  const [{ dropDownVisible, showDoubleConfirm }, setState] = useSetState({
    dropDownVisible: false,
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
              <span className="titleTxt Gray">{_l('提示文字')}</span>
              <span className="txt Gray WordBreak">{_.get(doubleconfirm, 'confirmMsg')}</span>
            </p>
            {!!(_.get(doubleconfirm, 'confirmContent') || '').trim() && (
              <p className="mTop5 flexRow w100">
                <span className="titleTxt Gray">{_l('详细内容')}</span>
                <span className="txt Gray WordBreak overflow_ellipsis flex">
                  {_.get(doubleconfirm, 'confirmContent')}
                </span>
              </p>
            )}
          </div>
          <Icon
            icon="hr_edit"
            className="Gray_9d Font18 editFilter Hand"
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
        return { text: o.controlName, value: o.controlId };
      });
  };

  const handChange = value => {
    if (!value) {
      onChangeSetting({ reservecontrols: JSON.stringify([]) });
      return;
    }
    let data = safeParse(advancedSetting.reservecontrols);
    if (data.includes(value)) {
      data = data.filter(o => o !== value);
    } else {
      data = [...data, value];
    }
    onChangeSetting({ reservecontrols: JSON.stringify(data) });
  };

  const renderItem = item => {
    const reservecontrols = safeParse(advancedSetting.reservecontrols);
    const isCur = reservecontrols.includes(item.value);
    return (
      <div className={cx('itemText flexRow alignItemsCenter', { isCur })}>
        <Checkbox className="Hand" checked={isCur} />
        <span className="mLeft10 flex Gray overflow_ellipsis">{item.text}</span>
      </div>
    );
  };

  const renderTitle = () => {
    const reservecontrols = safeParse(advancedSetting.reservecontrols);
    return (
      <div className="">
        {reservecontrols.map(it => {
          const control = props.worksheetControls.find(o => o.controlId === it);
          return (
            <div className="itemT flexRow alignItemsCenter">
              <span className={cx('flex overflow_ellipsis', { Red: !control })}>
                {!control ? _l('字段已删除') : control.controlName}
              </span>
              <Icon
                icon={'close'}
                className="Hand mLeft3 ThemeHoverColor3"
                onClick={e => {
                  e.stopPropagation();
                  let data = reservecontrols.filter(a => a !== it);
                  onChangeSetting({
                    reservecontrols: JSON.stringify(data),
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <h5 className="mBottom12">{_l('更多设置')}</h5>
      {!md.global.SysSettings.hideAIBasicFun && (
        <div className="moreActionCon flexRow">
          <div className="flex">
            <h6 className="mTop20">{_l('AI填写')}</h6>
            <p className="Gray_9e">
              {_l('在表单中显示“AI填写”按钮。支持上传文字、图片或文档，AI 将自动解析并填写字段')}
            </p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={advancedSetting.aifillin !== '1'}
              onClick={() => onChangeSetting({ aifillin: advancedSetting.aifillin === '1' ? '0' : '1' })}
            />
          </div>
        </div>
      )}
      <div className="moreActionCon flexRow">
        <div className="flex">
          <h6 className="mTop20">{_l('存草稿')}</h6>
          <p className="Gray_9e">{_l('在表单中显示存草稿按钮，草稿数据在下次打开时可以继续编辑并提交')}</p>
        </div>
        <div className="mRight16 mLeft40 Relative">
          <Switch
            checked={advancedSetting.closedrafts !== '1'}
            onClick={() => onChangeSetting({ closedrafts: advancedSetting.closedrafts === '1' ? '0' : '1' })}
          />
        </div>
      </div>
      <div className="moreActionCon">
        <div className="flexRow alignItemsCenter">
          <div className="flex">
            <h6 className="mTop20">{_l('继续创建时，保留本次提交内容')}</h6>
            <p className="Gray_9e">{_l('启用后，在连续创建数据时可以自动填充上次提交的内容，减少重复输入')}</p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              className={cx('Hand TxtMiddle')}
              checked={advancedSetting.showcontinue !== '0'}
              onClick={() => onChangeSetting({ showcontinue: advancedSetting.showcontinue === '0' ? '1' : '0' })}
            />
          </div>
        </div>
        {advancedSetting.showcontinue !== '0' && (
          <div className="mLeft12">
            <div className="flexRow mTop16 pRight16">
              <Dropdown
                data={[
                  { text: _l('保留所有提交内容'), value: 'all' },
                  { text: _l('保留指定字段'), value: 'reserve' },
                ]}
                value={!isReserve() ? 'all' : 'reserve'}
                className={cx('act', !isReserve() ? 'flex' : 'w200')}
                onChange={value => {
                  onChangeSetting({
                    reservecontrols: value === 'all' ? 'all' : '[]',
                  });
                }}
                border
                isAppendToBody
              />
              {isReserve() && (
                <Dropdown
                  key={worksheetId}
                  data={formatReserveControls()}
                  border
                  value={
                    safeParse(advancedSetting.reservecontrols).length <= 0
                      ? undefined
                      : safeParse(advancedSetting.reservecontrols)
                  }
                  className={cx('flex mLeft10 controlsDropdown')}
                  onChange={handChange}
                  placeholder={_l('请选择')}
                  renderItem={renderItem}
                  cancelAble
                  popupVisible={dropDownVisible}
                  onVisibleChange={dropDownVisible => setState({ dropDownVisible })}
                  selectClose={false}
                  menuClass={'reserveControlsDropdownMenuSet'}
                  renderTitle={renderTitle}
                  isAppendToBody
                />
              )}
            </div>
            <div className="mTop12 Gray_75 Font13 Bold">{_l('保留方式')}</div>
            <RadioGroup
              className="autoreserveCon flexColumn"
              data={[
                { value: '0', text: _l('显示“保留上次提交内容”选项，由用户决定是否保留') },
                { value: '1', text: _l('无需询问，自动保留') },
              ]}
              checkedValue={advancedSetting.autoreserve === '1' ? '1' : '0'}
              onChange={autoreserve => {
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
            <p className="Gray_9e">{_l('在点击表单提交时，弹出二次确认层确认后提交')}</p>
          </div>
          <div className="mRight16 mLeft40 Relative">
            <Switch
              checked={advancedSetting.enableconfirm === '1'}
              onClick={() => {
                let info;
                if (advancedSetting.enableconfirm !== '1' && !_.get(advancedSetting, 'doubleconfirm')) {
                  info = { doubleconfirm: JSON.stringify(defaultDoubleConfirm) };
                  setState({ showDoubleConfirm: true });
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
          <h6 className="mTop20">
            {_l('通过提交按钮新增时，立即执行工作流')}
            <i className="icon-beta1 Font16 mLeft5" style={{ color: '#4caf50' }} />
          </h6>
          <p className="Gray_9e">
            {_l(
              '启用后，通过点击表单提交按钮创建的记录，在触发工作流后会立即开始执行（无需系统默认的5s延时等待）。当执行完成或等待时会同时刷新前端数据。',
            )}
          </p>
        </div>
        <div className="mRight16 mLeft40 Relative">
          <Switch
            checked={advancedSetting.executeworkflow === '1'}
            onClick={() => {
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
