import React, { useRef, useState } from 'react';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

const SearchBar = ({ value, onChange, options, placeholder }: SearchBarProps) => {
  const [isListVisible, setIsListVisible] = useState(false);

  const handleInputClick = () => {
    setIsListVisible(true);
  };

  const handleSelect = (selectedValue: string) => {
    placeholder = selectedValue;
    onChange(selectedValue);
    setIsListVisible(false);
  }

  return (
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
       {/* The CommandInput component is used to create an input field for the command */}
      <CommandInput 
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        onClick={handleInputClick}
        />
      {/* The CommandList component is used to create a list of command items */}
        {isListVisible && (
        <CommandList>
          {/* The CommandGroup component is used to group command items */}
          <CommandGroup heading="Suggestions">
            {/* Map through the options and create a CommandItem for each */}
            {options.map((option) => (
              // Each CommandItem is clickable and triggers the handleSelect function on click
              <CommandItem key={option.value} value={`${option.value} ${option.label}`} onSelect={() => handleSelect(option.value)}>
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;