import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import store from './app/store';
import router from './app/router';
import { SidebarProvider } from './context/SidebarContext';

export function App() {
  return (
    <Provider store={store}>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </Provider>
  );
}

export default App;

