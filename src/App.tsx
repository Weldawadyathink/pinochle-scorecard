import { useState } from "react";
import { PinochleRoundEditor } from "./components/PinochleRoundEditor";
import { PinochleRound } from "./shared/PinochleRound";

export default function App() {
  const [data, setData] = useState(new PinochleRound());

  return (
    <div className="container max-w-xl mx-auto p-6">
      <PinochleRoundEditor data={data} onChange={(d) => setData(d)} />
    </div>
  );
}
