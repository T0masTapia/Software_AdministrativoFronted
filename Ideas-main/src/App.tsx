import { BrowserRouter } from "react-router-dom"; // ⬅️ Importa BrowserRouter
import Rutas from "./components/Rutas";
import './index.css';

function App() {
  return (
    <BrowserRouter> 
      <Rutas />
    </BrowserRouter>
  );
}

export default App;
