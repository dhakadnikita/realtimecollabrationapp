import logo from './logo.svg';
import './App.css';
import Home from "./component/Home";
import{Routes,Route} from 'react-router-dom';
import EditorPage from './component/EditorPage';
import {Toaster} from 'react-hot-toast';

function App() {
  return (
    <>
    <Toaster position="top-center"></Toaster>
    <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/editor/:roomId" element={<EditorPage/>}/>
      </Routes>
      
    </>
  );
}

export default App;
