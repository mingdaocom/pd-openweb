import React from 'react';
import * as actions from '../redux/actions/action';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, ScrollView } from 'ming-ui';
import { LoadDiv } from 'ming-ui';
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
      showControlList: false,
      name: '记录',
      nameFocus: false,
      id: '',
      showAliasDialog: false,
      controls: [],
      alias: '',
    };
  }

  componentDidMount() {
    const { match, getWorksheetInfo } = this.props;
    const { worksheetId } = match.params;
    getWorksheetInfo(worksheetId);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps, this.props)) {
      const { formSet } = nextProps;
      const { worksheetInfo = [] } = formSet;
      const { template = [], entityName, alias = '' } = worksheetInfo;
      const { controls = [] } = template;
      const attribute = controls.find(it => it.attribute === 1) || [];
      this.setState({
        name: entityName || '记录',
        id: attribute.controlId,
        controls: controls.filter(it => !ALL_SYS.includes(it.controlId)),
        alias,
      });
    }
  }

  render() {
    const { formSet } = this.props;
    const { showControlList, name, nameFocus, id, showAliasDialog, alias = '' } = this.state;
    const { worksheetInfo = [], worksheetId } = formSet;
    const { template = [], projectId = '', appId = '' } = worksheetInfo;
    // const { controls = [] } = template;
    const { controls } = this.state;
    let data = controls.find(it => it.controlId === id) || [];
    return (
      <React.Fragment>
        {formSet.loading ? (
          <LoadDiv />
        ) : (
          <ScrollView>
            <div className="aliasCon">
              <div className="conBox">
                <h5>{_l('标题字段')}</h5>
                <p>{_l('记录标题用于快速辨识一条数据，用于数据详情、关联数据、和消息通知等功能场景中。')}</p>
                <h6 className="Font13 mTop24">{_l('标题字段')}</h6>
                <div className="attr mTop6">
                  <div
                    className={cx('inputTxt overflow_ellipsis', { noData: !data.controlName })}
                    onClick={() => {
                      this.setState({
                        showControlList: !showControlList,
                      });
                    }}
                  >
                    {data.controlName || _l('请选择')}
                  </div>
                  <Icon
                    icon="expand_more"
                    className="Font16"
                    onClick={() => {
                      this.setState({
                        showControlList: !showControlList,
                      });
                    }}
                  />
                  {showControlList && (
                    <DropControlList
                      columsList={controls.filter(o => !ALL_SYS.includes(o.controlId))}
                      onClickAwayExceptions={[]}
                      onClickAway={() => this.setState({ showControlList: false })}
                      id={id}
                      setFn={(id, list) => {
                        this.setState({
                          id,
                          showControlList: !showControlList,
                        });
                        sheetAjax
                          .editWorksheetControls({
                            worksheetId: worksheetId,
                            appId: appId,
                            controls: [{ ...list, attribute: 1 }],
                          })
                          .then(data => {
                            // alert(_l('修改成功'));
                          })
                          .fail(err => {
                            alert(_l('修改失败'), 2);
                          });
                      }}
                    />
                  )}
                </div>
                <span className="line"></span>
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
                      })
                      .fail(err => {
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
                <p>
                  {_l('通过设置工作表和字段别名，使得它们在API、webhook、自定义打印等场景使用的时候更具有辨识度。')}
                </p>
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
              </div>
            </div>
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
          </ScrollView>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  formSet: state.formSet,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Alias);
