import React from 'react';
import { Dialog, Icon } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import cx from 'classnames';
import './AliasDialog.less';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
export default class AliasDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusId: '',
      controls: [],
      isChange: false,
      controlsOriginal: [],
    };
  }
  componentWillMount() {
    const { controls = [], worksheetId, appId, list = [] } = this.props;
    if (controls.length <= 0) {
      //控件列表
      sheetAjax
        .getWorksheetInfo({
          worksheetId: worksheetId,
          getTemplate: true,
          getViews: true,
        })
        .then(res => {
          const { template = [] } = res;
          const { controls = [] } = template;
          let controlsList = controls.filter(item => !_.includes(SYS, item.controlId));
          this.setState({
            controls: controlsList,
            controlsOriginal: controlsList,
          });
        });
    } else {
      let controlsList = controls.filter(item => !_.includes(SYS, item.controlId));
      this.setState({
        controls: controlsList,
        controlsOriginal: controlsList,
      });
    }
    if (list.length <= 0) {
      //获取类型
      sheetAjax
        .getWorksheetApiInfo({
          worksheetId,
          appId,
        })
        .then(res => {
          this.setState({
            list: res[0].controls,
          });
        });
    } else {
      this.setState({
        list,
      });
    }
  }
  render() {
    const { showAliasDialog, setFn, worksheetId, appId } = this.props;
    const { focusId, controls = [], isChange, controlsOriginal = [], list = [] } = this.state;
    return (
      <Dialog
        className="aliasDialog"
        style={{ width: '720px' }}
        visible={showAliasDialog}
        onCancel={() => setFn({ showAliasDialog: false, controls })}
        footer={''}
        title={_l('设置字段别名')}
      >
        <p className="text">
          {_l('注：字段别名仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头，不可重复。')}
        </p>
        {/* <div className="btnAlias">
          <Icon icon="workflow_update" className="" />
          {_l('批量生成默认别名')}
        </div> */}
        <div className="tableAlias">
          <div className="topDiv">
            <span className="">{_l('字段名称')}</span>
            <span className="">{_l('类型')}</span>
            <span className="">{_l('字段别名')}</span>
          </div>
          {controls.map((it, i) => {
            return (
              <div className="listDiv">
                <span className="">{it.controlName}</span>
                <span className="">
                  {list.length > 0
                    ? // ? list.find(o => o.controlId === it.controlId || o.controlId === it.alias)
                      //   ? list.find(o => o.controlId === it.controlId || o.controlId === it.alias).type
                      // :
                      list[i]
                      ? list[i].type
                      : ''
                    : ''}
                </span>
                <span
                  className={cx('aliasBox', { onFocusSpan: focusId === it.controlId, isError: this.state.isError })}
                >
                  {focusId !== it.controlId ? (
                    <span
                      className="aliasTxt"
                      onClick={() => {
                        this.setState(
                          {
                            focusId: it.controlId,
                          },
                          () => {
                            $(this.input).focus();
                          },
                        );
                      }}
                    >
                      <span className={cx('txt', { noData: !it.alias })}>{it.alias || _l('请输入别名')}</span>
                      <Icon icon="edit_17" />
                    </span>
                  ) : (
                    <input
                      ref={el => {
                        this.input = el;
                      }}
                      type="text"
                      value={it.alias}
                      onChange={e => {
                        this.setState({
                          isChange: true,
                          controls: controls.map(o => {
                            if (it.controlId !== o.controlId) {
                              return o;
                            } else {
                              return {
                                ...o,
                                alias: e.target.value,
                              };
                            }
                          }),
                        });
                        if (
                          (e.target.value && controls.filter(o => e.target.value === o.alias).length > 1) ||
                          (e.target.value && !/^[a-zA-Z]{1}\w*$/.test(e.target.value))
                        ) {
                          this.setState({
                            isError: true,
                          });
                        } else {
                          this.setState({
                            isError: false,
                          });
                        }
                      }}
                      onBlur={() => {
                        this.setState({
                          focusId: '',
                        });
                        if (!isChange) {
                          this.setState({
                            isChange: false,
                          });
                          return;
                        }
                        if (
                          it.alias &&
                          (controls.filter(o => it.alias === o.alias).length > 1 || SYS.includes(it.alias))
                        ) {
                          this.setState({
                            isChange: false,
                            controls: controlsOriginal,
                            isError: false,
                          });
                          alert(
                            SYS.includes(it.alias) ? _l('该别名与系统字段的别名相同，请重新输入') : _l('该别名已存在'),
                            2,
                          );
                          return;
                        }
                        if ((it.alias && !/^[a-zA-Z]{1}\w*$/.test(it.alias)) || this.state.isError) {
                          this.setState({
                            isChange: false,
                            controls: controlsOriginal,
                            isError: false,
                          });
                          return;
                        }
                        this.setState({
                          isChange: false,
                        });
                        sheetAjax
                          .editControlsAlias({
                            worksheetId: worksheetId,
                            appId: appId,
                            controls: [
                              {
                                controlId: it.controlId,
                                alias: it.alias,
                              },
                            ],
                          })
                          .then(data => {
                            // alert(_l('修改成功'));
                            this.setState({
                              controlsOriginal: controls,
                            });
                          })
                          .fail(err => {
                            alert(_l('修改失败'), 2);
                          });
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Dialog>
    );
  }
}
