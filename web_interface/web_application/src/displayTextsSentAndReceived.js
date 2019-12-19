import React, { Component } from "react";

import firebase from "firebase";

import Button from "@material-ui/core/Button";

// import aws from "aws-sdk";

export const displayTextsSentAndReceived = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div>Sent Messages</div>
      {scope.state.twilioSentTextArray.map(response => {
        return (
          <div>
            {" To "}
            {response.twilioSentText.name} {" was sent "}
            {response.twilioSentText.body}{" "}
          </div>
        );
      })}
      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={() => {
          firebase
            .database()
            .ref("/twilioSentText/")
            .remove();
        }}
      >
        Delete all SENT texts
      </Button>
      <div>Text Message Responses</div>
      <div style={{ color: "white" }}>
        {scope.state.twilioResponseTextArray.map(response => {
          let matchedWorkerFromDatabase = "";
          let workerProfilePhotoUrl = "";
          for (
            let i = 0;
            i < scope.state.workerNameAndPhoneNumberArray.length;
            i++
          ) {
            if (
              (scope.state.workerNameAndPhoneNumberArray[i].workerPhoneNumber &&
                scope.state.workerNameAndPhoneNumberArray[
                  i
                ].workerPhoneNumber.includes(
                  response.twilioResponseText.From
                )) ||
              (response.twilioResponseText.From &&
                response.twilioResponseText.From.includes(
                  scope.state.workerNameAndPhoneNumberArray[i].workerPhoneNumber
                ))
            ) {
              matchedWorkerFromDatabase =
                scope.state.workerNameAndPhoneNumberArray[i].workerName;

              for (
                let j = 0;
                j <
                scope.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                j++
              ) {
                // console.log(
                //   scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                // );
                if (
                  scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .workerName == matchedWorkerFromDatabase &&
                  scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .key == "profilePhotoUrl"
                ) {
                  workerProfilePhotoUrl =
                    scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .value;
                  // console.log(
                  //   scope.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                  //     .value
                  // );
                }
              }
            }
          }

          for (
            let i = 0;
            i < scope.state.managerNameAndPhoneNumberArray.length;
            i++
          ) {
            if (
              (response.twilioResponseText.From &&
                response.twilioResponseText.From.includes(
                  scope.state.managerNameAndPhoneNumberArray[i]
                    .managerPhoneNumber
                )) ||
              (scope.state.managerNameAndPhoneNumberArray[i]
                .managerPhoneNumber &&
                scope.state.managerNameAndPhoneNumberArray[
                  i
                ].managerPhoneNumber.includes(response.twilioResponseText.From))
            ) {
              matchedWorkerFromDatabase =
                scope.state.managerNameAndPhoneNumberArray[i].managerName;
            }
          }

          for (
            let i = 0;
            i < scope.state.workerNameAndPhoneNumberBannedArray.length;
            i++
          ) {
            // console.log(scope.state.workerNameAndPhoneNumberBannedArray);
            if (
              (response.twilioResponseText.From &&
                response.twilioResponseText.From.includes(
                  scope.state.workerNameAndPhoneNumberBannedArray[i]
                    .workerPhoneNumber
                )) ||
              (scope.state.workerNameAndPhoneNumberBannedArray[i]
                .workerPhoneNumber &&
                scope.state.workerNameAndPhoneNumberBannedArray[
                  i
                ].workerPhoneNumber.includes(response.twilioResponseText.From))
            ) {
              matchedWorkerFromDatabase =
                "BANNED WORKER " +
                scope.state.workerNameAndPhoneNumberBannedArray[i].workerName;
            }
          }

          if (
            !response.twilioResponseText.Body.replace(/\+/g, "%20")
              .toLowerCase()
              .includes(" no ")
          ) {
            return (
              <div>
                {workerProfilePhotoUrl && (
                  <img
                    src={workerProfilePhotoUrl}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: 50,
                      width: 50,
                      margin: 10
                    }}
                  />
                )}
                {matchedWorkerFromDatabase}
                {" AT "}
                {response.twilioResponseText.From.substring(
                  3,
                  response.twilioResponseText.From.length
                )}
                {" SAID "}
                {/* {response.twilioResponseText.Body.split("+").join(" ")} */}
                {decodeURIComponent(
                  response.twilioResponseText.Body.replace(/\+/g, "%20")
                )}

                {" ON "}
                {response.twilioResponseText.dateAndTimeAdded}

                <Button
                  style={{ backgroundColor: "red", textTransform: "none" }}
                  onClick={() => {
                    scope.setState({
                      workerPhoneNumber: response.twilioResponseText.From.substring(
                        4,
                        response.twilioResponseText.From.length
                      ),
                      workerName: matchedWorkerFromDatabase
                    });
                  }}
                >
                  Set Worker
                  {" " +
                    response.twilioResponseText.From.substring(
                      3,
                      response.twilioResponseText.From.length
                    )}
                </Button>
                <Button
                  style={{ backgroundColor: "red", textTransform: "none" }}
                  onClick={() => {
                    scope.setState({
                      managerPhoneNumber: response.twilioResponseText.From.substring(
                        4,
                        response.twilioResponseText.From.length
                      ),
                      managerName: matchedWorkerFromDatabase
                    });
                  }}
                >
                  Set Manager
                  {" " +
                    response.twilioResponseText.From.substring(
                      3,
                      response.twilioResponseText.From.length
                    )}
                </Button>

                {/* <Button
                  style={{ backgroundColor: "red", textTransform: "none" }}
                  onClick={() => {
                    let stringWithBid = decodeURIComponent(
                      response.twilioResponseText.Body.replace(/\+/g, "%20")
                    );
                    let bid = "";

                    for (var i = 0; i < stringWithBid.length; i++) {
                      if (stringWithBid.charAt(i) == "$") {
                        // console.log(i);
                        let j = 1;

                        while (
                          stringWithBid.charAt(i + j) != " " &&
                          i + j <= stringWithBid.length
                        ) {
                          bid += stringWithBid.charAt(i + j);
                          j++;
                        }
                      }
                    }

                    scope.setState({ shiftLowestPayment: bid });
                  }}
                >
                  SET BID From DOLLAR($)
                  {" " +
                    decodeURIComponent(
                      response.twilioResponseText.Body.replace(/\+/g, "%20")
                    )}{" "}
                  as SHIFT LOWEST PAYMENT
                </Button> */}

                {/* <Button
                  style={{ backgroundColor: "red", textTransform: "none" }}
                  onClick={() => {
                    let stringWithBid = decodeURIComponent(
                      response.twilioResponseText.Body.replace(/\+/g, "%20")
                    );
                    let bid = "";

                    if (!isNaN(parseFloat(stringWithBid))) {
                      bid = parseFloat(stringWithBid);
                    }

                    console.log(bid);
                    scope.setState({ shiftLowestPayment: bid });
                  }}
                >
                  SET BID From FLOAT
                  {" " +
                    decodeURIComponent(
                      response.twilioResponseText.Body.replace(/\+/g, "%20")
                    )}{" "}
                  as SHIFT LOWEST PAYMENT
                </Button> */}

                <Button
                  style={{ backgroundColor: "red", textTransform: "none" }}
                  onClick={() => {
                    firebase
                      .database()
                      .ref("/twilioResponseText/" + response.childKey)
                      .remove();
                  }}
                >
                  Delete this message
                </Button>
              </div>
            );
          }
        })}
      </div>
      <Button
        style={{ backgroundColor: "red", textTransform: "none" }}
        onClick={() => {
          firebase
            .database()
            .ref("/twilioResponseText/")
            .remove();
        }}
      >
        Delete all texts
      </Button>
    </div>
  );
};
