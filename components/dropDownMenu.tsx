import { useState } from "react";

function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option : any ) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown">
      <button className="dropdown-button" onClick={toggleDropdown}>
        {selectedOption ? selectedOption : 'Select an option'}
      </button>
      {isOpen && (
        <ul className="drop-down-menu">
          {options.map((option) => (
            <li key={option.value} onClick={() => handleOptionClick(option)}>
              setSelectedOption(option.label)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}