import React, { Fragment } from 'react';
import AvatorInfo from './modules/AvatorInfo';
import EditDetail from './modules/EditDetail';
import EditInfo from './modules/EditInfo';
import AddOrEditItem from './modules/AddOrEditItem';
import { Tooltip, LoadDiv, Dialog } from 'ming-ui';
import account from 'src/api/account';
import './index.less';
import fixedDataAjax from 'src/api/fixedData.js';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';

const detailList = [
  { label: _l('生日'), key: 'birthdate', filter: 'transFromDate' },
  { label: _l('性别'), key: 'gender', filter: 'transFormGender' },
  { label: _l('职位'), key: 'profession' },
];

const infoList = [
  { label: _l('邮箱'), key: 'email' },
  { label: _l('手机'), key: 'mobilePhone' },
];

export default class PersonalInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountInfo: {}, //头部图像
      baseDetail: {}, //详细资料
      concatInfo: {}, //联系信息
      educationList: [],
      workList: [],
      dataPlan: 0,
      dataUsage: 0,
      percent: 0,
      loading: false,
      operateMenuVisible: false,
      editFullName: false, //编辑姓名
      isErr: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ loading: true });
    Promise.all([this.getUserInfo(), this.getConcatInfo(), this.getEducation(), this.getWorkList()]).then(
      ([user, concatInfo, education, work]) => {
        this.setState({
          accountInfo: user.accountInfo,
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
                  <span className="icon-novice-circle Font15 Gray_bd mLeft2 Hand" />
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
          <span className="itemLabel" />
          <button
            type="button"
            className="ming Button Button--link ThemeColor3 Hover_49"
            onClick={this.handleEditDetail.bind(this)}
          >
            {_l('更多')}
          </button>
        </div>
      </div>
    );
  }

  //编辑详细资料
  handleEditDetail() {
    Dialog.confirm({
      title: _l('编辑个人资料'),
      dialogClasses: 'editDetailDialog',
      noFooter: true,
      children: (
        <EditDetail
          baseInfo={this.state.baseDetail}
          closeDialog={() => {
            $('.editDetailDialog.mui-dialog-container').parent().remove();
          }}
          updateValue={baseDetail => {
            this.setState({ baseDetail });
          }}
        />
      ),
    });
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
          <span className="itemLabel" />
          <button
            type="button"
            className="ming Button Button--link ThemeColor3 Hover_49"
            onClick={this.handleEditInfo.bind(this)}
          >
            {_l('更多')}
          </button>
        </div>
      </div>
    );
  }

  //编辑联系信息
  handleEditInfo() {
    Dialog.confirm({
      title: _l('编辑联系信息'),
      dialogClasses: 'editInfoDialog',
      noFooter: true,
      children: (
        <EditInfo
          baseInfo={this.state.concatInfo}
          closeDialog={() => {
            $('.editInfoDialog.mui-dialog-container').parent().remove();
          }}
          updateValue={concatInfo => {
            this.setState({ concatInfo });
          }}
        />
      ),
    });
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
    const endTime = moment().format('YYYY-MM-DD') === item.endDate ? _l('至今') : item.endDate;

    return (
      <div className="eduOrWorkItemBox" key={item.autoId}>
        <div className="itemHeader">
          <div className="itemName overflow_ellipsis Bold Gray">{item.name}</div>
          <div className="Gray_9e itemDate">{_l('%0 至 %1', item.startDate, endTime)}</div>
          <div className="itemOption">
            <span className="ThemeColor3 Hover_49 mRight24" onClick={() => this.handleAddOrEditItem(type, item)}>
              <span className="mLeft6 icon-edit_17" />
              <span>{_l('编辑')}</span>
            </span>
            <span className="ThemeColor3 Hover_49 mRight24" onClick={() => this.handleDeleteItem(type, item.autoId)}>
              <span className="mLeft6 icon-delete_12" />
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
    Dialog.confirm({
      title: `${_.isArray(data) ? _l('添加') : _l('编辑')}${type === 1 ? _l('工作履历') : _l('教育经历')} `,
      dialogClasses: 'addOrEditItemDialog',
      noFooter: true,
      children: (
        <AddOrEditItem
          item={data}
          type={type}
          closeDialog={() => {
            $('.addOrEditItemDialog.mui-dialog-container').parent().remove();
          }}
          updateValue={() => {
            const actionType = type === 1 ? 'getWorkList' : 'getEducation';
            const key = type === 1 ? 'workList' : 'educationList';

            this[actionType]().then(user => {
              this.setState({ [key]: user.list });
            });
          }}
        />
      ),
    });
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
        .catch();
    }
  }

  //上传头像
  handleUploadImg() {
    Dialog.confirm({
      title: _l('上传头像'),
      dialogClasses: 'uploadAvatorDialog',
      noFooter: true,
      children: (
        <AvatorInfo
          avatar={this.state.accountInfo.avatarBig}
          closeDialog={() => {
            $('.uploadAvatorDialog.mui-dialog-container').parent().remove();
          }}
          updateAvator={() => {
            this.getUserInfo().then(user => {
              this.setState({ accountInfo: user.accountInfo });
            });
          }}
        />
      ),
    });
  }

  //修改姓名
  setFullName() {
    const { fullname } = this.state.baseDetail;
    fixedDataAjax.checkSensitive({ content: fullname }).then(res => {
      if (res) {
        this.setState({
          isErr: true,
        });
        return alert(_l('输入内容包含敏感词，请重新填写'), 3);
      } else {
        this.setState({
          isErr: false,
        });
        account
          .editAccountBasicInfo(this.state.baseDetail)
          .then(data => {
            if (data) {
              this.setState({ editFullName: false });
            } else {
              this.setState({ editFullName: false });
            }
          })
          .catch();
      }
    });
  }

  render() {
    const { accountInfo, loading, educationList, workList, baseDetail, editFullName, isErr } = this.state;
    if (loading) {
      return <LoadDiv className="mTop40" />;
    }
    return (
      <div className="personalInfoContainer">
        <div className="personalTop">
          <div className="accountHeadBox">
            <div className="userImage" onClick={this.handleUploadImg.bind(this)}>
              <img src={accountInfo.avatarBig} alt="" />
              <div className="hoverAvatar">
                <span className="Font20 icon-upload_pictures" />
              </div>
            </div>
            <div className="userInfoRight mLeft25">
              <div className="Gray Font17 overflow_ellipsis LineHeight32">
                {editFullName ? (
                  <input
                    className={cx('editfullNameInput', { isErr })}
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
                    {md.global.SysSettings.enableEditAccountInfo && (
                      <Tooltip popupPlacement="top" text={<span>{_l('编辑姓名')}</span>}>
                        <span
                          className="Font15 Hand Hover_49 Gray_bd mLeft10 icon-create"
                          onClick={() =>
                            this.setState({ editFullName: true }, () => {
                              $('.editfullNameInput').focus();
                            })
                          }
                        />
                      </Tooltip>
                    )}
                  </span>
                )}
              </div>
              <div className="mTop10 Gray">
                <label>
                  {_l('使用：')}
                  <span className="mLeft5 ThemeColor3">{_l('%0 天', accountInfo.loginDays)}</span>
                </label>
              </div>
            </div>
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
