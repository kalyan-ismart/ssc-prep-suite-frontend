import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders SarkariSuccess-Hub', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Update to match new dashboard content
  const linkElement = screen.getByText(/SarkariSuccess-Hub/i);
  expect(linkElement).toBeInTheDocument();
});