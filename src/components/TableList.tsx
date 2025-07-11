// TableList.tsx
interface TableListProps {
  dbSchema: { name: string }[];
  selectedTable: string | null;
  onSelectTable: (name: string) => void;
}

export default function TableList({
  dbSchema,
  selectedTable,
  onSelectTable,
}: TableListProps) {
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-lg">Tables</h2>
      <ul className="space-y-1">
        {dbSchema.map((table) => (
          <li key={table.name}>
            <button
              onClick={() => onSelectTable(table.name)}
              className={`px-2 py-1 w-full text-left rounded ${
                selectedTable === table.name
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {table.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
