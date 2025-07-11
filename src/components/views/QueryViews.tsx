import database from "@/db/initDB";
import { useState } from "react";
import { toast } from "sonner";
import SQLEditor from "../SQLEditor";
import { Button } from "../ui/button";

const QueryViews = ({ setResult }) => {
  const [sql, setSql] = useState("SELECT * FROM users;");
  const [selectedSql, setSelectedSql] = useState<string>("");

  const [queryLoading, setQueryLoading] = useState(false);
  const [queryRowCount, setQueryRowCount] = useState<number | null>(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(
    null
  );

  const runQuery = async () => {
    setQueryLoading(true);
    setQueryRowCount(null);
    setQueryExecutionTime(null);
    const startTime = performance.now();
    const queryToExecute = selectedSql || sql;

    try {
      const { rows } = await database.query(queryToExecute);
      const endTime = performance.now();
      setResult(rows);
      setQueryRowCount(rows.length);
      setQueryExecutionTime(endTime - startTime);
      toast.success("Query executed successfully!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(`Query failed: ${e.message}`);
        setResult([]);
      }
    } finally {
      setQueryLoading(false);
    }
  };
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2">3. Write SQL Query</h2>
      <div className="flex-1">
        <SQLEditor
          value={sql}
          onChange={setSql}
          onSelectionChange={setSelectedSql}
        />
      </div>
      <div className="flex items-center mt-2">
        <Button onClick={runQuery} loading={queryLoading}>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3l14 9-14 9V3z"
            />
          </svg>
          {selectedSql ? "Execute Selection" : "Run"}
        </Button>
        {queryRowCount !== null && queryExecutionTime !== null && (
          <span className="ml-4 text-sm text-gray-600">
            {queryRowCount} rows returned. Executed in{" "}
            {queryExecutionTime.toFixed(2)} ms.
          </span>
        )}
      </div>
    </div>
  );
};

export default QueryViews;
