import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the loading context
const LoadingContext = createContext<{
  loading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}>({
  loading: false,
  showLoading: () => {},
  hideLoading: () => {},
});

// Provider component to wrap the app
export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  // Functions to show and hide the loading spinner
  const showLoading = useCallback(() => setLoading(true), []);
  const hideLoading = useCallback(() => setLoading(false), []);

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to access loading functions from any component
export const useLoading = () => useContext(LoadingContext);
