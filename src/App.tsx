import React,{FC} from 'react';
import AppNavigator from './navigations/AppNavigator';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import {config} from '@gluestack-ui/config';
import {
  QueryClientProvider,
  QueryClient,
  QueryCache,
} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

const client = new QueryClient({
  queryCache: new QueryCache(),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App: FC = () => {
  return (
    <QueryClientProvider client={client}>
      <GluestackUIProvider config={config}>
        <AppNavigator />
      </GluestackUIProvider>
      <Toast />
    </QueryClientProvider>
  );
};

export default App;
