import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast show`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className={`toast-header bg-${toast.type} text-white`}>
              <strong className="me-auto">
                {toast.type === 'success' && 'Success'}
                {toast.type === 'error' && 'Error'}
                {toast.type === 'warning' && 'Warning'}
                {toast.type === 'info' && 'Info'}
              </strong>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => removeToast(toast.id)}
              ></button>
            </div>
            <div className="toast-body">
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};