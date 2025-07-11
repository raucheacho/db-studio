import Editor from "@monaco-editor/react";
import { useRef, useEffect } from "react";
import * as monaco from 'monaco-editor';

interface ErrorLocation {
  lineNumber: number;
  columnNumber: number;
}

interface SQLEditorProps {
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  errorLocation?: ErrorLocation | null;
  onSelectionChange?: (selectedText: string) => void;
}

export default function SQLEditor({
  value,
  onChange,
  error,
  errorLocation,
  onSelectionChange,
}: SQLEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    editor.onDidChangeCursorSelection((e) => {
      if (onSelectionChange) {
        const selection = editor.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = editor.getModel()?.getValueInRange(selection) || '';
          onSelectionChange(selectedText);
        } else {
          onSelectionChange('');
        }
      }
    });
  };

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        if (error) {
          const startLine = errorLocation?.lineNumber || 1;
          const startColumn = errorLocation?.columnNumber || 1;
          const endLine = errorLocation?.lineNumber || 1;
          const endColumn = errorLocation?.columnNumber ? model.getLineMaxColumn(errorLocation.lineNumber) : model.getLineMaxColumn(1);

          monacoRef.current.editor.setModelMarkers(model, "owner", [
            {
              startLineNumber: startLine,
              endLineNumber: endLine,
              startColumn: startColumn,
              endColumn: endColumn,
              message: error,
              severity: monacoRef.current.MarkerSeverity.Error,
            },
          ]);
        } else {
          monacoRef.current.editor.setModelMarkers(model, "owner", []);
        }
      }
    }
  }, [error, errorLocation]);

  return (
    <Editor
      height="100%"
      defaultLanguage="sql"
      value={value}
      onChange={(val) => onChange(val || "")}
      onMount={handleEditorDidMount}
      options={{ minimap: { enabled: false }, fontSize: 14 }}
    />
  );
}
