import {
  ActionPanel,
  Form,
  Action,
  showToast,
  useNavigation,
  Toast,
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
  const { push } = useNavigation();

  const updateHistory = (expression: string) => {
    const currentHistory = history || [];
    setHistory([expression, ...currentHistory.slice(0, 100)]);
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
    // If validation passes, navigate to the Graph component
    updateHistory(expression);
    push(<Graph expression={expression} history={history || []} />);
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

  return (
    <>
      {!showFeedbackForm ? (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm title="Plot Graph" onSubmit={handleSubmit} />
              <Action title="Clear History" onAction={handleClearHistory} />
              {/* <Action title="Provide Feedback" onAction={handleFeedback} /> */}
            </ActionPanel>
          }
        >
          <Form.TextField
            id="expression"
            placeholder="Enter an equation or expression (e.g., sin(x))"
            value={expression}
            onChange={setExpression}
          />
        </Form>
      ) : (
        <FeedbackForm onClose={handleCloseFeedbackForm} />
      )}
    </>
  );
}
