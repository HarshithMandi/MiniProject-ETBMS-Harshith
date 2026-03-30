import React from 'react';

export const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-2 text-red-700 font-bold">
          ✕
        </button>
      )}
    </div>
  );
};

export const SuccessMessage = ({ message, onDismiss }) => {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-2 text-green-700 font-bold">
          ✕
        </button>
      )}
    </div>
  );
};
