import React from 'react';
import _ from 'lodash';
import { Input, Modal } from 'ming-ui/antd-components';
import fixedDataAjax from 'src/api/fixedData.js';
import jobAjax from 'src/api/job';
import './dialogCreateAndEditRole.less';

class DialogCreateAndEditPosition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jobName: props.filed === 'edit' ? props.currentPosition.jobName : '',
    };
    this.requestPending = false;
  }

  handleSubmit = () => {
    const { filed, positionList, projectId, currentPosition } = this.props;
    let jobName = this.state.jobName.trim();

    fixedDataAjax.checkSensitive({ content: jobName }).then(res => {
      if (res) {
        this.setState({ submitLoading: false });
        return alert(_l('输入内容包含敏感词，请重新填写'), 3);
      }

      if (filed === 'edit') {
        jobAjax
          .editJobName({ jobName: jobName, projectId, jobId: currentPosition.jobId })
          .then(res => {
            if (res) {
              alert(_l('修改成功'));
              let roleInfo = { ...currentPosition, jobName };
              this.props.updateCurrentPosition(roleInfo);
              let list = positionList.map(it => {
                if (it.jobId === currentPosition.jobId) {
                  return { ...it, jobName };
                }

                return it;
              });
              this.props.updatePositionList(list);
            } else {
              alert(_l('修改失败'), 2);
            }

            this.props.onCancel();
            this.setState({ submitLoading: false });
          })
          .catch(() => {
            this.setState({ submitLoading: false });
          });
      } else {
        jobAjax
          .addJob({ jobName: jobName, projectId })
          .then(res => {
            if (res) {
              alert(_l('创建成功'));
              let roleInfo = (positionList && !_.isEmpty(positionList) && positionList[0]) || {};
              this.props.updateCurrentPosition(roleInfo);
              this.props.getPositionList();
            } else {
              alert(_l('创建失败'), 2);
            }

            this.props.onCancel();
            this.setState({ submitLoading: false });
          })
          .catch(() => {
            this.setState({ submitLoading: false });
          });
      }
    });
  };

  handleOk = () => {
    const { positionList } = this.props;
    const { exsistCurrentName, submitLoading } = this.state;
    const jobName = this.state.jobName.trim();

    if (!jobName) {
      alert(_l('请输入职位名称'), 3);
    } else if (exsistCurrentName || submitLoading) {
      return;
    } else if (positionList.find(it => it.jobName === jobName)) {
      alert(_l('该职位名称已存在'), 3);
      this.setState({ exsistCurrentName: true });
    } else {
      this.setState({ submitLoading: true }, this.handleSubmit);
    }
  };

  handleDelete = () => {
    if (this.requestPending) return;

    const { filed, projectId, currentPosition } = this.props;
    if (filed !== 'edit') return;

    this.requestPending = true;
    return jobAjax
      .deleteJobs({ jobIds: [currentPosition.jobId], projectId })
      .then(res => {
        if (res) {
          alert(_l('删除成功'));
          this.props.getPositionList();
          this.props.onCancel();
        } else {
          alert(_l('职位存在成员，无法删除'), 2);
        }
      })
      .finally(() => {
        this.requestPending = false;
      });
  };

  render() {
    const { filed, showRoleDialog } = this.props;
    const { jobName, exsistCurrentName, submitLoading } = this.state;
    return (
      <Modal
        mask={{ closable: true }}
        keyboard
        title={filed === 'create' ? _l('新建职位') : _l('编辑职位')}
        className="createPositionDialog"
        onCancel={() => this.props.onCancel()}
        onOk={this.handleOk}
        okText={_l('保存')}
        okDisabled={exsistCurrentName}
        confirmLoading={submitLoading}
        footerLeftElement={
          filed === 'edit' ? (
            <span className="LineHeight20 Hand deleteBtn" onClick={this.handleDelete}>
              <i className="icon-trash Font16 mRight10" />
              <span>{_l('删除')}</span>
            </span>
          ) : null
        }
        open={showRoleDialog}
      >
        <div>
          <div className="mTop5 mBottom12 Font14">{_l('职位名称')}</div>
          <Input
            className="inputBox"
            maxLength={32}
            value={jobName}
            autoFocus
            placeholder={_l('请填写职位名称')}
            onChange={e => {
              this.setState({
                jobName: e.target.value,
                exsistCurrentName: false,
              });
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default DialogCreateAndEditPosition;
