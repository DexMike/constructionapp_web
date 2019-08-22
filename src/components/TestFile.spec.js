import React from 'react';
import { shallow } from 'enzyme';
import TestFile from './TestFile';

describe('<TestFile />', () => {
  it('renders correctly', () => {
    const wrapper = shallow(
      <TestFile />
    );
    expect(wrapper.find('h1').length).toBe(1);
  });
});
