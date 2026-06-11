import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { MainContent } from './components/layout/MainContent';
import { HomePage } from './pages/HomePage';

function App(): JSX.Element {
  return (
    <AppShell>
      <Header />
      <MainContent>
        <HomePage />
      </MainContent>
    </AppShell>
  );
}

export default App;

