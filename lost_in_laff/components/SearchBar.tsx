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
    <Command className="rounded-lg border shadow-md md:min-w-[450px]">
       {/* The CommandInput component is used to create an input field for the search bar */}
        <CommandInput 
        value={value}
        onValueChange={onChange}
        placeholder={placeholder}
        onClick={handleInputClick}
        />
        {/* The CommandList component is used to display a drop down list for all the possible rooms. 
        This will only render when the list view is set to visible after the search bar is clicked  */}
        {isListVisible && (
        <CommandList>
          {/* Group the rooms together under a section header called 'Suggestions' */}
          <CommandGroup heading="Suggestions">
            {options.map((option) => (
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