"use client";
import React, { useEffect, useState } from 'react';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

const SearchBar = ({ value, onChange, options, placeholder }: SearchBarProps) => {
  const [isListVisible, setIsListVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Handels the SSR mismatch issue

  // This function handles the click event on the search bar field that will set the drop down list visible
  const handleInputClick = () => {
    if(isListVisible) {
      setIsListVisible(false);
      return;
    }
  
    setIsListVisible(true);
  };

  // This function handles the selection of an option from the drop down list
  // It updates the placeholder and calls the onChange function with the selected value along with closing the drop down
  const handleSelect = (selectedValue: string) => {
    placeholder = selectedValue;
    onChange(selectedValue);
    setIsListVisible(false);
  }

  // This effect is used to set the mounted state to true after the component has been rendered
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Avoid SSR mismatch by checking to make sure that the client has been rendered before trying to render the component
  // This will prevent the component from rendering on the server side
  if (!isMounted) return null;

  return (
    // The Command component is used to create a command palette UI
    <Command className="w-full rounded-xl border border-emerald-200 shadow-lg bg-white text-sm focus-within:ring-2 focus-within:ring-emerald-400 transition-all duration-200 md:w-[450px] min-w-[300px]">
       {/* The CommandInput component is used to create an input field for the search bar */}
       <div onClick={handleInputClick}>
          <CommandInput 
          value={value}
          onValueChange={onChange}
          placeholder={placeholder}
          onClick={handleInputClick}
          className='w-full bg-transparent text-base placeholder-gray-400 focus:outline-none'
          />
        </div>
        {/* The CommandList component is used to display a drop down list for all the possible rooms. 
        This will only render when the list view is set to visible after the search bar is clicked  */}
        {isListVisible && (
        <CommandList className='max-h-60 overflow-auto rounded-b-xl border-t border-gray-100 bg-white'>
          {/* Group the rooms together under a section header called 'Suggestions' */}
          <CommandGroup heading="Suggestions">
            {options.map((option) => (
              <CommandItem key={option.value} value={`${option.value} ${option.label}`} onSelect={() => handleSelect(option.value)}
              className='px-4 py-2 hover:bg-emerald-100 cursor-pointer transition-all'>
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