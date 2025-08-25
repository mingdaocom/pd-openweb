// <free_field_name>选项按钮组</free_field_name>
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
          className={`flex-1 h-10 border rounded-md ${
            selectedValue.includes(option.key) ? 'bg-[#1677ff] text-white' : 'bg-white text-[#151515] border-gray-300'
          }`}
          onClick={() => handleToggle(option.key)}
        >
          {option.value}
        </button>
      ))}
    </div>
  );
}
