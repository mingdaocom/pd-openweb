import React from 'react';
import { Icon, ScrollView, LoadDiv } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { getIconByType } from 'src/pages/widgetConfig/util';
import AliasDialog from '../components/AliasDialog';
import cx from 'classnames';
import './alias.less';
import sheetAjax from 'src/api/worksheet';
import { NOT_AS_TITLE_CONTROL } from '../../widgetConfig/config';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';

@withClickAway
class DropControlList extends React.Component {
  render() {
    const { columsList = [], id, setFn } = this.props;
    let data = columsList.filter(it => !_.includes(NOT_AS_TITLE_CONTROL, it.type));
    if (columsList.length <= 0) {
      return <div className="listCon"> {_l('暂无可选字段')}</div>;
    }
    return (
      <ul className="listCon">
        {data.map((column, i) => (
          <li
            className={cx('columnCheckItem overflow_ellipsis', {
              current: column.controlId === id,
            })}
            key={i}
            onClick={() => {
              if (column.controlId === id) {
                return;
              }
              setFn(column.controlId, column);
            }}
          >
            <i className={cx('icon mRight10 Font14', 'icon-' + getIconByType(column.type))}></i>
            <span className="Font13">{column.controlName || (column.type === 22 ? _l('分段') : _l('备注'))}</span>
          </li>
        ))}
      </ul>
    );
  }
}
class Alias extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      worksheetInfo: props.worksheetInfo,
      showControlList: false,
      name: '记录',
      nameFocus: false,
      id: '',
      showAliasDialog: false,
      controls: [],
      alias: '',
      developerNotes: '',
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  init = nextProps => {
    const { worksheetInfo = [] } = nextProps;
    const { template = [], entityName, alias = '', developerNotes = '' } = worksheetInfo;
    const { controls = [] } = template;
    const attribute = controls.find(it => it.attribute === 1) || [];
    this.setState({
      name: entityName || _l('记录'),
      id: attribute.controlId,
      controls: controls.filter(it => !ALL_SYS.includes(it.controlId)),
      alias,
      developerNotes,
      showControlList: false,
      nameFocus: false,
    });
  };

  render() {
    const { match = {}, onChange } = this.props;
    const { worksheetId } = match.params;
    const {
      showControlList,
      name,
      nameFocus,
      id,
      showAliasDialog,
      alias = '',
      developerNotes = '',
      worksheetInfo = [],
    } = this.state;
    const { projectId = '', appId = '' } = worksheetInfo;
    const { controls } = this.state;
    let data = controls.find(it => it.controlId === id) || [];
    return (
      <React.Fragment>
        <ScrollView>
          <div className="aliasCon">
            <div className="conBox">
              <h5>{_l('记录名称')}</h5>
              <p>
                {_l(
                  '设置在添加按钮，消息通知等需要指代记录时所使用的名称，如：可以修改“客户管理”表的记录名称为“客户”。',
                )}
              </p>
              <h6 className="Font13 mTop24">{_l('记录名称')}</h6>
              <input
                type="text"
                className="name mTop6"
                placeholder={_l('请输入')}
                value={name}
                onFocus={() => {
                  this.setState({
                    nameFocus: true,
                  });
                }}
                onBlur={() => {
                  if (!name) {
                    this.setState({
                      name: '记录',
                    });
                  }
                  this.setState({
                    nameFocus: false,
                  });
                  sheetAjax
                    .updateEntityName({
                      worksheetId: worksheetId,
                      entityName: name,
                      projectId: projectId,
                    })
                    .then(data => {
                      // alert(_l('修改成功'));
                      onChange({
                        ...worksheetInfo,
                        entityName: name,
                      });
                    })
                    .catch(err => {
                      alert(_l('修改失败'), 2);
                    });
                }}
                onChange={e => {
                  this.setState({
                    name: e.target.value,
                  });
                }}
              />
              <div className="preview mTop18">
                <div className="btn">
                  <span className="title WordBreak">{_l('按钮预览')}</span>
                  <span className="btnCon TxtTop">
                    <Icon icon="plus" className="mRight8" />
                    <span className="Bold">{name}</span>
                  </span>
                </div>
                <div className="notice mTop18">
                  <span className="title WordBreak">{_l('通知预览')}</span>
                  <span className="noticeCon">
                    <span className="appIcon">
                      <Icon icon="workbench" className="Font18" />
                    </span>
                    <span className="textCon">
                      <span className="text">
                        {_l('应用消息:您已被')}
                        <span className="">@{_l('刘兰')}</span>
                        {_l('添加为')}
                        <b className={cx('Normal', { nameFocus: nameFocus })}>{name}</b>：
                        <span className="">{_l('销售线索管理')}</span>
                        {_l('的负责人')}
                      </span>
                      <span className="time mTop20 Block">2020-05-09 10:21:35</span>
                    </span>
                  </span>
                </div>
              </div>
              <span className="line"></span>
              <h5 className="Font17">{_l('工作表/字段别名')}</h5>
              <p>{_l('通过设置工作表和字段别名，使得它们在API、webhook、自定义打印等场景使用的时候更具有辨识度。')}</p>
              <h6 className="Font13 mTop24">{_l('工作表别名')}</h6>
              <input
                type="text"
                className="name mTop6"
                placeholder={_l('请输入')}
                value={alias}
                onChange={e => {
                  this.setState({
                    alias: e.target.value.trim(),
                  });
                }}
                onBlur={e => {
                  sheetAjax
                    .updateWorksheetAlias({
                      appId,
                      worksheetId,
                      alias: e.target.value.trim(),
                    })
                    .then(res => {
                      //0:成功 1：失败 2：别名重复 3：格式不匹配
                      if (res === 0) {
                        this.setState({
                          alias: e.target.value.trim(),
                        });
                      } else if (res === 3) {
                        alert(_l('工作表别名格式不匹配'), 3);
                      } else if (res === 2) {
                        alert(_l('工作表别名已存在，请重新输入'), 3);
                      } else {
                        alert(_l('别名修改失败'), 3);
                      }
                    });
                }}
              />
              <h6 className="Font13 mTop24">{_l('字段别名')}</h6>
              <div
                className="btnAlias mTop6"
                onClick={() => {
                  this.setState({
                    showAliasDialog: !showAliasDialog,
                  });
                }}
              >
                {_l('设置字段别名')}
              </div>
              <span className="line"></span>
              <h5 className="Font17">{_l('开发者备注')}</h5>
              <p>{_l('设置开发者备注，仅应用管理员、开发者和API中可见')}</p>
              <h6 className="Font13 mTop24">{_l('开发者备注')}</h6>
              <input
                type="text"
                className="name mTop6"
                placeholder={_l('请输入')}
                value={developerNotes}
                onChange={e => {
                  this.setState({
                    developerNotes: e.target.value,
                  });
                }}
                onBlur={e => {
                  const value = e.target.value.trim();
                  sheetAjax
                    .editDeveloperNotes({
                      worksheetId,
                      developerNotes: value,
                    })
                    .then(res => {
                      if (res) {
                        this.setState({
                          developerNotes: value,
                        });
                      } else {
                        alert(_l('开发者备注修改失败'), 3);
                      }
                    });
                }}
              />
            </div>
          </div>
        </ScrollView>
        {showAliasDialog && (
          <AliasDialog
            showAliasDialog={showAliasDialog}
            controls={controls}
            worksheetId={worksheetId}
            appId={appId}
            setFn={data => {
              this.setState({
                ...data,
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Alias;
