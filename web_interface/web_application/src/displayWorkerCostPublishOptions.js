import React from "react";
import { publishWorkerShiftAndWorkerCost } from "./publishMessageToTopic";
export const displayWorkerCostPublishOptions = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div style={{ margin: 10 }}>
        Worker
        <select
          value={scope.state.workerForCostStringified}
          onChange={event => {
            const workerForCost = JSON.parse(event.target.value);
            scope.setState({
              workerForCost,
              workerForCostStringified: event.target.value
            });
          }}
        >
          {scope.state.workerForCostArray.map(worker => {
            return (
              <option value={JSON.stringify(worker)}>
                {worker.workerName}
              </option>
            );
          })}
        </select>
      </div>

      <div style={{ margin: 10 }}>
        Shift for Worker Cost
        <select
          value={scope.state.shiftForWorkerCostStringified}
          onChange={event => {
            const shiftForWorkerCost = JSON.parse(event.target.value);
            scope.setState({
              shiftForWorkerCost,
              shiftForWorkerCostStringified: event.target.value
            });
          }}
        >
          {scope.state.shiftsForWorkerCostArray.map(shift => {
            return (
              <option value={JSON.stringify(shift)}>
                {shift.shiftAddress}
              </option>
            );
          })}
        </select>
      </div>

      <div style={{ flexDirection: "row" }}>
        Worker Cost
        <input
          value={scope.state.workerCost}
          onChange={event => {
            scope.setState({
              workerCost: event.target.value
            });
          }}
        />
      </div>

      <div style={{ margin: 10 }}>
        <button
          style={{
            color: "red"
          }}
          onClick={() => {
            publishWorkerShiftAndWorkerCost(scope.state);
          }}
        >
          Publish Worker, Shift, and Worker Cost
        </button>
      </div>
    </div>
  );
};
