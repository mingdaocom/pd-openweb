import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dropdown, RadioGroup } from 'ming-ui';
import Abstract from '../Abstract';
import CoverSetting from '../CoverSettingCon';
import DisplayControl from '../DisplayControl';
import { getAdvanceSetting } from 'src/util';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import _ from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';

const Wrap = styled.div`
  .rowClumns {
    label {
      flex: 1;
    }
  }
`;
export default class MobileSet extends React.Component {
  constructor(props) {
    super(props);
    const { view = {} } = props;
    const {
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
    const { view, appId } = this.props;
    const { advancedSetting = {} } = view;
    const { appshowtype = '0' } = getAdvanceSetting(view);
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
                  advancedSetting: { abstract: value },
                  editAdKeys: ['abstract'],
                  editAttrs: ['advancedSetting'],
                },
                false,
              );
            }}
          />
          {/* 显示字段 */}
          <DisplayControl
            {...this.props}
            hideShowControlName
            maxCount3={appshowtype === '0'} // 移动端设置 一行三列时 最多只能设置3个
            text={_l('一行三列时，最多可设置3个显示字段。如果要显示更多字段请使用其他布局方式')}
            handleChange={data => {
              this.updateView({ ...view, appId, ...data }, false);
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
                  advancedSetting: { coverposition: value },
                  editAttrs: ['advancedSetting', 'coverType'],
                  editAdKeys: ['coverposition'],
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
                advancedSetting: { opencover: value },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['opencover'],
              });
            }}
          />
          <div
            className="line mTop32"
            style={{
              borderBottom: '1px solid #EAEAEA',
            }}
          ></div>
          {this.renderCheckRadio()}
        </div>
      </React.Fragment>
    );
  };

  renderCheckRadio = () => {
    const { worksheetControls = [], view, appId } = this.props;
    let switchList = worksheetControls.filter(it => it.type === 36);
    const { checkradioid } = this.state;
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
                  advancedSetting: { checkradioid: value },
                  editAdKeys: ['checkradioid'],
                  editAttrs: ['advancedSetting'],
                },
                false,
              );
            }}
          />
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
            advancedSetting: { appshowtype: type },
            editAttrs: ['advancedSetting'],
            editAdKeys: ['appshowtype'],
          },
          false,
        );
      },
    );
  };

  renderGallerySet = () => {
    const { view, appId } = this.props;
    return (
      <Wrap>
        <div className="viewSetTitle">{_l('移动端显示')}</div>
        <div className="title Font13 mTop24 bold">{_l('每行数量')}</div>
        <div className="settingContent">
          <p className="mTop6 mBottom8 Gray_9e viewSetText">
            {_l('为手机竖屏(屏幕宽度小于480pt)设置每行显示的记录数量')}
          </p>
          <RadioGroup
            size="middle"
            className="mBottom20 rowClumns"
            checkedValue={_.get(view, 'advancedSetting.rowcolumns') === '2' ? '2' : '1'}
            data={[
              {
                text: _l('一个'),
                value: '1',
              },
              {
                text: _l('两个'),
                value: '2',
              },
            ]}
            onChange={value => {
              this.updateView(
                {
                  ...view,
                  appId,
                  advancedSetting: { rowcolumns: value },
                  editAdKeys: ['rowcolumns'],
                  editAttrs: ['advancedSetting'],
                },
                false,
              );
            }}
          />
        </div>
        {this.renderCheckRadio()}
      </Wrap>
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
        {this.renderSet()}
      </React.Fragment>
    );
  };
  // 移动端显示
  render() {
    const { view } = this.props;
    const isGallery = VIEW_DISPLAY_TYPE[view.viewType] === 'gallery';
    if (isGallery) {
      return this.renderGallerySet();
    }
    return this.renderCon();
  }
}
