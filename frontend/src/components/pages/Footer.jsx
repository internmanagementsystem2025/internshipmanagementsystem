import React from 'react';

export const Footer = ({ darkMode }) => {
  return (
    <footer
      className={`py-3 text-center text-sm font-weight-medium border-top border-light shadow-sm ${
        darkMode ? "bg-dark text-white" : "bg-white text-black border-dark"
      }`}
    >
      Copyright © {new Date().getFullYear()}{' '}
      <span className="text-primary">Mobitel (Pvt) Ltd.</span> All rights reserved.
    </footer>
  );
};
