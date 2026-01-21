/**
 * ResumeContext
 * ==============
 * Global context for sharing resume state across components.
 */

import { createContext, useContext } from 'react';

const ResumeContext = createContext(null);

export function ResumeProvider({ children, value }) {
  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumeContext() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
}

export default ResumeContext;
