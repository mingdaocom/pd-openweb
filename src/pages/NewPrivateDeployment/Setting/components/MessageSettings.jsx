import React, { Component, Fragment } from 'react';
import { Icon, Dropdown, Dialog, Button, Input, ScrollView, LoadDiv } from 'ming-ui';
import sms from 'src/api/sms';
import styled from 'styled-components';
import _ from 'lodash';

const Wrap = styled.div`
  .privateTplList {
    align-items: center;
    padding: 19px 40px;
    border: 1px solid #EAEAEA;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

const PrivateTplAdd = styled.span`
  border: 1px solid #ddd;
  border-radius: 50%;
  height: 30px;
  width: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border-color: #9e9e9e;
  }
`;

export default class MessageSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      editDialogKey: '',
      editIndex: '',
      currentTemp: null,
      operators: {
        Tencentyun: {
          text: _l('腾讯云'),
          tags: ['App ID', 'App Key'],
          keys: ['appId', 'appKey'],
        },
        Aliyun: {
          text: _l('阿里云'),
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

      this.setState({ data: result, loading: false });
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
      .then(result => {
        alert(_l('设置完成'));
        this.props.onSave(data);
      })
      .fail(() => {
        alert(_l('修改失败'), 2);
      });
  };

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
        <div className="privateTplList flexRow mBottom15" key={i}>
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
          <PrivateTplAdd className="pointer" onClick={() => this.onAddVar()}>
            <Icon icon="add" className="Gray_9e Font24" />
          </PrivateTplAdd>
        </div>
      </Dialog>
    );
  }

  render() {
    const { name } = this.props;
    const { loading, operators, data } = this.state;

    if (loading) {
      return <LoadDiv />
    }

    return (
      <Wrap className="flexColumn">
        <div className="flex">
          {data.filter(item => item.name === name).map(item => {
            const operator = operators[item.name];
            const { templates } = item.sms.china;
            return (
              <Fragment key={item.name}>
                <div className="flexColumn">
                  <div className="flex">
                    <div className="Font14 mBottom5">{operator.tags[0]}</div>
                    <Input
                      className="w100"
                      value={item.secret[operator.keys[0]]}
                      onChange={value => this.onChangeSecret(item.name, operator.keys[0], value.trim())}
                    />
                  </div>
                  <div className="flex">
                    <div className="Font14 mTop15 mBottom5">{operator.tags[1]}</div>
                    <Input
                      type="password"
                      className="w100"
                      value={item.secret[operator.keys[1]]}
                      onChange={value => this.onChangeSecret(item.name, operator.keys[1], value.trim())}
                    />
                  </div>
                  <div className="flex">
                    <div className="Font14 mTop15 mBottom5">{_l('签名')}</div>
                    <Input className="w100" value={item.signature} onChange={value => this.onChangeSignature(item.name, value.trim())} />
                  </div>
                </div>
                {!_.isEmpty(templates) && <div className="Font14 mTop10 mBottom5">{_l('短信模板')}</div>}
                {this.renderTemplates(item.name, templates)}
                <div
                  style={{ color: '#2196F3' }}
                  className="mTop20 pointer"
                  onClick={() => this.setState({ editDialogKey: item.name, editIndex: '', currentTemp: { type: 1, id: '', vars: [] } })}
                >
                  <Icon icon="add" />
                  {_l('添加模板')}
                </div>
              </Fragment>
            );
          })}
        </div>
        {this.renderEditDialog()}
      </Wrap>
    );
  }
}
