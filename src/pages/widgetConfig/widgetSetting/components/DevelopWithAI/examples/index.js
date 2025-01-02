export const Date = `// <free_field_name>日期选择器</free_field_name>
// <file_name>DatePicker_v1.jsx</file_name>
function DatePicker({ value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value || '');
  const [currentDate, setCurrentDate] = useState(new Date());
  // 这是一个标准的日期选择器字段案例，value 的处理，onChange 的格式请以此为标准
  useEffect(() => {
    setSelectedDate(value); // 监听外部 value 的变化
  }, [value]);

  const handleDateClick = date => {
    const formattedDate = date.toLocaleDateString('en-CA'); // 格式化为 YYYY-MM-DD
    setSelectedDate(formattedDate);
    onChange(formattedDate); // 更新值
  };

  const changeMonth = increment => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const changeYear = increment => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + increment);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const calendar = [];

    // 填充前面的空白
    for (let i = 0; i < startOfMonth.getDay(); i++) {
      calendar.push(<div key={\`empty-\${i}\`} className="w-full h-12" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      calendar.push(
        <div
          key={i}
          className={\`w-full h-12 flex items-center justify-center border rounded-md cursor-pointer transition-colors duration-200 \${
            selectedDate === date.toLocaleDateString('en-CA')
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'text-gray-800 hover:bg-gray-200'
          }\`}
          onClick={() => handleDateClick(date)}
        >
          {i}
        </div>,
      );
    }
    return calendar;
  };

  const renderWeekdays = () => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return weekdays.map((day, index) => (
      <div key={index} className="w-full h-12 flex items-center justify-center font-semibold text-gray-700">
        {day}
      </div>
    ));
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-2">
        <button onClick={() => changeYear(-1)} className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded-md">
          上一年
        </button>
        <button onClick={() => changeMonth(-1)} className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded-md">
          上一月
        </button>
        <div className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </div>
        <button onClick={() => changeMonth(1)} className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded-md">
          下一月
        </button>
        <button onClick={() => changeYear(1)} className="px-2 py-1 text-gray-700 hover:bg-gray-200 rounded-md">
          下一年
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 w-full mb-1">
        {' '}
        {/* 添加 gap */}
        {renderWeekdays()}
      </div>
      <div className="grid grid-cols-7 gap-1 w-full">
        {' '}
        {/* 添加 gap */}
        {renderCalendar()}
      </div>
    </div>
  );
}
`;

export const MultipleSelect = `// <free_field_name>选项按钮组</free_field_name>
// <file_name>OptionButtonGroup_v1.jsx</file_name>
function OptionButtonGroup({ value, currentControl, onChange }) {
  // 这是一个标准的多选字段案例，value 的处理，onChange 的格式请以此为标准
  const options = currentControl?.options || [];
  let selectedValue = [];

  // 尝试解析 value，如果失败则为空 []
  try {
    selectedValue = value ? JSON.parse(value) : [];
  } catch (e) {
    selectedValue = [];
  }

  const handleToggle = optionKey => {
    const updatedValue = selectedValue.includes(optionKey)
      ? selectedValue.filter(v => v !== optionKey)
      : [...selectedValue, optionKey];
    onChange(JSON.stringify(updatedValue));
  };

  return (
    <div className="flex space-x-2">
      {options.map(option => (
        <button
          key={option.key}
          className={\`flex-1 h-10 border rounded-md \${
            selectedValue.includes(option.key) ? 'bg-[#2196f3] text-white' : 'bg-white text-[#151515] border-gray-300'
          }\`}
          onClick={() => handleToggle(option.key)}
        >
          {option.value}
        </button>
      ))}
    </div>
  );
}
`;

export const Number = `// <free_field_name>数值输入组件</free_field_name>
// <file_name>NumberInputWithButtons_v1.jsx</file_name>
function NumberInputWithButtons({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = e => {
    const newValue = e.target.value;
    if (!isNaN(newValue) && newValue.trim() !== '') {
      setInputValue(newValue);
      onChange(Number(newValue));
    }
  };

  const increment = () => {
    const newValue = (parseFloat(inputValue) || 0) + 1;
    setInputValue(newValue);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = (parseFloat(inputValue) || 0) - 1;
    setInputValue(newValue);
    onChange(newValue);
  };

  const generateRandom = () => {
    const randomValue = Math.floor(Math.random() * 100); // 生成0到99之间的随机数
    setInputValue(randomValue);
    onChange(randomValue);
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={decrement} className="h-[36px] w-[36px] bg-gray-200 rounded-md">
        -
      </button>
      <input
        type="number"
        className="w-[100px] h-[36px] px-2 border rounded-md border-gray-300"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={e => {
          if (e.key === 'ArrowUp') increment();
          if (e.key === 'ArrowDown') decrement();
        }}
      />
      <button onClick={increment} className="h-[36px] w-[36px] bg-gray-200 rounded-md">
        +
      </button>
      <button onClick={generateRandom} className="h-[36px] px-2 bg-blue-500 text-white rounded-md">
        随机
      </button>
    </div>
  );
}
`;

export const RelateRecord = `// <free_field_name>关联记录</free_field_name>
// <file_name>RelateRecordList_v1.jsx</file_name>
function RelateRecordList({ value, onChange }) {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    getRowsForRelation({ pageSize: 10 }).then(res => setRecords(res.data));
  }, []);
  return (
    <div class="flex flex-col">
      {records.map(r => (
        <div class="p-4 mb-2 border border-gary-400 rounded">{r['rowid']}</div>
      ))}
    </div>
  );
}
`;

export const SingleSelect = `// <free_field_name>选项按钮组</free_field_name>
// <file_name>OptionButtonGroup_v1.jsx</file_name>
function OptionButtonGroup({ value, currentControl, onChange }) {
  // 这是一个标准的单选字段案例，value 的处理，onChange 的格式请以此为标准
  const options = currentControl?.options || [];
  let selectedValue = [];

  // 尝试解析 value，如果失败则为空 []
  try {
    selectedValue = value ? JSON.parse(value) : [];
  } catch (e) {
    selectedValue = [];
  }

  const handleToggle = optionKey => {
    const updatedValue = [optionKey];
    onChange(JSON.stringify(updatedValue));
  };

  return (
    <div className="flex space-x-2">
      {options.map(option => (
        <button
          key={option.key}
          className={\`flex-1 h-10 border rounded-md \${
            selectedValue.includes(option.key) ? 'bg-[#2196f3] text-white' : 'bg-white text-[#151515] border-gray-300'
          }\`}
          onClick={() => handleToggle(option.key)}
        >
          {option.value}
        </button>
      ))}
    </div>
  );
}
`;

export const Text = `// <free_field_name>输入框</free_field_name>
// <file_name>TextInput_v2.jsx</file_name>
function TextInput({ value, onChange }) {
  const [inputValue, setInputValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  useEffect(() => {
    // 监听外部 value 的变化
    setInputValue(value);
  }, [value]);
  const handleChange = e => {
    if (!isComposing) {
      onChange(e.target.value);
    }
    setInputValue(e.target.value);
  };
  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = e => {
    setIsComposing(false);
    onChange(e.target.value); // 在中文输入结束时更新值
  };
  return (
    <input
      className="w-[200px] h-[36px] px-2 border rounded-md border-gray-300"
      value={inputValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
}
`;

export const Time = `// <free_field_name>黑绿风格数位液晶屏时间选择器</free_field_name>
// <file_name>BlackGreenDigitalLCDClockSelector_v1.jsx</file_name>
function BlackGreenDigitalLCDClockSelector({ value, onChange }) {
  const [hours, setHours] = useState((value && value.split(':')[0]) || '00');
  const [minutes, setMinutes] = useState((value && value.split(':')[1]) || '00');

  useEffect(() => {
    setHours((value && value.split(':')[0]) || '00');
    setMinutes((value && value.split(':')[1]) || '00');
  }, [value]);

  const handleHoursChange = e => {
    setHours(e.target.value);
  };

  const handleMinutesChange = e => {
    setMinutes(e.target.value);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-black text-green-500 text-[24px] font-mono p-2 rounded-md border border-gray-600 shadow-lg">
        <div className="flex items-center space-x-2">
          <select
            className="h-[36px] border rounded-md border-gray-600 bg-black text-green-500 font-mono focus:outline-none"
            value={hours}
            onChange={handleHoursChange}
          >
            {[...Array(24).keys()].map(hour => (
              <option key={hour} value={String(hour).padStart(2, '0')}>
                {String(hour).padStart(2, '0')}
              </option>
            ))}
          </select>
          <span className="text-green-500">:</span>
          <select
            className="h-[36px] border rounded-md border-gray-600 bg-black text-green-500 font-mono focus:outline-none"
            value={minutes}
            onChange={handleMinutesChange}
          >
            {[...Array(60).keys()].map(minute => (
              <option key={minute} value={String(minute).padStart(2, '0')}>
                {String(minute).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
`;

