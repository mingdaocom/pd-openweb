import React from 'react';
import cx from 'classnames';
import { Icon, Dropdown } from 'ming-ui';
import RecordCard from 'src/components/recordCard';
import Abstract from '../Abstract';
import CoverSetting from '../CoverSettingCon';
import DisplayControl from '../DisplayControl';
import { getAdvanceSetting } from 'src/util';
import { updateViewAdvancedSetting } from 'src/pages/worksheet/common/ViewConfig/util';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';

export default class MobileSet extends React.Component {
  constructor(props) {
    super(props);
    const { view = {} } = props;
    const {
      abstract, // 摘要控件
      coverposition, // 封面位置
      appshowtype = '0', // 卡片类型
      checkradioid,
    } = getAdvanceSetting(view);
    this.state = {
      appshowtype: appshowtype,
      checkradioid,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { appshowtype = '0', checkradioid = '' } = getAdvanceSetting(nextProps.view);
    if (!_.isEqual(this.state.appshowtype, appshowtype) || !_.isEqual(this.state.checkradioid, checkradioid)) {
      this.setState({
        appshowtype,
        checkradioid,
      });
    }
  }
  updateView = (view, isUpdate) => {
    this.props.updateCurrentView(
      Object.assign(view, {
        filters: formatValuesOfOriginConditions(view.filters),
      }),
      isUpdate,
    );
  };
  renderSet = () => {
    const { worksheetControls = [], view, appId } = this.props;
    const { advancedSetting = {} } = view;
    const { checkradioid } = this.state;
    const { appshowtype = '0' } = getAdvanceSetting(view);
    let switchList = worksheetControls.filter(it => it.type === 36);
    const switchData =
      switchList.length > 0
        ? _.map(switchList, it => {
            return {
              text: it.controlName,
              value: it.controlId,
            };
          })
        : [];
    return (
      <React.Fragment>
        <div className="viewSetTitle">{_l('卡片显示内容')}</div>
        <div className="commonConfigItem mTop24">
          <Abstract
            {...this.props}
            advancedSetting={advancedSetting}
            handleChange={value => {
              this.updateView(
                {
                  ...view,
                  appId,
                  advancedSetting: updateViewAdvancedSetting(view, { abstract: value }),
                  editAttrs: ['advancedSetting'],
                },
                false,
              );
            }}
          />
          {/* 显示字段 */}
          <DisplayControl
            {...this.props}
            forMobile={true}
            maxCount3={appshowtype === '0'} // 移动端设置 一行三列时 最多只能设置3个
            text={_l('一行三列时，最多可设置3个显示字段。如果要显示更多字段请使用其他布局方式')}
            handleChange={checked => {
              this.updateView({ ...view, appId, showControlName: checked, editAttrs: ['showControlName'] }, false);
            }}
            handleChangeSort={({ newControlSorts, newShowControls }) => {
              this.updateView(
                {
                  appId,
                  ...view,
                  controlsSorts: newControlSorts,
                  displayControls: newShowControls,
                  customDisplay: true, //配合移动端 修改移动端显示字段时customDisplay为true
                  editAttrs: ['controlsSorts', 'displayControls', 'customDisplay'],
                },
                false,
              );
            }}
          />
          <CoverSetting
            {...this.props}
            advancedSetting={advancedSetting}
            // 是否显示
            handleChangeIsCover={value =>
              this.updateView(
                { ...view, appId, coverCid: value === 'notDisplay' ? '' : value, editAttrs: ['coverCid'] },
                false,
              )
            }
            // 显示位置
            handleChangePosition={(value, coverTypeValue) => {
              this.updateView(
                {
                  ...view,
                  appId,
                  coverType: coverTypeValue,
                  advancedSetting: updateViewAdvancedSetting(view, { coverposition: value }),
                  editAttrs: ['advancedSetting', 'coverType'],
                },
                false,
              );
            }}
            // 显示方式
            handleChangeType={value =>
              this.updateView({ ...view, appId, coverType: value, editAttrs: ['coverType'] }, false)
            }
            // 允许点击查看
            handleChangeOpencover={value => {
              this.updateView({
                ...view,
                appId,
                advancedSetting: updateViewAdvancedSetting(view, { opencover: value }),
                editAttrs: ['advancedSetting'],
              });
            }}
          />
          <div
            className="line mTop32"
            style={{
              borderBottom: '1px solid #EAEAEA',
            }}
          ></div>
          {/* 显示检查框 */}
          <div className="title Font13 mTop24 bold">{_l('显示检查框')}</div>
          <div className="settingContent">
            <p className="mTop6 mBottom8 Gray_9e viewSetText">
              {_l('选择一个检查框字段在标题前显示，可快速在卡片标记状态')}
            </p>
            <Dropdown
              data={switchData.concat({ value: '', text: _l('不显示') })}
              value={checkradioid || ''}
              border
              style={{ width: '100%' }}
              onChange={value => {
                this.updateView(
                  {
                    ...view,
                    appId,
                    advancedSetting: updateViewAdvancedSetting(view, { checkradioid: value }),
                    editAttrs: ['advancedSetting'],
                  },
                  false,
                );
              }}
            />
          </div>
        </div>
      </React.Fragment>
    );
  };

  changeShowType = type => {
    const { view, appId } = this.props;
    this.setState(
      {
        appshowtype: type,
      },
      () => {
        this.updateView(
          {
            ...view,
            appId,
            advancedSetting: updateViewAdvancedSetting(view, { appshowtype: type }),
            editAttrs: ['advancedSetting'],
          },
          false,
        );
      },
    );
  };

  renderCon = () => {
    const { appshowtype } = this.state;
    return (
      <React.Fragment>
        <div className="viewSetTitle">{_l('移动端显示')}</div>
        <div className="commonConfigItem">
          <div className="Gray_9e mTop8 mBottom24">
            {_l('表格视图中的记录在移动端以卡片的形式呈现，为移动端设置记录的显示布局，以便于移动端的数据浏览和操作。')}
          </div>
        </div>
        <div className="commonConfigItem Font13 bold">{_l('卡片模板')}</div>
        <div className="commonConfigItem mBottom32">
          <ul className="cardUl">
            {[1, 2, 0].map(it => {
              return (
                <li
                  className={cx('mTop12 Hand', {
                    current: appshowtype === it + '',
                    mRight12: it === 1,
                    mBottom4: it !== 0,
                  })}
                  onClick={() => {
                    this.changeShowType(it + '');
                  }}
                ></li>
              );
            })}
          </ul>
        </div>
        {/* 设置显示内容 */}
        {this.renderSet()}
      </React.Fragment>
    );
  };
  // 移动端显示
  render() {
    return this.renderCon();
  }
}
