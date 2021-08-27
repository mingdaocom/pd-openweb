import React from 'react';
import { connect } from 'react-redux';
import { Icon, LoadDiv, Support } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { showEditFn, getRulesAll, deleteRules, saveFn } from '../actions/action';
import { Prompt } from 'react-router';
import { getProjectLicenseSupportInfo } from 'src/api/project';
import './index.less';
import EditCon from '../modules/editCon';
import PeopleAvatar from '../modules/peopleAvatar';
import cx from 'classnames';
import { upgradeVersionDialog } from 'src/util';
let rulesType = ['hiddeRules', 'refuseExternalDepRules', 'refuseUserRules'];
class ContactsHidden extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      licenseType: null,
      loadingProject: true,
      isFree: false,
    };
  }

  componentDidMount() {
    const { projectId, dispatch } = this.props;

    dispatch(getRulesAll(projectId));
    this.expireDialogFn();
  }

  renderList = (/* type*/) => {
    let type = rulesType[1]; // 暂时只做限制查看外部门
    const { data = [], dispatch, projectId } = this.props;

    return _.map(data, (item, i) => {
      return (
        <div className="rulesBox" key={item.ruleId}>
          <span className="nameTop">{_l('规则 %0', i + 1)}</span>
          <div className="userBox">
            {_.map(item.items, user => {
              return (
                <div className="userItem">
                  {user.targetType === 20 ? (
                    <React.Fragment>
                      <span className="depIcon">
                        <Icon className="department Hand" icon="topbar_workflow" />
                      </span>
                      <span className="fullname">{user.targetName}</span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <PeopleAvatar user={user} />
                      <span className="fullname">{user.targetName}</span>
                    </React.Fragment>
                  )}
                </div>
              );
            })}
          </div>
          <span
            className="editRule"
            onClick={() => {
              dispatch(showEditFn(true, type, item.ruleId));
            }}
          >
            {_l('编辑')}
          </span>
          <span
            className="deleteRule"
            onClick={() => {
              Confirm({
                className: '',
                title: _l('确定删除这条规则么？'),
                okText: _l('确认'),
                buttonType: 'primary',
                cancelText: _l('取消'),
                onOk: () => {
                  dispatch(deleteRules(projectId, item.ruleId));
                },
              });
            }}
          >
            {_l('删除')}
          </span>
        </div>
      );
    });
  };

  renderCon = () => {
    let type = rulesType[1]; // 暂时只做限制查看外部门
    const { data = [], dispatch, projectId } = this.props;

    return (
      <div className="">
        <h6 className="Gray Font15">
          {type === rulesType[0]
            ? _l('隐藏的成员')
            : type === rulesType[1]
            ? _l('限制查看外部门')
            : _l('限制查看所有人')}
        </h6>
        <p className={cx('Gray_9e Font13 mTop12', { mBottom10: data.length > 0 })}>
          {type === rulesType[0]
            ? _l('被隐藏的成员 ，不会显示在通讯录中')
            : type === rulesType[1]
            ? _l('被限制后，只能看到本部门的通讯录')
            : _l('被限制后，不能看到企业所有通讯录')}
        </p>
        {this.renderList(type)}
        <span
          className="addBtn Font13 Hand mTop24"
          onClick={e => {
            if (this.state.loadingProject) {
              return;
            }
            if (this.state.licenseType === 3) {
              dispatch(showEditFn(true, type));
            } else {
              upgradeVersionDialog({
                projectId,
                explainText: _l('请升级至付费版解锁开启'),
                isFree: this.state.isFree,
              });
            }
          }}
        >
          <Icon className="Font16 mRight5" icon="add" />
          {_l('新建规则')}
        </span>
      </div>
    );
  };

  refreshFn = () => {
    const { dispatch, isEdit, projectId } = this.props;
    if (isEdit) {
      Confirm({
        className: '',
        title: _l('你修改的设置尚未保存，确定要离开吗？'),
        okText: _l('确认'),
        buttonType: 'primary',
        cancelText: _l('取消'),
        onOk: () => {
          this.setState({ errorIds: [] });
          dispatch(getRulesAll(projectId));
          dispatch(showEditFn(false));
        },
      });
    } else {
      this.setState({ errorIds: [] });
      dispatch(showEditFn(false));
    }
  };

  expireDialogFn = () => {
    const { projectId } = this.props;
    getProjectLicenseSupportInfo({
      projectId: projectId,
    }).then(data => {
      this.setState(
        {
          licenseType: data.currentLicense.version ? data.currentLicense.version.versionId : null,
          isFree: data.licenseType === 0,
        },
        () => {
          this.setState({
            loadingProject: false,
          });
        },
      );
    });
  };

  errorCallback = errorIds => {
    this.setState({ errorIds });
  };

  render() {
    const {
      showEdit = false,
      editType,
      dispatch,
      loading,
      isEdit,
      dataByRuleId = [],
      projectId,
      ruleId,
      isSaveing,
    } = this.props;
    if (loading || this.state.loadingProject) return <LoadDiv className="mTop10" />;
    return (
      <div className="contactsHiddenBox">
        {showEdit ? (
          <div className="editCon">
            {isEdit && (
              <div>
                <Prompt when={true} message={_l('你修改的设置尚未保存，确定要离开吗？')} />
              </div>
            )}
            <div className="headerCon">
              <h5 className="Font17">
                <Icon
                  className="Font20 mRight5 Gray Hand"
                  icon="backspace"
                  onClick={() => {
                    this.refreshFn();
                  }}
                />
                {editType === rulesType[0]
                  ? _l('隐藏的成员')
                  : editType === rulesType[1]
                  ? _l('限制查看外部门')
                  : _l('限制查看所有人')}
              </h5>
              {editType === rulesType[1] && (
                <span className="Right Gray_75 Font13">{_l('规则生效范围包含所选部门的子部门')}</span>
              )}
            </div>
            <div className="conBox">
              <EditCon rulesType={rulesType} editType={rulesType[1]} errorIds={this.state.errorIds || []} />
            </div>
            <span
              className={cx('saveBtn', { disable: !isEdit || dataByRuleId.length <= 0 })}
              onClick={() => {
                if (isEdit && !isSaveing && dataByRuleId.length > 0) {
                  let data = [];
                  dataByRuleId.map(it => {
                    data.push({
                      ruleItemType: it.ruleItemType,
                      targetType: it.targetType,
                      targetId: it.targetId,
                    });
                  });
                  dispatch(saveFn(projectId, data, ruleId, this.errorCallback));
                } else {
                  return;
                }
              }}
            >
              {_l('保存')}
            </span>
          </div>
        ) : (
          <div className="con">
            <div className="headerCon">
              <h5 className="Font17">{_l('通讯录隔离')}</h5>
              <Support
                className="forHelp"
                type={2}
                href="https://help.mingdao.com/geli.html"
                text={_l('帮助')}
              />
            </div>
            <div className="conBox">
              <div className="">{this.renderCon(2)}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { contact } = state;
  return {
    ...contact,
  };
};

export default connect(mapStateToProps)(ContactsHidden);
