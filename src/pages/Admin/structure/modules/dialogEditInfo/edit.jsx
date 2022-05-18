import React, { forwardRef } from 'react';
import './edit.less';
import { Dialog, LoadDiv, Icon } from 'ming-ui';
import userController from 'src/api/user';
import Act from '../dialogInviteUser/act';
import DialogSelectDept from 'dialogSelectDept';
import DialogSelectJob from 'src/components/DialogSelectJob';
import cx from 'classnames';
import intlTelInput from '@mdfe/intl-tel-input';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import RegExp from 'src/util/expression';

const configs = [
  { key: 'fullname', label: _l('姓名'), isRequired: true },
  { key: 'mobilePhone', label: _l('手机号') },
  { key: 'email', label: _l('邮箱') },
];

const TextInput = forwardRef((props, $ref) => {
  const { label, editable = true, isRequired = false, value, placeholder, onChange, onBlur, onFocus, error } = props;
  let inputProps = {
    value,
    placeholder,
    onChange,
    onBlur,
    onFocus,
  };
  return (
    <div className="formGroup editFormGroup">
      <span className="formLabel">
        {label}
        {isRequired ? <span className="TxtMiddle Red">*</span> : null}
      </span>
      {editable ? (
        <div className="formControl">
          <input type="text" className={cx({ error })} {...inputProps} ref={$ref} />
        </div>
      ) : null}
      {props.children}
      <span
        className={cx('Block Red LineHeight25', {
          Hidden: error && error.msg,
          pTop25: !error,
        })}
      >
        {error && error.msg}
      </span>
    </div>
  );
});

const checkFuncs = {
  fullname: fullname => {
    if ($.trim(fullname) === '') {
      return {
        msg: _l('姓名不能为空'),
      };
    }
  },
  email: email => {
    if (!email) return;
    if (!RegExp.isEmail(email)) {
      return {
        msg: _l('邮箱格式错误'),
      };
    }
  },
  mobilePhone: ([value, input, iti]) => {
    if (value && iti) {
      if (!(input && iti.isValidNumber())) {
        return {
          msg: _l('手机号格式错误'),
        };
      }
    }
  },
};

class EditInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      companyName: '',
      jobNumber: '',
      contactPhone: '',
      fullname: '',
      email: '',
      mobilePhone: '',
      departmentInfos: [], //部门信息
      isShowAct: false,
      idAct: '',
      jobInfos: [], //职位信息
      isShowJobList: false,
      jobs: [],
      isLoading: true,
      workSiteId: '',
      errors: {},
    };
    this.handleFieldBlur = this.handleFieldBlur.bind(this);
    this.handleFieldInput = this.handleFieldInput.bind(this);
    this.clearError = this.clearError.bind(this);
  }

  componentDidMount() {
    this.getUserData();
    this.itiFn();
  }

  componentDidUpdate() {
    !this.iti && this.itiFn();
  }

  componentWillUnmount() {
    this.iti && this.iti.destroy();
  }

  itiFn = () => {
    if (this.$refs.mobilePhone) {
      this.iti = intlTelInput(this.$refs.mobilePhone, {
        customPlaceholder: '',
        autoPlaceholder: 'off',
        initialCountry: 'cn',
        loadUtils: '',
        preferredCountries: ['cn'],
        utilsScript: utils,
        separateDialCode: true,
      });
    }
  };

  getUserData = () => {
    if (!this.state.isLoading) {
      this.state({
        isLoading: true,
      });
    }
    userController
      .getUserCard({
        accountId: this.props.accountId,
        projectId: this.props.projectId,
        setAcountPravite: false,
      })
      .then(
        data => {
          let { user = {}, workSites = [], jobs = [] } = data;
          this.setState(
            {
              isLoading: false,
              fullname: user.fullname || '',
              mobilePhone: user.mobilePhone || '',
              email: user.email || '',
              companyName: user.companyName || '',
              departmentInfos: user.departmentInfos || [], //部门信息
              jobInfos: user.jobInfos || [], //职位信息
              jobNumber: user.jobNumber || '',
              contactPhone: user.contactPhone || '',
              workSiteId: user.workSiteId,
              jobs: jobs || [],
              // idAct: user.departmentInfos && user.departmentInfos.length > 0 ? user.departmentInfos[0].departmentId : ''
            },
            () => {
              let list = [];
              if (workSites.length > 0) {
                list = JSON.parse(
                  JSON.stringify(workSites)
                    .replace(/workSiteId/g, 'id')
                    .replace(/workSiteName/g, 'name'),
                );
              }
              $(this.workSiteInput).MDSelect({
                defualtSelectedValue: this.state.workSiteId,
                dataArr: list,
                showType: 4,
                defaultOptionText: _l('请选择'),
                onChange: value => {
                  this.setState({
                    workSiteId: value,
                  });
                },
              });
            },
          );
        },
        () => {
          // dfd.reject();
        },
      );
    // return dfd.promise();
  };

  clearError(field) {
    return () => {
      const { errors } = this.state;
      delete errors[field];
      this.setState({ errors });
    };
  }

  handleFieldInput(field) {
    return e => {
      this.setState({
        [field]: field === 'mobilePhone' ? this.iti.getNumber() : e.target.value,
      });
    };
  }

  handleFieldBlur(field) {
    return e => {
      let value;
      if (typeof e !== 'undefined') {
        value = field === 'mobilePhone' ? [this.iti.getNumber(), this.$refs.mobilePhone, this.iti] : e.target.value;
      } else {
        value = field === 'mobilePhone' ? [this.iti.getNumber(), this.$refs.mobilePhone, this.iti] : this.state[field];
      }
      const errors = this.state.errors || {};
      const checkResult = checkFuncs[field](value);
      if (checkResult) {
        errors[field] = checkResult;
      }
      this.setState({
        errors: errors,
      });
    };
  }

  saveFn = fn => {
    if (!(this.state.email || this.state.mobilePhone)) {
      alert(_l('请输入手机号或邮箱'), 3);
      return false;
    }
    if (this.state.errors && _.keys(this.state.errors).length) {
      return false;
    }
    userController
      .updateUser({
        projectId: this.props.projectId,
        accountId: this.props.accountId,
        companyName: this.state.companyName,
        // departmentInfos: this.state.departmentInfos,
        jobIds: this.state.jobInfos.map(it => it.jobId),
        departmentIds: this.state.departmentInfos.map(it => it.departmentId),
        // jobInfos: this.state.jobInfos,
        jobNumber: this.state.jobNumber,
        contactPhone: this.state.contactPhone,
        workSiteId: this.state.workSiteId,
        fullname: this.state.fullname,
        mobilePhone: this.state.mobilePhone,
        email: this.state.email,
      })
      .then(
        function (result) {
          if (result === 1) {
            // options.callback.call(null, userObj);
            fn({
              showDialog: false,
              isOk: true,
            });
            alert(_l('修改成功'), 1);
          } else {
            alert(_l('保存失败'), 2);
          }
        },
        function () {
          alert(_l('保存失败'), 2);
        },
      )
      .always(function () {
        // _this.dialog.enable();
      });
    return false;
  };

  // 添加部门
  dialogSelectDeptFn = e => {
    const { projectId, departmentId } = this.props;
    const { departmentInfos } = this.state;
    const _this = this;
    new DialogSelectDept({
      projectId,
      unique: false,
      selectedDepartment: departmentInfos,
      showCreateBtn: false,
      selectFn(departments) {
        _this.setState({
          departmentInfos: departments,
        });
      },
    });
  };
  // 添加职位
  dialogSelectJobFn = e => {
    const { projectId } = this.props;
    const { jobInfos } = this.state;
    new DialogSelectJob({
      projectId,
      onSave: data => {
        const jobIds = jobInfos.map(job => job.jobId);

        this.setState({
          jobInfos: jobInfos.concat(data.filter(o => jobIds.indexOf(o.jobId) === -1)),
          // idAct: data[0].departmentId
        });
      },
    });
  };
  $refs = {};
  onBlur = e => {
    let { contactPhone } = this.state;
    let tel = e && e.target && e.target.value;
    console.log(tel, contactPhone, !RegExp.isTel(tel));
    if (!tel) return;
    if (!RegExp.isTel(tel) && !RegExp.isMobile(tel)) {
      this.setState({ contactPhoneError: true });
    } else {
      this.setState({ contactPhoneError: false });
    }
  };

  render() {
    const { departmentInfos, jobInfos, jobs, jobNumber, contactPhone, isLoading, contactPhoneError, errors } =
      this.state;
    return (
      <Dialog
        title={_l('编辑员工名片')}
        okText={_l('保存')}
        cancelText={_l('取消')}
        className="dialogSetEdit"
        // size={'large'}
        onCancel={() => {
          this.props.setValue({
            showDialog: false,
          });
        }}
        onOk={() => {
          if (this.state.contactPhoneError) return;
          this.saveFn(this.props.setValue);
        }}
        visible={this.props.showDialog}
      >
        {isLoading ? (
          <LoadDiv />
        ) : (
          <div className="formTable">
            {configs.map(con => {
              let value = this.state[con.key];
              if (con.key === 'mobilePhone' && this.iti) {
                const countryData = this.iti.getSelectedCountryData();
                const dialCode = `+${countryData.dialCode}`;
                value = (value || '').replace(dialCode, '');
              }
              return (
                <TextInput
                  ref={input => {
                    this.$refs[con.key] = input;
                  }}
                  value={value}
                  label={con.label}
                  isRequired={con.isRequired}
                  placeholder={_l('请输入%0', con.label)}
                  onFocus={this.clearError(con.key)}
                  onChange={this.handleFieldInput(con.key)}
                  onBlur={this.handleFieldBlur(con.key)}
                  error={errors[con.key]}
                  key={con.key}
                />
              );
            })}
            <div className="formGroup editFormGroup">
              <span className="formLabel mTop5">{_l('组织')}</span>
              <div className="formControl">
                <input
                  type="text"
                  className="inputBox txtCompanyName"
                  value={this.state.companyName}
                  placeholder={_l('组织名称')}
                  onChange={e => {
                    this.setState({
                      companyName: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="formGroup">
              <span className="formLabel">{_l('部门')}</span>
              {departmentInfos.map((item, i) => {
                return (
                  <span className="itemSpan mAll5">
                    {item.departmentName}
                    {i === 0 && <span className="isTopIcon">主</span>}
                    <div className="moreOption">
                      <Icon
                        className="Font14 Hand Gray_bd"
                        icon="moreop"
                        onClick={e => {
                          this.setState(
                            {
                              isShowAct: !this.state.isShowAct,
                            },
                            () => {
                              if (this.state.isShowAct) {
                                this.setState({
                                  idAct: item.departmentId,
                                });
                              }
                            },
                          );
                        }}
                      />
                      {this.state.isShowAct && this.state.idAct === item.departmentId && (
                        <Act
                          onClickAwayExceptions={[]}
                          onClickAway={() =>
                            this.setState({
                              isShowAct: false,
                              idAct: '',
                            })
                          }
                          isPosition={false}
                          isTop={i === 0}
                          deleteFn={() => {
                            let list = departmentInfos.filter(it => it.departmentId !== item.departmentId) || [];
                            this.setState({
                              isShowAct: false,
                              idAct: '',
                              departmentInfos: list,
                            });
                          }}
                          setToTop={() => {
                            let list = departmentInfos.filter(it => it.departmentId !== item.departmentId);
                            let data = departmentInfos.find(it => it.departmentId === item.departmentId);
                            list.unshift(data);
                            this.setState({
                              isShowAct: false,
                              idAct: '',
                              departmentInfos: list,
                            });
                          }}
                          isShowAct={this.state.isShowAct}
                        />
                      )}
                    </div>
                  </span>
                );
              })}
              <Icon
                className="Font26 Hand Gray_9e mAll5 TxtMiddle"
                icon="task_add-02"
                onClick={e => this.dialogSelectDeptFn(e)}
              />
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('职位')}</span>
              <div className="jobBox">
                {_.map(jobInfos, item => {
                  return (
                    <span className="itemSpan mAll5">
                      {item.jobName}
                      <div className="moreOption">
                        <Icon
                          className="Font14 Hand Gray_bd"
                          icon="moreop"
                          onClick={e => {
                            this.setState(
                              {
                                isShowAct: !this.state.isShowAct,
                              },
                              () => {
                                if (this.state.isShowAct) {
                                  this.setState({
                                    idAct: item.jobId,
                                  });
                                }
                              },
                            );
                          }}
                        />
                        {this.state.isShowAct && this.state.idAct === item.jobId && (
                          <Act
                            onClickAwayExceptions={[]}
                            onClickAway={() =>
                              this.setState({
                                isShowAct: false,
                                idAct: '',
                              })
                            }
                            isPosition={true}
                            isTop={false}
                            deleteFn={() => {
                              this.setState({
                                isShowAct: false,
                                idAct: '',
                                jobInfos: this.state.jobInfos.filter(it => it.jobId !== item.jobId),
                              });
                            }}
                            isShowAct={this.state.isShowAct}
                          />
                        )}
                      </div>
                    </span>
                  );
                })}
                <span className="jobChooseIcon Relative">
                  {/* <Icon className="Font26 Hand Gray_9e mAll5 TxtMiddle" icon="task_add-02" onClick={(e) => {
                  this.setState({
                    isShowJobList: !this.state.isShowJobList
                  })
                }} /> */}
                  <Icon
                    className="Font26 Hand Gray_9e mAll5 TxtMiddle"
                    icon="task_add-02"
                    onClick={e => this.dialogSelectJobFn(e)}
                  />
                  {/* {jobs.length <= 0 && <React.Fragment>
                  <Icon className="Font26 Hand Gray_9e mAll5 TxtMiddle Red" icon="task-folder-message" />
                  <span className='Red'>{_l('尚未配置职位')}</span>
                   <span className='Gray_75'>{_l('前往创建')}</span>
                </React.Fragment>} */}
                  {/* {this.state.isShowJobList && <JobDia
                  onClickAway={() => this.setState({
                    isShowJobList: false,
                  })}
                  jobs={jobs} isShowJobList={this.state.isShowJobList} setValue={(it) => {
                    let list = this.state.jobInfos.filter(item => item.jobId === it.jobId)
                    if (list && list.length > 0) {
                      this.setState({
                        isShowJobList: false,
                      })
                    } else {
                      this.setState({
                        jobInfos: this.state.jobInfos.concat(it),
                        isShowJobList: false,
                      })
                    }
                  }} />} */}
                </span>
              </div>
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('工作地点')}</span>
              <div className="formControl">
                <div className="workSiteBox">
                  <input type="hidden" ref={input => (this.workSiteInput = input)} />
                </div>
              </div>
            </div>
            <div className="formGroup">
              <span className="formLabel mTop5">{_l('工号')}</span>
              <div className="formControl">
                <input
                  value={jobNumber}
                  placeholder={_l('')}
                  onChange={e => {
                    this.setState({
                      jobNumber: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="formGroup">
              <span className="formLabel">{_l('工作电话')}</span>
              <div className="formControl">
                <input
                  value={contactPhone}
                  maxLength="32"
                  placeholder={_l('')}
                  onBlur={this.onBlur}
                  className={cx({ error: contactPhoneError })}
                  onChange={e => {
                    this.setState({
                      contactPhone: e.target.value,
                    });
                  }}
                />
              </div>
              {contactPhoneError && <span className="Block Red LineHeight25">{_l('工作电话格式不正确')}</span>}
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}

export default EditInfo;
