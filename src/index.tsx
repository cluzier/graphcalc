import {
  ActionPanel,
  Action,
  showToast,
  useNavigation,
  Toast,
  List,
  LaunchProps,
} from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import React, { useEffect, useState } from "react";
import Graph from "./components/Graph";

interface CommandArguments {
  operation?: string;
}

export default function Command(
  props: LaunchProps<{ arguments: CommandArguments }>,
) {
  const { operation } = props.arguments;
  const [expression, setExpression] = useState<string>(operation || ""); // Initialize with operation if provided
  const {
    value: history,
    setValue: setHistory,
    isLoading: isHistoryLoading,
  } = useLocalStorage<string[]>("history", []);
  const [historyInitialized, setHistoryInitialized] = useState(false);
  const [renderHistorySorted, setRenderHistorySorted] = useState<string[]>([]);

  const renderHistory = history || [];
  const { push } = useNavigation();

  useEffect(() => {
    const currentHistory = history || [];
    setRenderHistorySorted([...currentHistory].sort());
  }, [history]);

  const updateHistory = (expression: string) => {
    setHistory([expression, ...renderHistory.slice(0, 100)]);
  };

  const submit = (expression: string) => {
    updateHistory(expression);
    push(<Graph expression={expression} />);
    setExpression("");
  };

  const handleSubmit = () => {
    if (expression.trim() === "") {
      showToast({
        style: Toast.Style.Failure,
        title: "Validation Error",
        message: "Expression cannot be empty",
      });
      return;
    }
    submit(expression);
  };

  const handleSelect = (selectedExpression: string) => {
    setExpression(selectedExpression);
    submit(selectedExpression);
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast({
      style: Toast.Style.Success,
      title: "History Cleared",
      message: "The history has been successfully cleared.",
    });
  };

  const handleEditExpression = (expr: string) => {
    setExpression(expr);
  };

  useEffect(() => {
    if (!isHistoryLoading && !historyInitialized) {
      setHistoryInitialized(true);
      if (operation) {
        submit(operation);
      }
    }
  }, [isHistoryLoading, historyInitialized, operation]);

  if (isHistoryLoading || !historyInitialized) {
    return (
      <List
        isLoading={true}
        searchBarPlaceholder="Loading..."
        searchText={expression}
        onSearchTextChange={(text) => setExpression(text)}
      />
    );
  }

  const isEmpty = expression.trim() !== "";

  const filteredHistory = isEmpty
    ? renderHistorySorted.filter((expr) => {
        return expr !== expression && expr.includes(expression);
      })
    : renderHistory;

  return (
    <List
      searchBarPlaceholder="Enter an equation or expression (e.g., sin(x))"
      onSearchTextChange={(text) => setExpression(text || "")} // Ensure text is always a string
      searchText={expression} // Ensure searchText is always defined
      selectedItemId={"0"}
    >
      {isEmpty && (
        <List.Item
          key="new"
          id="new"
          title={expression}
          actions={
            <ActionPanel>
              <Action title="Plot Graph" onAction={handleSubmit} />
              <Action title="Clear History" onAction={handleClearHistory} />
            </ActionPanel>
          }
        />
      )}
      {filteredHistory.map((expr, index) => (
        <List.Item
          key={index}
          id={`${index}`}
          title={expr}
          actions={
            <ActionPanel>
              <Action title="Plot Graph" onAction={() => handleSelect(expr)} />
              <Action title="Clear History" onAction={handleClearHistory} />
              <Action
                title="Edit Expression"
                shortcut={{ modifiers: ["cmd"], key: "e" }}
                onAction={() => handleEditExpression(expr)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
