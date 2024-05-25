import {
  ActionPanel,
  Action,
  showToast,
  useNavigation,
  Toast,
  List,
} from "@raycast/api";
import { useLocalStorage } from "@raycast/utils";
import React, { useState } from "react";
import Graph from "./components/Graph";
import FeedbackForm from "./components/FeedbackForm";

export default function Command() {
  const [expression, setExpression] = useState("");
  const { value: history, setValue: setHistory } = useLocalStorage<string[]>(
    "history",
    [],
  );
  const [showFeedbackForm, setShowFeedbackForm] = useState(false); // Track whether to display the feedback form
  const renderHistory = history || [];
  const { push } = useNavigation();

  const updateHistory = (expression: string) => {
    setHistory([expression, ...renderHistory.slice(0, 100)]);
  };

  const submit = (expression: string) => {
    updateHistory(expression);
    push(<Graph expression={expression} history={history || []} />);
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

  // const handleFeedback = () => {
  //   // Set the state to display the feedback form
  //   setShowFeedbackForm(true);
  // };

  const handleCloseFeedbackForm = () => {
    // Set the state to hide the feedback form
    setShowFeedbackForm(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    showToast({
      style: Toast.Style.Success,
      title: "History Cleared",
      message: "The history has been successfully cleared.",
    });
  };

  const filteredHistory =
    expression.trim() !== ""
      ? renderHistory
          .filter((expr) => {
            const exprLowerCase = expr.toLowerCase();
            const expressionLowerCase = expression.toLowerCase();
            return (
              expressionLowerCase !== exprLowerCase &&
              exprLowerCase.includes(expressionLowerCase.toLowerCase())
            );
          })
          .sort()
      : renderHistory;

  return (
    <>
      {!showFeedbackForm ? (
        <List
          searchBarPlaceholder="Enter an equation or expression (e.g., sin(x))"
          onSearchTextChange={setExpression}
          searchText={expression}
        >
          {expression.trim() !== "" && (
            <List.Item
              key="new"
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
              title={expr}
              actions={
                <ActionPanel>
                  <Action
                    title="Plot Graph"
                    onAction={() => handleSelect(expr)}
                  />
                  <Action title="Clear History" onAction={handleClearHistory} />
                  {/* <Action title="Provide Feedback" onAction={handleFeedback} /> */}
                </ActionPanel>
              }
            />
          ))}
        </List>
      ) : (
        <FeedbackForm onClose={handleCloseFeedbackForm} />
      )}
    </>
  );
}
