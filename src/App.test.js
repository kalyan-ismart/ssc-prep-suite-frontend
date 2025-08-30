import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders SSC Prep Suite', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Updated test to match your app content
  const linkElement = screen.getByText(/SSC Prep Suite/i);
  expect(linkElement).toBeInTheDocument();
});
