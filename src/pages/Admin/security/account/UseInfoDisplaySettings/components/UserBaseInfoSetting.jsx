import React, { Component, Fragment } from 'react';
import 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dropdown, Radio, SortableList } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import userAjax from 'src/api/user';
import DepartmentFullName from 'src/components/UserInfoComponents/DepartmentFullName.jsx';
import { getFieldsData, maskValue } from '../../utils';

export default class UserBaseInfoSetting extends Component {
  constructor(props) {
    super(props);

    this.state = {
      basePopupVisible: false,
      cardPopupVisible: false,
      baseSettingData: getFieldsData(false, _.get(props, 'settings.psersonalSetList', [])),
      cardSettingData: getFieldsData(true, _.get(props, 'settings.cardSetList', [])),
      displayFieldForName: _.get(props, 'settings.displayFieldForName'),
      userInfo: {},
    };
  }

  componentDidMount() {
    this.getUserCardInfo();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.flag !== nextProps.flag) {
      this.setState({
        baseSettingData: getFieldsData(false, _.get(nextProps, 'settings.psersonalSetList', [])),
        cardSettingData: getFieldsData(true, _.get(nextProps, 'settings.cardSetList', [])),
        displayFieldForName: _.get(nextProps, 'settings.displayFieldForName'),
      });
    }
  }

  getUserCardInfo = () => {
    const { projectId } = this.props;
    const accountId = _.get(md, 'global.Account.accountId');

    userAjax.getAccountBaseInfo({ onProjectId: projectId, accountId, refresh: false }).then(res => {
      this.setState({ userInfo: res });
    });
  };

  handleDeleteItem = (id, isCard) => {
    const { displayFieldForName } = this.state;
    const typeFields = isCard ? 'cardSettingData' : 'baseSettingData';
    const filterData = this.state[typeFields].filter(v => v.id !== id);
    this.setState({
      [typeFields]: filterData,
      displayFieldForName:
        _.includes([55, 56], displayFieldForName) && isCard && id === 'mobilePhone'
          ? 55
          : _.includes([57, 58], displayFieldForName) && isCard && id === 'email'
            ? 57
            : displayFieldForName,
    });
  };

  changeCardDepartmentTYpeId = typeId => {
    const { cardSettingData } = this.state;
    const index = _.findIndex(cardSettingData, v => _.includes([51, 52], v.typeId));
    cardSettingData[index] = {
      ...cardSettingData[index],
      typeId,
      id: typeId === 51 ? 'currentDepartmentName' : 'currentDepartmentFullName',
    };
    this.setState({ cardSettingData, flag: Date.now() });
  };

  // 手机号/邮箱掩码处理
  handleMask = item => {
    const { cardSettingData, displayFieldForName } = this.state;
    const copyData = _.clone(cardSettingData);
    const index = _.findIndex(copyData, ({ id }) => id === item.id);
    copyData[index] = { ...copyData[index], typeId: item.typeId, isMask: !copyData[index].isMask, hideMask: undefined };
    this.setState({
      cardSettingData: copyData,
      displayFieldForName:
        (_.includes([55, 56], displayFieldForName) && item.id === 'mobilePhone') ||
        (_.includes([57, 58], displayFieldForName) && item.id === 'email')
          ? item.typeId
          : displayFieldForName,
    });
  };

  // 查看手机号、邮箱
  showMaskInfo = item => {
    const { cardSettingData } = this.state;

    const copyData = _.clone(cardSettingData);
    const index = _.findIndex(copyData, v => v.id === item.id);

    copyData[index] = { ...copyData[index], hideMask: true };
    this.setState({ cardSettingData: copyData });
  };

  renderAddFields = isCard => {
    const typeFields = isCard ? 'cardSettingData' : 'baseSettingData';
    const selectIds = this.state[typeFields].map(v => v.id);
    const fields = getFieldsData(isCard);
    const selectFields = fields.filter(v => {
      const index = _.findIndex(selectIds, id =>
        _.includes(['currentDepartmentName', 'currentDepartmentFullName'], id),
      );
      return (
        !_.includes(selectIds, v.id) &&
        (index > -1 ? !_.includes(['currentDepartmentName', 'currentDepartmentFullName'], v.id) : true)
      );
    });

    if (_.isEmpty(selectFields)) {
      return (
        <div className="addFieldsWrap Gray_9e flexRow alignItemsCenter justifyContentCenter">
          {_l('没有可添加字段')}
        </div>
      );
    }

    return (
      <div className="addFieldsWrap">
        {selectFields.map(item => (
          <div
            className="addFieldsItem"
            key={item.id}
            onClick={() => {
              this.setState({ [typeFields]: this.state[typeFields].concat(item) });
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    );
  };

  renderSortableItem = ({ item, isCard }) => {
    const { editStatus } = this.props;
    const isDisabled = _.includes([1, 3], item.typeId) || editStatus === 0; // 个人资料部门职位不可操作
    const isCardDepartment = _.includes([51, 52], item.typeId);

    // 名片层部门
    if (isCardDepartment) {
      return (
        <div className={cx('baseSettingItem isCardDepartment', { disabledItem: isDisabled })}>
          <div className="flexRow alignItemsCenter mBottom10 LineHeight32">
            <span className="icon-drag grabIcon Gray_bd"></span>
            <div className="mLeft5">{_l('部门')}</div>
            <div className="flex"></div>
            {editStatus && (isCard || !isDisabled) ? (
              <span className="deleteIcon Gray_bd Font16" onClick={() => this.handleDeleteItem(item.id, isCard)}>
                <i className="icon icon-close Hand" />
              </span>
            ) : null}
          </div>
          <div>
            <span className="deptLine"></span>
            <Radio
              disabled={editStatus === 0}
              className="mRight50"
              checked={item.typeId === 51}
              text={_l('仅显示成员所在部门')}
              onClick={() => this.changeCardDepartmentTYpeId(51)}
            />
            <Radio
              disabled={editStatus === 0}
              checked={item.typeId === 52}
              text={_l('显示部门路径')}
              onClick={() => this.changeCardDepartmentTYpeId(52)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={cx('baseSettingItem flexRow alignItemsCenter', { disabledItem: isDisabled })}>
        <span className="icon-drag grabIcon Gray_bd"></span>
        <span className="flex ellipsis mLeft5">
          {item.text}
          {isCard && _.includes(['mobilePhone', 'email'], item.id) ? (
            editStatus === 0 ? (
              <span
                className={cx('icon icon-workflow_hide mLeft12', {
                  Gray_bd: !item.isMask,
                  maskColor: item.isMask,
                })}
              />
            ) : (
              <Tooltip placement="top" title={item.isMask ? _l('取消掩码显示') : _l('设为掩码显示')}>
                <span
                  className={cx('Hand icon icon-workflow_hide mLeft12', {
                    Gray_bd: !item.isMask,
                    maskColor: item.isMask,
                  })}
                  onClick={() =>
                    this.handleMask({
                      ...item,
                      typeId: item.id === 'mobilePhone' ? (item.typeId === 55 ? 56 : 55) : item.typeId === 57 ? 58 : 57,
                    })
                  }
                />
              </Tooltip>
            )
          ) : null}
        </span>
        {editStatus && (isCard || !isDisabled) ? (
          <span className="deleteIcon Gray_bd Font16" onClick={() => this.handleDeleteItem(item.id, isCard)}>
            <i className="icon icon-close Hand" />
          </span>
        ) : null}
      </div>
    );
  };

  renderAddAction = isCard => {
    const typeFields = isCard ? 'basePopupVisible' : 'cardPopupVisible';
    const { editStatus } = this.props;
    if (!editStatus) {
      return (
        <div className="disabledAction mTop12 Hand">
          <i className="icon icon-plus mRight5" />
          <span>{_l('添加字段')}</span>
        </div>
      );
    }

    return (
      <Trigger
        popupVisible={this.state[typeFields]}
        onPopupVisibleChange={visible => this.setState({ [typeFields]: visible })}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 0],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={() => this.renderAddFields(isCard)}
      >
        <div className="addFields ThemeColor mTop12 InlineBlock Hand">
          <i className="icon icon-plus mRight5" />
          <span>{_l('添加字段')}</span>
        </div>
      </Trigger>
    );
  };

  // 个人资料
  renderPersonalProfile = () => {
    const { editStatus } = this.props;
    const { baseSettingData } = this.state;

    return (
      <div className="baseInfoWrap">
        <div className="baseInfoTitle Font15">{_l('个人资料')}</div>
        <div className="Gray_75 mBottom12">{_l('设置个人资料成员互相可见的字段信息')}</div>
        <div className="baseSettings">
          {baseSettingData.filter(v => _.includes([1, 3], v.typeId)).map(item => this.renderSortableItem({ item }))}
          <SortableList
            canDrag={editStatus !== 0}
            items={baseSettingData.filter(v => !_.includes([1, 3], v.typeId))}
            itemKey="id"
            renderItem={item => this.renderSortableItem({ ...item, isCard: false })}
            onSortEnd={newItems =>
              this.setState({
                baseSettingData: baseSettingData.filter(v => _.includes([1, 3], v.typeId)).concat(newItems),
              })
            }
          />
        </div>
        {this.renderAddAction(false)}
      </div>
    );
  };

  renderPreviewValue = (item, underName) => {
    if (!item) return null;
    const { userInfo = {} } = this.state;
    let content = '';

    switch (item.id) {
      case 'mobilePhone':
      case 'email':
        content = userInfo[item.id] ? (
          <Fragment>
            {item.isMask && !item.hideMask ? maskValue(userInfo[item.id], item.id) : userInfo[item.id]}
            {item.isMask && !item.hideMask && !underName && (
              <span className="maskIcon" onClick={() => this.showMaskInfo(item)}>
                <i className="icon icon-eye_off Gray_bd" />
              </span>
            )}
          </Fragment>
        ) : (
          ''
        );
        break;
      case 'currentDepartmentFullName':
      case 'currentDepartmentName':
        content = (
          <DepartmentFullName
            noPath={item.id === 'currentDepartmentName'}
            projectId={this.props.projectId}
            departmentInfos={userInfo.departmentInfos}
          />
        );
        break;
      case 'currentJobTitleName':
        content = (
          <span title={(userInfo.jobInfos || []).map(item => item.jobName).join(';')}>
            {(userInfo.jobInfos || []).map(item => item.jobName).join(';')}
          </span>
        );
        break;
      default:
        content = userInfo[item.id];
    }

    return underName ? content : content || <span className="Gray_bd">{_l('未填写')}</span>;
  };

  // 名片层
  renderBusinessCard = () => {
    const { editStatus } = this.props;
    const { cardSettingData, displayFieldForName, flag } = this.state;
    const account = md.global.Account;
    const fields = getFieldsData(true, []).map(item => {
      const typeId =
        _.includes([51, 52], displayFieldForName) && _.includes([51, 52], item.typeId)
          ? displayFieldForName
          : (_.find(cardSettingData, v => v.id === item.id) || {}).typeId || item.typeId;
      return {
        ...item,
        typeId,
        id: _.includes([51, 52], typeId) ? 'currentDepartmentName' : item.id,
        isMask: _.includes([56, 58], typeId) ? true : false,
        hideMask: (_.find(cardSettingData, v => v.typeId === typeId) || {}).hideMask,
      };
    });

    const previewFields = getFieldsData(true, cardSettingData);

    return (
      <div className="baseInfoWrap pTop30 noBorder">
        <div className="baseInfoTitle Font15">{_l('名片层')}</div>
        <div className="Gray_75 mBottom12">{_l('设置名片层显示的字段信息')}</div>
        <div className="flexRow">
          <div className="settingWrap">
            <div className="flexRow alignItemsCenter mBottom12">
              <span className="mRight12">{_l('姓名下显示字段')}</span>
              <Dropdown
                style={{ width: 240 }}
                menuClass="w100"
                border
                cancelAble={editStatus}
                placeholder={_l('未设置')}
                disabled={!editStatus}
                value={displayFieldForName}
                data={fields.map(v => ({ text: v.text, value: v.typeId }))}
                onChange={value => this.setState({ displayFieldForName: value })}
              />
            </div>

            <div className="baseSettings">
              <SortableList
                flag={flag}
                canDrag={editStatus !== 0}
                items={cardSettingData}
                itemKey="id"
                renderItem={item => this.renderSortableItem({ ...item, isCard: true })}
                onSortEnd={newItems => this.setState({ cardSettingData: newItems.map(v => ({ ...v })) })}
              />
            </div>
            {this.renderAddAction(true)}
          </div>

          <div className="effectPreview">
            <div className="Gray_9e bold Font14 mBottom16">{_l('效果预览')}</div>
            <div className="previewCard Relative">
              <div className="cardAccount flexRow alignItemsCenter mBottom16">
                <img className="avatar" src={account.avatar} />
                <div className="mLeft8 flex accountBaseInfo">
                  <div className="Font15 fullname bold">{account.fullname}</div>
                  <div className="Gray_75 ellipsis">
                    {this.renderPreviewValue(
                      _.find(fields, v => v.typeId === displayFieldForName),
                      true,
                    )}
                  </div>
                </div>
              </div>
              {previewFields.map(item => (
                <div
                  key={item.id}
                  className={cx('cardItem flexRow', {
                    departmentItem: item.id === 'currentDepartmentFullName',
                  })}
                >
                  <span className="Gray_75 mRight8">{item.text}</span>
                  <span className="flex ellipsis">{this.renderPreviewValue(item)}</span>
                </div>
              ))}
              <div className="arrow Absolute"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    return (
      <Fragment>
        {this.renderPersonalProfile()}
        {this.renderBusinessCard()}
      </Fragment>
    );
  }
}
