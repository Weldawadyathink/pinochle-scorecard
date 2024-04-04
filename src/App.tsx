import { useState } from "react";
import { PinochleGame } from "@/shared/PinochleGame";
import { PinochleGameEditor } from "./components/PinochleGameEditor";

export default function App() {
  const [data, setData] = useState(new PinochleGame());

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <PinochleGameEditor data={data} onChange={(d) => setData(d)} />
    </div>
  );
}
