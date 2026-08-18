import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";
import AuthLoader from "./components/auth/AuthLoader";

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <AuthLoader>
        <AppRouter />
      </AuthLoader>
    </>
  );
}

export default App;