import React, { useState, useEffect } from "react";
import "./styles.css";
import { Schema, getFileData } from "./api";

export default function App() {
  const [text, setText] = useState("");
  const titles = textToTitles(text);

  return (
    <div className="App">
      <h1>Wikimedia Image Parser</h1>
      <h2>Enter file URLs, 1 per line</h2>
      <div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div>
        {titles.map((title) => (
          <EachFile key={title} title={title} />
        ))}
      </div>
    </div>
  );
}

export const EachFile = ({ title }: { title: string }) => {
  const [data, setData] = useState<Schema | undefined>();
  const [error, setError] = useState();
  useEffect(() => {
    setError(undefined);
    setData(undefined); //clear previous
    getFileData(title).then(setData).catch(setError);
  }, [title]);

  return (
    <div>
      {data === undefined ? (
        error === undefined ? (
          <div>Loading...</div>
        ) : (
          <div>
            <h3>Error</h3>
            <p>{JSON.stringify(error)}</p>
          </div>
        )
      ) : (
        <div>{JSON.stringify(data)}</div>
      )}
    </div>
  );
};

export const textToTitles = (text: string) => {
  const urls = text.split("\n");
  return urls.map((url) => url.replace(/.*\/wiki\//, "")).filter((t) => !!t);
};
