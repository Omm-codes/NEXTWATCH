import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main navigation', () => {
  render(<App />);
  expect(screen.getByText('Home')).toBeInTheDocument();
});
