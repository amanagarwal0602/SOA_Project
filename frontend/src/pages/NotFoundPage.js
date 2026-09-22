import React from 'react';

const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
    <h1 className="text-4xl font-bold text-amber-700 mb-4">404 - Page Not Found</h1>
    <p className="text-lg text-stone-600 mb-8">Sorry, the page you are looking for does not exist.</p>
    <a href="/" className="px-4 py-2 bg-amber-600 text-white rounded shadow hover:bg-amber-700">Go Home</a>
  </div>
);

export default NotFoundPage;
