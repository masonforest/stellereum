import {useState} from "react";
import logo from "./logo.svg";
import "bootstrap/dist/css/bootstrap.css";
import Sidebar from "./Sidebar";
import OrderBook from "./OrderBook";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Sidebar />
      <main>
       <OrderBook /> 
      </main>
    </>
  );
}

export default App;
