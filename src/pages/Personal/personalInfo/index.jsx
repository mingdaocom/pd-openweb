import React, { Fragment } from 'react';
import DialogLayer from 'mdDialog';
import ReactDom from 'react-dom';
import UserLevel from './modules/UserLevel';
import AvatorInfo from './modules/AvatorInfo';
import CosLog from './modules/CosLog';
import PointList from './modules/PointList';
import EditDetail from './modules/EditDetail';
import EditInfo from './modules/EditInfo';
import AddOrEditItem from './modules/AddOrEditItem';
import ViewEmblem from './modules/ViewEmblem';
import SendEmblem from './modules/SendEmblem';
import { Tooltip, LoadDiv } from 'ming-ui';
import { Progress } from 'antd';
import account from 'src/api/account';
import './index.less';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { formatFileSize } from 'src/util';

const detailList = [
  { label: _l('生日'), key: 'birthdate', filter: 'transFromDate' },
  { label: _l('性别'), key: 'gender', filter: 'transFormGender' },
  { label: _l('职位'), key: 'profession' },
];

const infoList = [
  { label: _l('邮箱'), key: 'email' },
  { label: _l('手机'), key: 'mobilePhone' },
];

const {
  personal: {
    personalInfo: { personalEmblem },
  },
} = window.private;

export default class PersonalInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountInfo: {}, //头部图像
      baseDetail: {}, //详细资料
      concatInfo: {}, //联系信息
      accountMedal: [], //徽章
      educationList: [],
      workList: [],
      dataPlan: 0,
      dataUsage: 0,
      percent: 0,
      loading: false,
      operateMenuVisible: false,
      editFullName: false, //编辑姓名
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ loading: true });
    $.when(this.getUserInfo(), this.getConcatInfo(), this.getEducation(), this.getWorkList()).then(
      (user, concatInfo, education, work) => {
        this.setState({
          accountInfo: user.accountInfo,
          accountMedal: user.accountMedal,
          dataPlan: user.dataPlan,
          dataUsage: user.dataUsage,
          percent: user.dataUsage ? (user.dataUsage / user.dataPlan) * 100 : 0,
          baseDetail: user.accountInfo,
          concatInfo,
          educationList: education.list,
          workList: work.list,
          loading: false,
        });
      },
    );
  }

  //头像和徽章
  getUserInfo() {
    return account.getAccountListInfo({});
  }

  //联系信息
  getConcatInfo() {
    return account.getContactInfo({});
  }

  //教育经历
  getEducation() {
    return account.getAccountDetail({
      type: 2,
    });
  }

  //工作履历
  getWorkList() {
    return account.getAccountDetail({
      type: 1,
    });
  }

  detailItem = (item, valueType) => {
    const detail = this.state[valueType] || {};
    return (
      <div className="mBottom10" key={item.key}>
        <span className="Gray_75 itemLabel">{item.label}</span>
        <span className="Gray">
          {detail[item.key] ? (item.filter ? this[item.filter](detail[item.key]) : detail[item.key]) : _l('未填写')}
        </span>
      </div>
    );
  };

  transFromDate(value) {
    return value && value.split(' ')[0];
  }

  transFormGender(value) {
    const genderObj = { 1: _l('男'), 2: _l('女') };
    return genderObj[value];
  }

  //账户信息
  renderAccountInfo() {
    const { accountInfo, dataUsage, dataPlan, percent } = this.state;
    return (
      <div className="flexRow">
        <div className="detailContainer pTop0 pBottom0">
          <div className="flexCenter">
            <span className="Gray_75 itemLabel">{_l('当前版本')}</span>
            {accountInfo.accountType == 0 ? (
              <span className="freeTag">{_l('免费版')}</span>
            ) : (
              <Fragment>
                <span className="accountTag">{_l('付费版')}</span>
                <span className="Gray_9e mLeft10 mRight5">{_l('剩余 %0 天', accountInfo.expireDays)}</span>
                <Tooltip popupPlacement="top" text={<span>{_l('到期时间：根据您所在组织最晚到期时间为准。')}</span>}>
                  <span className="icon-novice-circle Font15 Gray_bd mLeft2 Hand"></span>
                </Tooltip>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }

  //详细资料
  renderDetail() {
    return (
      <div className="detailContainer">
        <div className="Font15 Bold Gray mBottom16">{_l('详细资料')}</div>
        {detailList.map(item => {
          return this.detailItem(item, 'baseDetail');
        })}
        <div>
          <span className="itemLabel"></span>
          <button
            type="button"
            className="ming Button Button--link ThemeColor3 Hover_49"
            onClick={this.handleEditDetail.bind(this)}
          >
            {_l('编辑')}
          </button>
        </div>
      </div>
    );
  }

  //编辑详细资料
  handleEditDetail() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('编辑个人资料'),
      },
      dialogBoxID: 'editDetailDialogId',
      width: '480px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <EditDetail
          baseInfo={this.state.baseDetail}
          closeDialog={() => {
            $('#editDetailDialogId_container,#editDetailDialogId_mask').remove();
          }}
          updateValue={baseDetail => {
            this.setState({ baseDetail });
          }}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //联系信息
  renderInfo() {
    return (
      <div className="infoContainer">
        <div className="Font15 Bold Gray mBottom16">{_l('联系信息')}</div>
        {infoList.map(item => {
          return this.detailItem(item, 'concatInfo');
        })}
        <div>
          <span className="itemLabel"></span>
          <button
            type="button"
            className="ming Button Button--link ThemeColor3 Hover_49"
            onClick={this.handleEditInfo.bind(this)}
          >
            {_l('编辑')}
          </button>
        </div>
      </div>
    );
  }

  //编辑联系信息
  handleEditInfo() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('编辑联系信息'),
      },
      dialogBoxID: 'editInfoDialogId',
      width: '480px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <EditInfo
          baseInfo={this.state.concatInfo}
          closeDialog={() => {
            $('#editInfoDialogId_container,#editInfoDialogId_mask').remove();
          }}
          updateValue={concatInfo => {
            this.setState({ concatInfo });
          }}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //教育经历
  renderEdu() {
    const { educationList } = this.state;
    return (
      <Fragment>
        {educationList.map((item, index) => {
          return this.getEduOrWorkItem(2, item);
        })}
      </Fragment>
    );
  }

  //工作经历
  renderWork() {
    const { workList } = this.state;
    return (
      <Fragment>
        {workList.map((item, index) => {
          return this.getEduOrWorkItem(1, item);
        })}
      </Fragment>
    );
  }

  getEduOrWorkItem(type, item) {
    return (
      <div className="eduOrWorkItemBox" key={item.autoId}>
        <div className="itemHeader">
          <div className="itemName overflow_ellipsis Bold Gray">{item.name}</div>
          <div className="Gray_9e itemDate">{_l('%0 至 %1', item.startDate, item.endDate)}</div>
          <div className="itemOption">
            <span className="ThemeColor3 Hover_49 mRight24" onClick={() => this.handleAddOrEditItem(type, item)}>
              <span className="mLeft6 icon-edit_17"></span>
              <span>{_l('编辑')}</span>
            </span>
            <span className="ThemeColor3 Hover_49 mRight24" onClick={() => this.handleDeleteItem(type, item.autoId)}>
              <span className="mLeft6 icon-delete_12"></span>
              <span>{_l('删除')}</span>
            </span>
          </div>
        </div>
        {item.title && <div className="LineHeight20 Gray_9e flexWrap">{item.title}</div>}
        {item.description && <div className="LineHeight20 Gray_9e flexWrap">{item.description}</div>}
      </div>
    );
  }

  //添加或者编辑教育经历---工作履历
  //type: work(1) | education(2)
  //data: list([]) | listItem({})
  handleAddOrEditItem(type, data) {
    const headerType = _.isArray(data) ? _l('添加') : _l('编辑');
    const headerContent = type === 1 ? _l('工作履历') : _l('教育经历');
    const _header = `${headerType}${headerContent} `;
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _header,
      },
      dialogBoxID: 'addOrEditItemDialogId',
      width: '480px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <AddOrEditItem
          item={data}
          type={type}
          closeDialog={() => {
            $('#addOrEditItemDialogId_container,#addOrEditItemDialogId_mask').remove();
          }}
          updateValue={() => {
            const actionType = type === 1 ? 'getWorkList' : 'getEducation';
            const key = type === 1 ? 'workList' : 'educationList';
            $.when(this[actionType]()).then(user => {
              this.setState({ [key]: user.list });
            });
          }}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  handleDeleteItem(type, id) {
    if (confirm(_l('确认删除') + '?')) {
      account
        .delAccountDetail({
          autoId: id,
          detailType: type,
        })
        .then(data => {
          if (data) {
            const key = type === 1 ? 'workList' : 'educationList';
            const tempArr = this.state[key] || [];
            this.setState({
              [key]: tempArr.filter(x => x.autoId !== id),
            });
            alert(_l('删除成功'), 1);
          } else {
            alert(_l('删除失败'), 2);
          }
        })
        .fail();
    }
  }

  //我的徽章
  renderEmblem() {
    const { accountMedal = [], operateMenuVisible } = this.state;
    const optionList = () => (
      <div className="optionListBadges">
        <div
          className="optionListItem"
          onClick={() => {
            this.handleViewEmblem();
            this.setState({ operateMenuVisible: false });
          }}
        >
          {_l('我的所有徽章')}
        </div>
        <div
          className="optionListItem"
          onClick={() => {
            this.handleSendEmblem();
            this.setState({ operateMenuVisible: false });
          }}
        >
          {_l('赠送徽章')}
        </div>
      </div>
    );
    return (
      <div className="myAcquireBadges">
        {accountMedal.map(item => {
          return (
            <Tooltip popupPlacement="top" text={<span>{item.medalName}</span>}>
              <div className="badgeItem Hand">
                <img src={item.smallPath} />
                <div className="myBadgeCount">
                  <span>{item.count}</span>
                </div>
              </div>
            </Tooltip>
          );
        })}
        <Trigger
          popupVisible={operateMenuVisible}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
          }}
          popup={optionList()}
          onPopupVisibleChange={visible => this.setState({ operateMenuVisible: visible })}
        >
          <div className="moreBadges Hand mTop10 mLeft8">
            <span className="icon-more_horiz Font18 Gray LineHeight28 Hover_49"></span>
          </div>
        </Trigger>
      </div>
    );
  }

  //查看徽章
  handleViewEmblem() {
    const { accountMedal = [] } = this.state;
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('我的徽章'),
        noFn: () => {
          if (
            this.viewEmblemRef.state.showIds.sort().join('') !==
            accountMedal
              .map(x => x.medalId)
              .sort()
              .join('')
          ) {
            this.getUserInfo().then(user => {
              this.setState({
                accountMedal: user.accountMedal,
              });
            });
          }
        },
      },
      dialogBoxID: 'viewEmblemDialogId',
      width: '960px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <ViewEmblem ref={con => (this.viewEmblemRef = con)} />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //赠送徽章
  handleSendEmblem() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('我要赠送徽章'),
      },
      dialogBoxID: 'sendEmblemDialogId',
      width: '770px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <SendEmblem
          closeDialog={() => {
            $('#sendEmblemDialogId_container,#sendEmblemDialogId_mask').remove();
          }}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //查看等级
  handleLevel() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('级别'),
      },
      dialogBoxID: 'levelDialogId',
      width: '320px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <UserLevel />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //查看积分
  handleCosLog() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: null,
      },
      dialogBoxID: 'coslogDialogId',
      width: '750px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <CosLog />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //查看积分提醒
  handlePoint() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: null,
      },
      dialogBoxID: 'pointDialogId',
      width: '850px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <PointList />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //上传头像
  handleUploadImg() {
    const options = {
      container: {
        content: '',
        yesText: null,
        noText: null,
        header: _l('上传头像'),
      },
      dialogBoxID: 'uploadAvatorDialogId',
      width: '460px',
      height: '365px',
    };
    ReactDom.render(
      <DialogLayer {...options}>
        <AvatorInfo
          avatar={this.state.accountInfo.avatarBig}
          closeDialog={() => {
            $('#uploadAvatorDialogId_container,#uploadAvatorDialogId_mask').remove();
          }}
          updateAvator={() => {
            $.when(this.getUserInfo()).then(user => {
              this.setState({ accountInfo: user.accountInfo });
            });
          }}
        />
      </DialogLayer>,
      document.createElement('div'),
    );
  }

  //修改姓名
  setFullName() {
    account
      .editAccountBasicInfo(this.state.baseDetail)
      .then(data => {
        if (data) {
          this.setState({ editFullName: false });
        } else {
          this.setState({ editFullName: false });
        }
      })
      .fail();
  }

  render() {
    const { accountInfo, loading, educationList, workList, baseDetail, editFullName } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <div className="personalInfoContainer">
        <div className="personalTop">
          <div className="accountHeadBox">
            <div className="userImage" onClick={this.handleUploadImg.bind(this)}>
              <img src={accountInfo.avatarBig} alt="" />
              <div className="hoverAvatar">
                <span className="Font20 icon-upload_pictures"></span>
              </div>
            </div>
            <div className="userInfoRight mLeft25">
              <div className="Gray Font17 overflow_ellipsis LineHeight32">
                {editFullName ? (
                  <input
                    className="editfullNameInput"
                    autofocus="autofocus"
                    value={baseDetail.fullname}
                    onChange={e => this.setState({ baseDetail: { ...baseDetail, fullname: e.target.value } })}
                    onKeyDown={evt => {
                      if (evt.keyCode === 13) {
                        this.setFullName();
                      }
                    }}
                    onBlur={() => this.setFullName()}
                  />
                ) : (
                  <span>
                    {baseDetail.fullname}
                    <Tooltip popupPlacement="top" text={<span>{_l('编辑姓名')}</span>}>
                      <span
                        className="Font15 Hand Hover_49 Gray_bd mLeft10 icon-create"
                        onClick={() =>
                          this.setState({ editFullName: true }, () => {
                            $('.editfullNameInput').focus();
                          })
                        }
                      ></span>
                    </Tooltip>
                  </span>
                )}
              </div>
              <div className="mTop10 Gray">
                <label>
                  {_l('等级：')}
                  <span className="mLeft5 ThemeColor3 Hand Hover_49" onClick={this.handleLevel.bind(this)}>
                    {accountInfo.grade}
                  </span>
                </label>
                <label className="mLeft32">
                  {_l('积分：')}
                  <span className="mLeft5 mRight5 ThemeColor3 Hand Hover_49" onClick={this.handleCosLog.bind(this)}>
                    {accountInfo.mark}
                  </span>
                  <Tooltip popupPlacement="top" text={<span>{_l('等级积分只增不减，可用积分有增有减')}</span>}>
                    <span
                      className="icon-novice-circle Gray_bd Hand Font15"
                      onClick={this.handlePoint.bind(this)}
                    ></span>
                  </Tooltip>
                </label>
                <label className="mLeft32">
                  {_l('使用：')}
                  <span className="mLeft5 ThemeColor3">{_l('%0 天', accountInfo.loginDays)}</span>
                </label>
              </div>
            </div>
          </div>
          {/** 徽章 */}
          <div className={cx('personalEmblem', { Hidden: personalEmblem })}>
            <div className="Gray">{_l('我的徽章')}</div>
            {this.renderEmblem()}
          </div>
        </div>
        {/** 账户信息
        <div className="w100 pTop40">
          <div className="Font15 Bold Gray mBottom16">{_l('账户资料')}</div>
          {this.renderAccountInfo()}
        </div> */}
        {/**详细资料---联系信息 */}
        <div className="flexRow w100">
          {this.renderDetail()}
          {this.renderInfo()}
        </div>
        {/**教育经历 */}
        <div className="mBottom40">
          <div className="Font15 Bold Gray mBottom16">{_l('教育经历')}</div>
          {this.renderEdu()}
          <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleAddOrEditItem(2, educationList)}>
            {_l('添加')}
          </span>
        </div>
        {/**工作履历 */}
        <div>
          <div className="Font15 Bold Gray mBottom16">{_l('工作履历')}</div>
          {this.renderWork()}
          <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleAddOrEditItem(1, workList)}>
            {_l('添加')}
          </span>
        </div>
      </div>
    );
  }
}
