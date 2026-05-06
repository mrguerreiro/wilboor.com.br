import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText(/produtos/i)).toBeInTheDocument();
  expect(screen.getByText(/adicionar produto/i)).toBeInTheDocument();
  expect(screen.getByText(/checkout/i)).toBeInTheDocument();
});
