import React, { Component, Fragment } from 'react';
import { Icon, Dropdown, Dialog, Button, Input, ScrollView } from 'ming-ui';
import Trigger from 'rc-trigger';
import sms from 'src/api/sms';
import weixinCode from './images/weixin.png';

export default class MessageSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editDialogKey: '',
      editIndex: '',
      currentTemp: null,
      operators: {
        Tencentyun: {
          text: _l('腾讯云'),
          open: true,
          tags: ['App ID', 'App Key'],
          keys: ['appId', 'appKey'],
        },
        Aliyun: {
          text: _l('阿里云'),
          open: false,
          tags: ['Access Key', 'Access Secret'],
          keys: ['accessKey', 'accessSecret'],
        },
      },
      data: [
        {
          signature: '',
          name: 'Tencentyun',
          secret: {
            appId: '',
            appKey: '',
          },
          sms: {
            china: {
              templates: [],
            },
          },
        },
        {
          signature: '',
          name: 'Aliyun',
          secret: {
            accessKey: '',
            accessSecret: '',
          },
          sms: {
            china: {
              templates: [],
            },
          },
        },
      ],
    };
  }

  componentDidMount() {
    const { data } = this.state;

    sms.getProviders().then(result => {
      data.forEach(item => {
        if (!result.find(o => o.name === item.name)) {
          result.push(item);
        }
      });

      this.setState({ data: result });
    });
  }

  editProviders = () => {
    const { operators, data } = this.state;
    let errorSize = 0;

    data.forEach(item => {
      const operator = operators[item.name];
      if (
        !(
          (!item.signature && !item.secret[operator.keys[0]] && !item.secret[operator.keys[1]] && item.sms.china.templates.length === 0) ||
          (item.signature && item.secret[operator.keys[0]] && item.secret[operator.keys[1]] && item.sms.china.templates.length > 0)
        )
      ) {
        errorSize++;
      }
    });

    if (errorSize > 0) {
      alert(_l('保存失败，请检查配置信息'), 2);
      return;
    }

    sms
      .editProviders({ providers: data })
      .then(data => {
        alert(_l('设置完成'));
      })
      .fail(() => {
        alert(_l('修改失败'), 2);
      });
  };

  onToggle(key) {
    const { operators } = this.state;
    const current = operators[key];

    this.setState({ operators: Object.assign({}, operators, { [key]: { ...current, open: !current.open } }) });
  }

  onChangeSecret(name, key, value) {
    const data = [].concat(this.state.data);
    const current = data.find(item => item.name === name);

    current.secret[key] = value;
    this.setState({ data });
  }

  onChangeSignature(name, value) {
    const data = [].concat(this.state.data);
    const current = data.find(item => item.name === name);

    current.signature = value;
    this.setState({ data });
  }

  onDeleteTemplate(name, index) {
    const data = [].concat(this.state.data);
    const current = data.find(item => item.name === name);

    _.remove(current.sms.china.templates, (item, i) => i === index);
    this.setState({ data });
  }

  onChangeCode(value) {
    const { currentTemp } = this.state;

    currentTemp.id = value;
    this.setState({ currentTemp });
  }

  onChangeVar(index, value) {
    const { currentTemp } = this.state;

    currentTemp.vars = currentTemp.vars.map((item, i) => (i === index ? value : item));
    this.setState({ currentTemp });
  }

  onDeleteVar(index) {
    const { currentTemp } = this.state;

    _.remove(currentTemp.vars, (item, i) => i === index);
    this.setState({ currentTemp });
  }

  onAddVar() {
    const { currentTemp } = this.state;

    currentTemp.vars.push('');
    this.setState({ currentTemp });
  }

  onSave = () => {
    const { editDialogKey, editIndex, currentTemp } = this.state;
    const data = [].concat(this.state.data);
    const current = data.find(item => item.name === editDialogKey);

    if (!currentTemp.id) {
      alert(_l('模板 Code不能为空'), 2);
      return;
    }

    currentTemp.vars = currentTemp.vars.filter(item => item);

    if (editIndex !== '') {
      current.sms.china.templates = current.sms.china.templates.map((item, i) => {
        return i === editIndex ? currentTemp : item;
      });
    } else {
      current.sms.china.templates.push(currentTemp);
    }

    this.setState({ data, editDialogKey: '', currentTemp: null });
  };

  renderTemplates(name, templates) {
    const TYPES = {
      1: _l('验证码'),
    };

    return templates.map((item, i) => {
      return (
        <div className="privateTplList flexRow mTop15" key={i}>
          <div className="flex">
            <div className="Font12 Gray_9e">{_l('模板类型')}</div>
            <div className="Font15">{TYPES[item.type]}</div>
          </div>
          <div className="flex">
            <div className="Font12 Gray_9e">{_l('模板 code')}</div>
            <div className="Font15" style={{ height: 22 }}>
              {item.id}
            </div>
          </div>
          <div className="flex">
            <div className="Font12 Gray_9e">{_l('变量参数')}</div>
            <div className="Font15 ellipsis" style={{ height: 22 }}>
              {item.vars.join('，')}
            </div>
          </div>
          <div>
            <span
              className="ThemeColor3 ThemeHoverColor2 pointer"
              onClick={() => this.setState({ editDialogKey: name, editIndex: i, currentTemp: Object.assign({}, item) })}
            >
              {_l('编辑')}
            </span>
            <span className="ThemeColor3 ThemeHoverColor2 mLeft35 pointer" onClick={() => this.onDeleteTemplate(name, i)}>
              {_l('删除')}
            </span>
          </div>
        </div>
      );
    });
  }

  renderEditDialog() {
    const { editDialogKey, currentTemp, operators } = this.state;
    const TYPES = [{ text: _l('验证码'), value: 1 }];

    if (!editDialogKey) return null;

    return (
      <Dialog
        visible={true}
        anim={false}
        title={operators[editDialogKey].text}
        width={480}
        okText={_l('保存')}
        onOk={this.onSave}
        onCancel={() => this.setState({ editDialogKey: '', currentTemp: null })}
      >
        <div className="Font14">
          {_l('模板类型')}
          <span className="Gray_bd">{_l('（暂仅支持验证码）')}</span>
        </div>
        <Dropdown className="w100 mTop10" style={{ background: '#f5f5f5' }} disabled={true} value={currentTemp.type} border data={TYPES} />
        <div className="Font14 mTop20">{_l('模版 Code')}</div>
        <Input className="w100 mTop10" value={currentTemp.id} onChange={value => this.onChangeCode(value.trim())} />
        <div className="Font14 mTop20">{_l('变量参数')}</div>
        {editDialogKey==='Tencentyun'
         ? <div className="Font12 mTop10 Gray_bd">{_l('如："您的验证码是{1}，感谢您的使用"，则参数为 {1}。')}</div>
         : <div className="Font12 mTop10 Gray_bd">{_l('如："您的验证码是${code}，感谢您的使用"，则参数为 code。')}</div>
        }
        {currentTemp.vars.map((item, i) => {
          return (
            <div className="mTop10" key={i}>
              <Input style={{ width: 215 }} value={item} onChange={value => this.onChangeVar(i, value.trim())} />
              <span className="Gray_9e ThemeHoverColor3 pointer mLeft15" onClick={() => this.onDeleteVar(i)}>
                {_l('删除')}
              </span>
            </div>
          );
        })}

        <div className="mTop10">
          <span className="privateTplAdd pointer" onClick={() => this.onAddVar()}>
            <Icon icon="add" className="Gray_9e Font24" />
          </span>
        </div>
      </Dialog>
    );
  }

  render() {
    const { onClose } = this.props;
    const { operators, data } = this.state;

    return (
      <div className="privateDeploymentWrapper card mAll15 pAll20 flexColumn">
        <div className="Font17">
          <Icon icon="backspace" className="Gray_9e pointer mRight10 Font20" onClick={onClose} />
          {_l('短信服务设置')}
        </div>
        <div className="Font14 privateDesc">
          {_l('设置短信服务需要先购买腾讯云或阿里云的「短信服务」，如需自定义短信服务请')}
          <Trigger
            action={['hover']}
            popup={<img className="card z-depth-2" style={{ width: 300 }} src={weixinCode} />}
            popupAlign={{
              offset: [0, 7],
              points: ['tc', 'bc'],
              overflow: { adjustX: 1, adjustY: 2 },
            }}
          >
            <div className="addWeiXin pointer">
              <Icon icon="weixin" className="mRight2" />
              {_l('添加微信')}
            </div>
          </Trigger>
          {_l('寻求技术支持')}
        </div>
        <ScrollView className="flex mTop10">
          {data.map(item => {
            const operator = operators[item.name];

            return (
              <Fragment key={item.name}>
                <div className="Font15 bold mTop10 pTop10 pBottom10 flexRow pointer" onClick={() => this.onToggle(item.name)}>
                  <div className="flex">{operator.text}</div>
                  <Icon icon={operator.open ? 'arrow-down-border' : 'arrow-left-border'} className="Gray_9e pointer Font18 mRight15" />
                </div>
                <div className="privateLine" />
                {operator.open && (
                  <Fragment>
                    <div className="flexRow">
                      <div className="flex">
                        <div className="Font14 mTop15 mBottom5">{operator.tags[0]}</div>
                        <Input
                          className="w100"
                          value={item.secret[operator.keys[0]]}
                          onChange={value => this.onChangeSecret(item.name, operator.keys[0], value.trim())}
                        />
                      </div>
                      <div className="flex mLeft15">
                        <div className="Font14 mTop15 mBottom5">{operator.tags[1]}</div>
                        <Input
                          type="password"
                          className="w100"
                          value={item.secret[operator.keys[1]]}
                          onChange={value => this.onChangeSecret(item.name, operator.keys[1], value.trim())}
                        />
                      </div>
                      <div className="flex mLeft15">
                        <div className="Font14 mTop15 mBottom5">{_l('签名')}</div>
                        <Input className="w100" value={item.signature} onChange={value => this.onChangeSignature(item.name, value.trim())} />
                      </div>
                    </div>
                    <div className="privateLine mTop15" style={{ background: '#eaeaea' }} />
                    {this.renderTemplates(item.name, item.sms.china.templates)}

                    <Button
                      className="mTop20"
                      type="ghost"
                      onClick={() => this.setState({ editDialogKey: item.name, editIndex: '', currentTemp: { type: 1, id: '', vars: [] } })}
                    >
                      {_l('添加模板')}
                    </Button>
                  </Fragment>
                )}
              </Fragment>
            );
          })}
        </ScrollView>
        <div className="mTop20">
          <Button onClick={this.editProviders}>{_l('确定')}</Button>
        </div>
        {this.renderEditDialog()}
      </div>
    );
  }
}
