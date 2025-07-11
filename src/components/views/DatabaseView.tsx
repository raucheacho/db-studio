import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useEffect, useState } from "react";
import database from "../../db/initDB";
import QueryResult from "../QueryResult";

import TableList from "../TableList";
import { Tabs, TabsContent } from "../ui/tabs";

interface ColumnInfo {
  cid: number; // Not directly available from information_schema, will be 0 or a placeholder
  name: string;
  type: string;
  notnull: 0 | 1; // Not directly available from information_schema, will be 0 or a placeholder
  dflt_value: unknown; // Changed from any to unknown
  pk: 0 | 1; // Not directly available from information_schema, will be 0 or a placeholder
}

interface ColumnQueryResult {
  column_name: string;
  data_type: string;
}

interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export default function DatabaseView() {
  const [dbSchema, setDbSchema] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedTableData, setSelectedTableData] = useState<
    Record<string, unknown>[]
  >([]);

  useEffect(() => {
    const fetchDbSchema = async () => {
      const { rows: tableNames } = await database.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
      );
      const schema: TableInfo[] = [];
      for (const t of tableNames) {
        const tableName = t.tablename;
        // Query information_schema.columns for column details
        const { rows: columnsInfo } = await database.query(
          `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' ORDER BY ordinal_position;`
        );

        const columns: ColumnInfo[] = columnsInfo.map(
          (col: ColumnQueryResult) => ({
            cid: 0, // Placeholder, as this is SQLite specific
            name: col.column_name,
            type: col.data_type,
            notnull: 0, // Placeholder
            dflt_value: null, // Placeholder
            pk: 0, // Placeholder
          })
        );

        schema.push({
          name: tableName,
          columns: columns,
        });
      }
      setDbSchema(schema);
      if (schema.length > 0) {
        setSelectedTable(schema[0].name);
      }
    };

    fetchDbSchema();
  }, []);

  useEffect(() => {
    const fetchTableData = async () => {
      if (selectedTable) {
        const { rows } = await database.query(
          `SELECT * FROM ${selectedTable} LIMIT 100`
        );
        setSelectedTableData(rows);
      }
    };
    fetchTableData();
  }, [selectedTable]);

  if (!dbSchema.length) return <p>Loading database schema...</p>;

  return (
    <Tabs defaultValue="account">
      <div className="p-4 h-full overflow-auto">
        <TableList
          dbSchema={dbSchema}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
        />
      </div>
      <TabsContent value="account">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={75}>
            <div className="p-4 h-full flex flex-col">
              <div className="flex-1 overflow-auto">
                <QueryResult data={selectedTableData} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TabsContent>
    </Tabs>
  );
}
