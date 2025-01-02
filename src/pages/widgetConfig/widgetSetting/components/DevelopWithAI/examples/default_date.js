// <free_field_name>日期选择器</free_field_name>
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
      calendar.push(<div key={`empty-${i}`} className="w-full h-12" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      calendar.push(
        <div
          key={i}
          className={`w-full h-12 flex items-center justify-center border rounded-md cursor-pointer transition-colors duration-200 ${
            selectedDate === date.toLocaleDateString('en-CA')
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'text-gray-800 hover:bg-gray-200'
          }`}
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
