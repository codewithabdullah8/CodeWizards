import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProfessionalHome from "./pages/ProfessionalDiary/Home";
import NewEntry from "./pages/ProfessionalDiary/NewEntry";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Professional Diary */}
        <Route path="/professional" element={<ProfessionalHome />} />
        <Route path="/professional/new" element={<NewEntry />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
