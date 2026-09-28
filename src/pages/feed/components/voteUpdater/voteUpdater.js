import React from 'react';
import moment from 'moment';
import { QiniuUpload } from 'ming-ui';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Flex,
  Image,
  Input,
  Select,
  Space,
} from 'ming-ui/antd-components';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import './voteUpdater.css';

const DATE_FORMAT = 'YYYY-MM-DD';
const MAX_OPTION_COUNT = 99;
const UPLOAD_OPTIONS = {
  multi_selection: false,
  filters: {
    mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
  },
  max_file_size: '4m',
};
const DELETE_ICON = <i className="icon icon-trash Font16" />;
const IMAGE_STYLE = { width: 96, height: 64, objectFit: 'cover', borderRadius: 4 };
const ADD_OPTION_STYLE = { marginTop: 12 };
const AVAILABLE_NUMBER_STYLE = { width: 72 };
const DATE_PICKER_STYLE = { width: 130 };
const HOUR_SELECT_STYLE = { width: 76 };
const DIVIDER_STYLE = { margin: '16px 0' };
const SETTINGS_STYLE = { columnGap: 28, rowGap: 12 };
const ANONYMOUS_STYLE = { marginTop: 12 };
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({ label: `${hour}`, value: hour }));
const editorRoots = new WeakMap();
const editorInstances = new WeakMap();
const getVotePopupContainer = trigger => trigger?.closest('#MDUpdater_Vote_updater') || document.body;

function VoteOption({
  index,
  invalid,
  onChange,
  onInputRef,
  onRemove,
  onUploadError,
  onUploadStart,
  onUploaded,
  option,
}) {
  return (
    <li className="voteOptionRow">
      <span className="textSecondary">{_l('选项%0', index + 1)}</span>
      <Input
        ref={input => onInputRef(option.id, input)}
        status={invalid ? 'error' : undefined}
        value={option.value}
        placeholder={_l('请输入投票项')}
        onChange={event => onChange(option.id, event.target.value)}
      />
      <div className="voteOptionActions">
        <QiniuUpload
          className="voteOptionUpload"
          options={UPLOAD_OPTIONS}
          onAdd={up => onUploadStart(option.id, up)}
          onUploaded={(up, file) => onUploaded(option.id, up, file)}
          onError={up => onUploadError(option.id, up)}
        >
          <Button loading={option.uploading}>{option.fileUrl ? _l('换一张') : _l('上传图片')}</Button>
        </QiniuUpload>
        {index > 1 && (
          <Button
            type="text"
            size="small"
            danger
            icon={DELETE_ICON}
            aria-label={_l('删除选项')}
            onClick={() => onRemove(option.id)}
          />
        )}
      </div>
      {option.fileUrl && (
        <div className="voteOptionImage">
          <Image
            src={option.filePreviewUrl || option.fileUrl}
            alt={option.fileName}
            preview={false}
            style={IMAGE_STYLE}
          />
          <span className="voteOptionImageName" title={option.fileName}>
            {option.fileName}
          </span>
        </div>
      )}
    </li>
  );
}

class VoteEditor extends React.Component {
  constructor(props) {
    super(props);
    this.nextOptionId = 0;
    this.state = this.createInitialState();
  }

  inputRefs = new Map();

  createOption() {
    return {
      id: `vote-option-${++this.nextOptionId}`,
      value: '',
      fileUrl: '',
      filePreviewUrl: '',
      fileName: '',
      uploading: false,
    };
  }

  createInitialState() {
    const now = moment();

    return {
      options: [this.createOption(), this.createOption()],
      voteAvailableNumber: 1,
      voteLastTime: now.clone().add(1, 'day').format(DATE_FORMAT),
      voteLastHour: 0,
      voteAnonymous: false,
      invalidOptionIds: [],
      currentDate: now.format(DATE_FORMAT),
      currentHour: now.hour(),
    };
  }

  reset = () => {
    this.setState(this.createInitialState(), () => {
      if (this.optionList) {
        this.optionList.scrollTop = 0;
      }
    });
  };

  updateOption = (optionId, values) => {
    this.setState(state => ({
      options: state.options.map(option => (option.id === optionId ? { ...option, ...values } : option)),
    }));
  };

  handleOptionChange = (optionId, value) => {
    this.setState(state => ({
      options: state.options.map(option => (option.id === optionId ? { ...option, value } : option)),
      invalidOptionIds: state.invalidOptionIds.filter(id => id !== optionId),
    }));
  };

  handleAddOption = () => {
    const newOption = this.createOption();

    this.setState(
      state => {
        if (state.options.length >= MAX_OPTION_COUNT) {
          return null;
        }

        return { options: [...state.options, newOption] };
      },
      () => {
        if (this.optionList) {
          this.optionList.scrollTop = this.optionList.scrollHeight;
        }
      },
    );
  };

  handleRemoveOption = optionId => {
    this.setState(state => {
      const options = state.options.filter(option => option.id !== optionId);

      return {
        options,
        voteAvailableNumber: Math.min(state.voteAvailableNumber, options.length),
        invalidOptionIds: state.invalidOptionIds.filter(id => id !== optionId),
      };
    });
  };

  handleUploadStart = (optionId, up) => {
    up.disableBrowse();
    this.updateOption(optionId, { uploading: true });
  };

  handleUploaded = (optionId, up, file) => {
    up.disableBrowse(false);
    this.updateOption(optionId, {
      fileUrl: file.serverName && file.key ? `${file.serverName}${file.key}` : (file.url || '').split('?')[0],
      filePreviewUrl: file.url,
      fileName: file.name,
      uploading: false,
    });
  };

  handleUploadError = (optionId, up) => {
    up?.disableBrowse(false);
    this.updateOption(optionId, { uploading: false });
  };

  handleDateChange = value => {
    if (!value) {
      return;
    }

    const now = moment();
    const currentDate = now.format(DATE_FORMAT);
    const currentHour = now.hour();
    const isToday = value.format(DATE_FORMAT) === currentDate;

    this.setState(state => ({
      voteLastTime: value.format(DATE_FORMAT),
      voteLastHour:
        isToday && state.voteLastHour <= currentHour
          ? currentHour + 1 >= 24
            ? 0
            : currentHour + 1
          : state.voteLastHour,
      currentDate,
      currentHour,
    }));
  };

  setInputRef = (optionId, input) => {
    if (input) {
      this.inputRefs.set(optionId, input);
    } else {
      this.inputRefs.delete(optionId);
    }
  };

  setOptionListRef = element => {
    this.optionList = element;
  };

  getInvalidOptionIds = options => options.filter(option => !option.value.trim()).map(option => option.id);

  getData = () => {
    const { options, voteAnonymous, voteAvailableNumber, voteLastHour, voteLastTime } = this.state;
    const normalizedOptions = options.map(option => ({ ...option, value: option.value.trim() }));
    const invalidOptionIds = this.getInvalidOptionIds(normalizedOptions);
    let voteOptions = '';
    let voteOptionFiles = '';

    normalizedOptions.forEach(option => {
      if (option.value) {
        voteOptions += `${option.value}[Option]`;
        voteOptionFiles += `${option.fileUrl || ''}[Option]`;
      }
    });

    this.setState({ options: normalizedOptions, invalidOptionIds });

    return {
      invalid: invalidOptionIds.length,
      voteOptions,
      voteOptionFiles,
      voteLastTime,
      voteLastHour: String(voteLastHour),
      voteAvailableNumber,
      voteAnonymous,
      voteVisble: false,
    };
  };

  alertInvalidData = () => {
    const invalidOptionIds = this.getInvalidOptionIds(this.state.options);

    if (invalidOptionIds.length) {
      this.setState({ invalidOptionIds }, () => {
        this.inputRefs.get(invalidOptionIds[0])?.focus();
      });
      alert(_l('投票项内容不能为空'), 3);
    }
  };

  render() {
    const {
      currentDate,
      currentHour,
      invalidOptionIds,
      options,
      voteAnonymous,
      voteAvailableNumber,
      voteLastHour,
      voteLastTime,
    } = this.state;
    const isToday = voteLastTime === currentDate;
    const availableNumberOptions = options.map((option, index) => ({ label: `${index + 1}`, value: index + 1 }));
    const hourOptions = HOUR_OPTIONS.map(option => ({
      ...option,
      disabled: isToday && option.value <= currentHour,
    }));

    return (
      <Card size="small">
        <div className="voteOptions">
          <ul className="voteOptionList" ref={this.setOptionListRef}>
            {options.map((option, index) => (
              <VoteOption
                key={option.id}
                index={index}
                invalid={invalidOptionIds.includes(option.id)}
                option={option}
                onChange={this.handleOptionChange}
                onInputRef={this.setInputRef}
                onRemove={this.handleRemoveOption}
                onUploadError={this.handleUploadError}
                onUploadStart={this.handleUploadStart}
                onUploaded={this.handleUploaded}
              />
            ))}
          </ul>
          <Button
            type="dashed"
            style={ADD_OPTION_STYLE}
            disabled={options.length >= MAX_OPTION_COUNT}
            onClick={this.handleAddOption}
          >
            {_l('添加选项')}
          </Button>
        </div>

        <Divider style={DIVIDER_STYLE} />
        <Flex wrap style={SETTINGS_STYLE}>
          <Space size={8}>
            <span>{_l('允许选择')}</span>
            <Select
              style={AVAILABLE_NUMBER_STYLE}
              value={voteAvailableNumber}
              options={availableNumberOptions}
              getPopupContainer={getVotePopupContainer}
              onChange={value => this.setState({ voteAvailableNumber: value })}
            />
            <span>{_l('项')}</span>
          </Space>
          <Space size={8}>
            <span>{_l('截止日期')}</span>
            <DatePicker
              allowClear={false}
              style={DATE_PICKER_STYLE}
              value={moment(voteLastTime, DATE_FORMAT)}
              format={DATE_FORMAT}
              getPopupContainer={getVotePopupContainer}
              onChange={this.handleDateChange}
            />
            <Select
              style={HOUR_SELECT_STYLE}
              value={voteLastHour}
              options={hourOptions}
              getPopupContainer={getVotePopupContainer}
              onChange={value => this.setState({ voteLastHour: value })}
            />
            <span>{_l('时')}</span>
          </Space>
        </Flex>
        <Checkbox
          style={ANONYMOUS_STYLE}
          checked={voteAnonymous}
          onChange={event => this.setState({ voteAnonymous: event.target.checked })}
        >
          {_l('匿名投票')}
        </Checkbox>
      </Card>
    );
  }
}

const VoteUpdater = {
  init($el) {
    return $el.each((index, element) => {
      let root = editorRoots.get(element);

      if (!root) {
        root = createRoot(element);
        editorRoots.set(element, root);
      }

      root.render(
        <VoteEditor
          ref={editor => {
            if (editor) {
              editorInstances.set(element, editor);
            } else {
              editorInstances.delete(element);
            }
          }}
        />,
      );
    });
  },
  reset($el) {
    return $el.each((index, element) => {
      editorInstances.get(element)?.reset();
    });
  },
  getData($el) {
    const editor = editorInstances.get($el.get(0));

    return editor
      ? editor.getData()
      : {
          invalid: 1,
          voteOptions: '',
          voteOptionFiles: '',
          voteLastTime: '',
          voteLastHour: '',
          voteAvailableNumber: 1,
          voteAnonymous: false,
          voteVisble: false,
        };
  },
  alertInvalidData($el) {
    editorInstances.get($el.get(0))?.alertInvalidData();
  },
  destroy($el) {
    return $el.each((index, element) => {
      editorRoots.get(element)?.unmount();
      editorRoots.delete(element);
      editorInstances.delete(element);
    });
  },
};

export default VoteUpdater;
