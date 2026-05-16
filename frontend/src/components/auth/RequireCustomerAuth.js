import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireCustomerAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('customerToken');

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
          reason: 'checkout'
        }}
      />
    );
  }

  return children;
}
