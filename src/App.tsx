import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import Navbar from "./components/Navbar";
import QueryResult from "./components/QueryResult";
import SQLEditor from "./components/SQLEditor";
import DatabaseView from "./components/views/DatabaseView";
import QueryViews from "./components/views/QueryViews";
import database from "./db/initDB";

const initialSchema = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(50),
  role VARCHAR(50)
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title VARCHAR(50),
  body TEXT,
  user_id INTEGER,
  status VARCHAR(50)
  );

INSERT INTO users (id, username, role) VALUES
  (1, 'rauch.acho', 'Admin'),
  (2, 'amira.benali', 'Editor'),
  (3, 'yanis.haddad', 'Viewer'),
  (4, 'sofia.mendes', 'Editor'),
  (5, 'leo.durand', 'Viewer'),
  (6, 'nina.bousquet', 'Admin'),
  (7, 'mehdi.kassimi', 'Viewer'),
  (8, 'claire.joubert', 'Editor'),
  (9, 'ilyes.hamzaoui', 'Viewer'),
  (10, 'eva.laurent', 'Admin')
`;

interface ErrorLocation {
  lineNumber: number;
  columnNumber: number;
}

function findErrorLocation(
  errorMessage: string,
  schema: string
): ErrorLocation | null {
  const match = errorMessage.match(/near "(.*)"/);
  if (match && match[1]) {
    const keyword = match[1];
    const lines = schema.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const columnIndex = line.indexOf(keyword);
      if (columnIndex !== -1) {
        return { lineNumber: i + 1, columnNumber: columnIndex + 1 };
      }
    }
  }
  return null;
}

function App() {
  const [schema, setSchema] = useState(initialSchema);
  const [result, setResult] = useState<Record<string, unknown>[]>([]);

  const [dbError, setDbError] = useState<string | null>(null);
  const [dbErrorLocation, setDbErrorLocation] = useState<ErrorLocation | null>(
    null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        await database.exec(
          "DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS posts;"
        );
        await database.exec(schema);
        setDbError(null);
        setDbErrorLocation(null);
        setRefreshKey((prev) => prev + 1); // Trigger refresh
        toast.success("Database schema updated successfully!");
      } catch (e: unknown) {
        if (e instanceof Error) {
          setDbError(e.message);
          setDbErrorLocation(findErrorLocation(e.message, schema));
          toast.error(`Schema update failed: ${e.message}`);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [schema]);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50}>
              <div className="p-4 h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-2">
                  1. Define Database Structure
                </h2>
                <div className="flex-1">
                  <SQLEditor
                    value={schema}
                    onChange={setSchema}
                    error={dbError}
                    errorLocation={dbErrorLocation}
                  />
                </div>
                {dbError && (
                  <div
                    className="mt-2 p-2 bg-red-500 text-white text-sm rounded-md"
                    title={dbError}
                  >
                    Error: Check your SQL syntax.
                  </div>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <QueryViews setResult={setResult} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50}>
              <div className="p-4 h-full">
                <h2 className="text-lg font-semibold mb-2">2. Define Data</h2>
                <DatabaseView key={refreshKey} />
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div className="p-4 h-full">
                <h2 className="text-lg font-semibold mb-2">Query Result</h2>
                <QueryResult data={result} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </div>
  );
}

export default App;
