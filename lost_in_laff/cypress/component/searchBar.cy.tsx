import React from 'react';
import SearchBar from '../../components/searchBar';

describe('SearchBar Component Option Sorting', () => {
  it('should sort room options into correct floor groups', () => {
    // Mock room options
    const mockOptions = [
      {value: 'entrances-Entrance 3', label: 'Entrance 3 (Shamrock, Entrance)'},
      {value: 'basement-W0005', label: 'W0005 (MSP,Mizzou,Space,Program,Aero,Tigers,Club)'},
      {value: 'firstLevel-E1509', label: 'E1509 '},
      {value: 'secondLevel-C2207', label: 'C2207 (Research,Lab)'},
      {value: 'thirdLevel-C3202', label: 'C3202 '}
    ];

    // Mount component
    cy.mount(
      <SearchBar
        value=""
        onChange={() => {}}
        options={mockOptions}
        placeholder="Select a room"
      />
    );

    // Click to open the dropdown
    cy.get('input[placeholder="Select a room"]').click();

    // Check each floor group exists and contains correct rooms
    cy.get('div').contains('Entrances')
      .parent()
      .find('[class*="px-4 py-2"]')
      .should('contain', 'Entrance 3');

    cy.get('div').contains('Basement')
      .parent()
      .find('[class*="px-4 py-2"]')
      .should('contain', 'W0005');

    cy.get('div').contains('First Floor')
      .parent()
      .find('[class*="px-4 py-2"]')
      .should('contain', 'E1509');

    cy.get('div').contains('Second Floor')
      .parent()
      .find('[class*="px-4 py-2"]')
      .should('contain', 'C2207');

    cy.get('div').contains('Third Level')
      .parent()
      .find('[class*="px-4 py-2"]')
      .should('contain', 'C3202');
  });
});