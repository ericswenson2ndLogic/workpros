import React, { Component } from "react";

import firebase from "firebase";

import { displayWorkerPublishOptions } from "./displayWorkerPublishOptions";
import { displayManagerPublishOptions } from "./displayManagerPublishOptions";
import { displayShiftPublishOptions } from "./displayShiftPublishOptions";

import { displayManagerPaymentPublishOptions } from "./displayManagerPaymentPublishOptions";
import { pullWorkersManagersAndShiftsFromDatabase } from "./pullFromDatabase";

import aws from "aws-sdk";

import { displayRestaurantPublishOptions } from "./displayRestaurantPublishOptions";

import Sound from "react-sound";

import { displayTextsSentAndReceived } from "./displayTextsSentAndReceived";
import { displayBidEnd } from "./displayBidEnd";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Select from "@material-ui/core/Select";

import MenuItem from "@material-ui/core/MenuItem";

import displayHerokuOptions from "./displayHerokuOptions";

import translate from "translate";

const moment = require("moment-timezone");

const defaultAvailability = {
  fromHour: "12",
  fromMinute: "01",
  fromMeridiem: "am",
  untilHour: "11",
  untilMinute: "59",
  untilMeridiem: "pm"
};

class App extends Component {
  componentWillMount() {
    var config = {
      apiKey: "AIzaSyB0de8yvMMUGYycwbM_XmSzjUmPIJUe1Os",
      authDomain: "workersmanagersandshifts.firebaseapp.com",
      databaseURL: "https://workersmanagersandshifts.firebaseio.com",
      projectId: "workersmanagersandshifts",
      storageBucket: "workersmanagersandshifts.appspot.com",
      messagingSenderId: "455964994205"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    pullWorkersManagersAndShiftsFromDatabase(this);
  }

  _onMouseMove(e) {
    this.setState({ x: e.screenX, y: e.screenY });
  }

  render() {
    const client = {
      sandbox:
        "Afcdxz6OC-LzorE3l1EyROnKyKRvzc5qrvOElmy6jLuFQJflldhjlQkc2F-6KHSnSlS4nrpIk0ZytlVJ",
      production:
        "ATpFWgr8q9vcJ72FGFxwplM6HJYZw5PBnCQ4eePbHYO9vcc7DyylaC7Qx-yM12Ib-qfX2EpUtHqMJwEv"
    };

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#252525",
          color: "red",
          flexDirection: "column"
        }}
        onMouseMove={this._onMouseMove.bind(this)}
      >
        {this.state.playDrum6 && (
          <Sound
            url={require("./Drum6.mp3")}
            playStatus={Sound.status.PLAYING}
            onLoading={() => {
              console.log("snth");
            }}
            onPlaying={() => {}}
            onFinishedPlaying={() => {}}
            loop={false}
          />
        )}
        <div
          style={{
            justifyContent: "center",
            flexDirection: "column",
            display: "flex",
            alignItems: "center"
          }}
        >
          <div>{this.state.error}</div>
          <div>{this.state.countCostByDateArray.length}</div>

          <Button
            onClick={async () => {
              // const text = await translate("Hello world", "es");
              // console.log(text); // Hola mundo

              // // Promises with .then(). Options can  also be an object
              // translate("こんにちは世界", { from: "ja", to: "es" }).then(
              //   text => {
              //     console.log(text); // Hola mundo
              //   }
              // );

              const event = {
                textToTranslate: "hello"
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              var params = {
                FunctionName: "english_to_spanish",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(event)
              };

              let lambdaPromise = lambda.invoke(params).promise();

              let response = await lambdaPromise;

              console.log(JSON.parse(response.Payload.translatedText));

              this.setState({
                translationResponse: JSON.stringify(response.Payload)
              });
            }}
          >
            translate something
          </Button>
          {this.state.translationResponse}
          <Button
            onClick={async () => {
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              var params = {
                FunctionName: "delete_count_cost_by_date",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify()
              };

              let lambdaPromise = lambda.invoke(params).promise();

              let value = await lambdaPromise;
            }}
          >
            Delete Count Cost by Date Array
          </Button>
          {displayTextsSentAndReceived(this)}
          <Button
            onClick={() => {
              this.setState({ autoRespondName: !this.state.autoRespondName });
            }}
          >
            Auto Respond Name {this.state.autoRespondName ? "True" : "False"}
          </Button>

          <div>
            <TextField
              id="standard-with-placeholder"
              label="Shift Lowest Payment"
              placeholder="35$"
              margin="normal"
              value={this.state.shiftLowestPayment}
              onChange={event => {
                this.setState({
                  shiftLowestPayment: event.target.value
                });
              }}
            />
          </div>
          <Button
            style={{ backgroundColor: "red", textTransform: "none" }}
            onClick={() => {
              this.setState({
                displayHerokuOptions: !this.state.displayHerokuOptions
              });
            }}
          >
            Display Heroku Options
          </Button>

          {this.state.displayHerokuOptions && displayHerokuOptions(this)}
          <Button
            onClick={async () => {
              const Payload = {
                managerName: this.state.managerName,
                managerEmail: this.state.managerEmail
              };
              let params = {
                FunctionName: "manager_name_email",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };
              var lambda = new aws.Lambda({
                region: "us-east-1"
              });
              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              const saveManagerAndEmailResponse =
                "Successfully saved " +
                this.state.managerName +
                " " +
                this.state.managerEmail;

              this.setState({ saveManagerAndEmailResponse });
            }}
          >
            Save Manager Name {this.state.managerName} and Email{" "}
            {this.state.managerEmail}
          </Button>
          {this.state.saveManagerAndEmailResponse}
          <TextField
            type="text"
            placeholder="manageremail@restaurant.com"
            value={this.state.managerEmail}
            onChange={event => this.set(event, "managerEmail")}
          />
          <Button
            style={{ backgroundColor: "red", textTransform: "none" }}
            onClick={() => {
              this.setState({
                autoRespondWithWinning: !this.state.autoRespondWithWinning
              });
            }}
          >
            Flip Auto Respond State{" "}
            {this.state.autoRespondWithWinning ? "ON" : "OFF"}
            `Hi${this.state.workerAdditionalTitle} workerName, for the $
            {this.state.shiftLength} shift on ${this.state.shiftStartDayName} 📆
            at ${this.state.shiftStartTimeHour}:$
            {this.state.shiftStartTimeMinute} $
            {this.state.shiftStartTimeMeridiem} 🕒 at location $
            {this.state.shiftAddress} 📍 you are WINNING 🥇 with $$
            {this.state.shiftLowestPayment}. The opportunity to submit a lower
            rate ENDS at ${this.state.biddingEndTime} at which point in time
            your bid will be sent to the manager for confirmation.` and `✋ Hi$
            {this.state.losingWorkerAdditionalTitle} ${Worker.WorkerName} 🤵,
            for the WORK on ${this.state.shiftStartDayName} at $
            {this.state.shiftStartTimeHour}:${this.state.shiftStartTimeMinute} $
            {this.state.shiftStartTimeMeridiem} at location $
            {this.state.shiftAddress} 📍, the current LOWEST TOTAL PRICE is $$
            {this.state.shiftLowestPayment} by$
            {this.state.workerAdditionalTitle} workerName. Please reply with any
            LOWER TOTAL 💰 dollar amount that you are willing to work for by $
            {this.state.biddingEndTime} 🕔.`
          </Button>
          <Button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              this.setState({
                firstTimeManager: !this.state.firstTimeManager
              });
            }}
          >
            First Time Manager is {this.state.firstTimeManager + ""}
          </Button>

          <Button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              this.setState({
                showBidEndOptions: !this.state.showBidEndOptions
              });
            }}
          >
            Show Bid End Options {this.state.showBidEndOptions ? "yes" : "no"}
          </Button>
          {this.state.showBidEndOptions && displayBidEnd(this)}

          <Button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              this.setState({
                ignoreUnderTwenty: !this.state.ignoreUnderTwenty
              });
            }}
          >
            Ignore Under Twenty is {this.state.ignoreUnderTwenty + ""}
          </Button>

          <div style={{ margin: 10 }}>
            Worker Sorted ALPHABETICAL
            <Select
              value={this.state.workerNameAndPhoneNumberStringified}
              onChange={event => {
                this.setState({
                  workerNameAndPhoneNumber: JSON.parse(event.target.value),
                  workerNameAndPhoneNumberStringified: event.target.value,
                  workerName: JSON.parse(event.target.value).workerName,
                  workerPhoneNumber: JSON.parse(event.target.value)
                    .workerPhoneNumber
                });
              }}
            >
              {this.state.workerNameAndPhoneNumberArrayAlphabetical
                .sort(function(a, b) {
                  return a.workerName.localeCompare(b.workerName);
                })
                .map(workerNameAndPhoneNumber => {
                  return (
                    <MenuItem value={JSON.stringify(workerNameAndPhoneNumber)}>
                      {workerNameAndPhoneNumber.workerName}{" "}
                      {workerNameAndPhoneNumber.workerPhoneNumber}
                    </MenuItem>
                  );
                })}
            </Select>
          </div>

          <Button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              this.setState({
                displayWorkerOptions: !this.state.displayWorkerOptions
              });
            }}
          >
            display worker options
          </Button>
          {this.state.displayWorkerOptions && displayWorkerPublishOptions(this)}

          <Button
            onClick={async () => {
              for (
                let i = 4;
                i < this.state.workerNameAndPhoneNumberArrayDallas.length;
                // i < 4;
                i++
              ) {
                let worker = this.state.workerNameAndPhoneNumberArrayDallas[i];

                var workerPhotoCode =
                  Math.floor(100000 + Math.random() * 900000) + "";
                // this.setState({ workerPhotoCode: val + "" });

                console.log(worker);

                // if (worker.workerName.includes("Los Angeles")) {
                const Payload = {
                  workerName: worker.workerName,
                  workerPhoneNumber: worker.workerPhoneNumber,
                  workerPhotoCode: workerPhotoCode
                };

                let params = {
                  FunctionName: "worker_photo_code",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(Payload)
                };

                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                let lambdaPromise = lambda.invoke(params).promise();

                const response = await lambdaPromise;

                const saveWorkerNameNumberAndPhotoResponse =
                  "Successfully saved " +
                  worker.workerName +
                  " " +
                  worker.workerPhoneNumber +
                  " with worker photo code " +
                  workerPhotoCode;

                this.setState({ saveWorkerNameNumberAndPhotoResponse });

                let textMessage = `please complete your profile here with items such as your email, preferred job type and workpro duo ${
                  worker.workerName
                },  ${`https://www.workpros.io/?code=${workerPhotoCode}`}`;

                // const textMessage = `${scope.state.competingWorker} has completed his worker profile`;

                const event = {
                  textToTranslate: textMessage
                };

                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                var paramsForTranslate = {
                  FunctionName: "english_to_spanish",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(event)
                };

                let lambdaPromiseForTranslate = lambda
                  .invoke(paramsForTranslate)
                  .promise();

                let responseFromLambda = await lambdaPromiseForTranslate;

                console.log(responseInSpanish);

                let responseInSpanish = JSON.parse(responseFromLambda.Payload)
                  .translatedText;

                // let messageForDistribution = textForDistribution(
                //   Worker.workerName,
                //   travelTimeByCar
                // );

                for (
                  let j = 0;
                  j <
                  this.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                  j++
                ) {
                  console.log(
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                  );
                  if (
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .key == "workerLanguage" &&
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .value == "Spanish" &&
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .workerName == worker.workerName
                  ) {
                    console.log(
                      this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                        .value
                    );
                    textMessage = responseInSpanish;
                  }
                }

                // for (
                //   let i = 0;
                //   i <
                //   this.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                //   i++
                // ) {
                //   if (
                //     this.state.workerNameAndPhoneNumberAndShiftCountArray[i]
                //       .key == "workerLanguage" && this.state.workerNameAndPhoneNumberAndShiftCountArray[i].value == "Spanish"
                //   ) {

                //   }
                // }

                const PayloadForText = {
                  body: textMessage.toLowerCase(),
                  phoneNumber: worker.workerPhoneNumber
                };

                let paramsForText = {
                  FunctionName: "send_text",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(PayloadForText)
                };

                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                let lambdaPromiseForText = lambda
                  .invoke(paramsForText)
                  .promise();

                const responseForText = await lambdaPromiseForText;

                await this.SaveSentToDatabase(
                  PayloadForText,
                  worker.workerName
                );

                this.setState({
                  responseFromWorkerPhotoCodeSend:
                    "success sending link to worker to upload photo with text message: " +
                    textMessage
                });

                // this.setState({ saveWorkerNameNumberAndPhotoResponse });
                // }
              }
            }}
          >
            ASK ALL WORKERS in City for Photo with unique code
            {/* {this.state.workerName} {this.state.workerPhoneNumber}{" "}
            {this.state.workerPhotoCode} */}
          </Button>

          <Button
            onClick={async () => {
              let arrayOfWorkersNotMissing = [];
              for (
                let i = 0;
                i < this.state.workerNameAndPhoneNumberArray.length;
                // i < 22;
                i++
              ) {
                let worker = this.state.workerNameAndPhoneNumberArray[i];

                // var workerPhotoCode =
                //   Math.floor(1000 + Math.random() * 9000) + "";
                // // this.setState({ workerPhotoCode: val + "" });

                // console.log(worker);

                // // if (worker.workerName.includes("Los Angeles")) {
                // const Payload = {
                //   workerName: worker.workerName,
                //   workerPhoneNumber: worker.workerPhoneNumber,
                //   workerPhotoCode: workerPhotoCode
                // };

                // let params = {
                //   FunctionName: "worker_photo_code",
                //   InvocationType: "RequestResponse",
                //   LogType: "Tail",
                //   Payload: JSON.stringify(Payload)
                // };

                // var lambda = new aws.Lambda({
                //   region: "us-east-1"
                // });

                // let lambdaPromise = lambda.invoke(params).promise();

                // const response = await lambdaPromise;

                // const saveWorkerNameNumberAndPhotoResponse =
                //   "Successfully saved " +
                //   worker.workerName +
                //   " " +
                //   worker.workerPhoneNumber +
                //   " with worker photo code " +
                //   workerPhotoCode;

                // this.setState({ saveWorkerNameNumberAndPhotoResponse });

                let addedItems = [];

                for (
                  let j = 0;
                  j <
                  this.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                  j++
                ) {
                  // console.log(
                  //   this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                  // );
                  // console.log(worker.workerName);

                  if (
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .workerName == worker.workerName
                  ) {
                    // console.log("worker has added an item");
                    // console.log(
                    //   this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    // );
                    addedItems.push(
                      this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                        .key
                    );
                  }
                }

                if (addedItems.length > 0) {
                  console.log(worker.workerName);
                  console.log(addedItems);
                }

                const arrayOfRequired = [
                  "workerEmail",
                  "workerShiftJobTypes",
                  "workerPaymentStrategy",
                  "workerPaymentStrategyUsername",
                  "workerShiftJobTypes"
                ];

                let missingItems = [];

                for (let j = 0; j < arrayOfRequired.length; j++) {
                  if (!addedItems.includes(arrayOfRequired[j])) {
                    missingItems.push(arrayOfRequired[j]);
                  }
                }
                console.log("missing items");
                console.log(missingItems);

                if (missingItems.length == 0) {
                  console.log(worker.workerName);
                  console.log("is missing no items");
                  arrayOfWorkersNotMissing.push(worker.workerName);
                }

                // arrayOfWorkersNotMissing.push(worker.workerName);

                // const textMessage = `your profile is missing the following items ${
                //   worker.workerName
                // },  ${`https://www.workpros.io/?code=${workerPhotoCode}`}`;

                // const textMessage = `${this.state.competingWorker} has completed his worker profile`;

                // const PayloadForText = {
                //   body: textMessage.toLowerCase(),
                //   phoneNumber: worker.workerPhoneNumber
                // };

                // let paramsForText = {
                //   FunctionName: "send_text",
                //   InvocationType: "RequestResponse",
                //   LogType: "Tail",
                //   Payload: JSON.stringify(PayloadForText)
                // };

                // var lambda = new aws.Lambda({
                //   region: "us-east-1"
                // });

                // let lambdaPromiseForText = lambda
                //   .invoke(paramsForText)
                //   .promise();

                // const responseForText = await lambdaPromiseForText;

                // await this.SaveSentToDatabase(
                //   PayloadForText,
                //   worker.workerName
                // );

                // this.setState({
                //   responseFromWorkerPhotoCodeSend:
                //     "success sending link to worker to upload photo with text message: " +
                //     textMessage
                // });

                // this.setState({ saveWorkerNameNumberAndPhotoResponse });
                // }
              }

              console.log(arrayOfWorkersNotMissing);

              let string = "";

              for (let j = 0; j < arrayOfWorkersNotMissing.length; j++) {
                if (j == arrayOfWorkersNotMissing.length - 1) {
                  string += arrayOfWorkersNotMissing[j];
                } else if (j == arrayOfWorkersNotMissing.length - 2) {
                  string += arrayOfWorkersNotMissing[j] + " and ";
                } else {
                  string += arrayOfWorkersNotMissing[j] + ", ";
                }
              }

              string += " have completed their profiles";

              console.log(string);

              // text all workers

              for (
                let i = 0;
                i < this.state.workerNameAndPhoneNumberArrayDallas.length;
                // i < 12;
                i++
              ) {
                let worker = this.state.workerNameAndPhoneNumberArrayDallas[i];
                const textMessage = string;
                console.log(worker);
                console.log(textMessage);
                const PayloadForText = {
                  body: textMessage.toLowerCase(),
                  phoneNumber: worker.workerPhoneNumber
                };
                let paramsForText = {
                  FunctionName: "send_text",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(PayloadForText)
                };
                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });
                let lambdaPromiseForText = lambda
                  .invoke(paramsForText)
                  .promise();
                const responseForText = await lambdaPromiseForText;
                await this.SaveSentToDatabase(
                  PayloadForText,
                  worker.workerName
                );
              }
            }}
          >
            Go through all keys and values of items and send who is completed
            {/* {this.state.workerName} {this.state.workerPhoneNumber}{" "}
            {this.state.workerPhotoCode} */}
          </Button>

          <Button
            onClick={async () => {
              const Payload = {
                workerName: this.state.workerName,
                workerPhoneNumber: this.state.workerPhoneNumber,
                workerPhotoCode: this.state.workerPhotoCode
              };

              let params = {
                FunctionName: "worker_photo_code",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              this.setState({
                responseFromWorkerPhotoCodeSave: response.Payload
              });
            }}
          >
            Add photo code with associated worker with {this.state.workerName}{" "}
            {this.state.workerPhoneNumber} {this.state.workerPhotoCode}
          </Button>

          <div>{this.state.responseFromWorkerPhotoCodeSave}</div>
          <div>{this.state.saveWorkerNameNumberAndPhotoResponse}</div>

          <div>
            <TextField
              id="standard-with-placeholder"
              label="worker photo code"
              placeholder="1234"
              margin="normal"
              value={this.state.workerPhotoCode}
              onChange={event => {
                this.setState({
                  workerPhotoCode: event.target.value
                });
              }}
            />
          </div>
          <Button
            onClick={() => {
              var val = Math.floor(100000 + Math.random() * 900000);
              this.setState({ workerPhotoCode: val + "" });
            }}
          >
            Autogenerate 6 digit code
          </Button>

          <Button
            onClick={async () => {
              let textMessage = `please complete your profile here with items such as your email, preferred job type and workpro duo ${
                this.state.workerName
              },  ${`https://www.workpros.io/?code=${this.state.workerPhotoCode}`}`;

              const event = {
                textToTranslate: textMessage
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              var paramsForTranslate = {
                FunctionName: "english_to_spanish",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(event)
              };

              let lambdaPromiseForTranslate = lambda
                .invoke(paramsForTranslate)
                .promise();

              let responseFromLambda = await lambdaPromiseForTranslate;

              console.log(responseInSpanish);

              let responseInSpanish = JSON.parse(responseFromLambda.Payload)
                .translatedText;

              // let messageForDistribution = textForDistribution(
              //   Worker.workerName,
              //   travelTimeByCar
              // );

              for (
                let j = 0;
                j <
                this.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                j++
              ) {
                console.log(
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                );
                if (
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .key == "workerLanguage" &&
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .value == "Spanish" &&
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .workerName == this.state.workerName
                ) {
                  console.log(
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .value
                  );
                  textMessage = responseInSpanish;
                }
              }

              const Payload = {
                body: textMessage.toLowerCase(),
                phoneNumber: this.state.workerPhoneNumber
              };

              let params = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              await this.SaveSentToDatabase(Payload, this.state.workerName);

              this.setState({
                responseFromWorkerPhotoCodeSend:
                  "success sending link to worker to upload photo"
              });
            }}
          >
            Send Text with workpros profile code link
            {this.state.workerPhotoCode} to the worker {this.state.workerName}
            {this.state.workerPhoneNumber}
          </Button>
          {this.state.responseFromWorkerPhotoCodeSend}

          <div>
            <TextField
              id="standard-with-placeholder"
              label="manager photo code"
              placeholder="1234"
              margin="normal"
              value={this.state.managerPhotoCode}
              onChange={event => {
                this.setState({
                  managerPhotoCode: event.target.value
                });
              }}
            />
          </div>
          <Button
            onClick={() => {
              var val = Math.floor(100000 + Math.random() * 900000);
              this.setState({ managerPhotoCode: val + "" });
            }}
          >
            Autogenerate 6 digit code
          </Button>

          <Button
            onClick={async () => {
              const Payload = {
                managerName: this.state.managerName,
                managerPhoneNumber: this.state.managerPhoneNumber,
                managerPhotoCode: this.state.managerPhotoCode
              };

              let params = {
                FunctionName: "manager_photo_code",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              this.setState({
                responseFromManagerPhotoCodeSave: response.Payload
              });
            }}
          >
            Add photo code with associated manager with {this.state.managerName}{" "}
            {this.state.managerPhoneNumber} {this.state.managerPhotoCode}
          </Button>

          <div>{this.state.responseFromManagerPhotoCodeSave}</div>

          <Button
            onClick={async () => {
              let textMessage = `please complete your profile here with items such as your email, restaurant address and a profile photo ${
                this.state.managerName
              },  ${`https://www.workpros.io/?code=${this.state.managerPhotoCode}`}`;

              const event = {
                textToTranslate: textMessage
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              var paramsForTranslate = {
                FunctionName: "english_to_spanish",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(event)
              };

              let lambdaPromiseForTranslate = lambda
                .invoke(paramsForTranslate)
                .promise();

              let responseFromLambda = await lambdaPromiseForTranslate;

              console.log(responseInSpanish);

              let responseInSpanish = JSON.parse(responseFromLambda.Payload)
                .translatedText;

              // let messageForDistribution = textForDistribution(
              //   Worker.workerName,
              //   travelTimeByCar
              // );

              for (
                let j = 0;
                j <
                this.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                j++
              ) {
                console.log(
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                );
                if (
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .key == "workerLanguage" &&
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .value == "Spanish" &&
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                    .workerName == this.state.workerName
                ) {
                  console.log(
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[j]
                      .value
                  );
                  textMessage = responseInSpanish;
                }
              }

              const Payload = {
                body: textMessage.toLowerCase(),
                phoneNumber: this.state.workerPhoneNumber
              };

              let params = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              await this.SaveSentToDatabase(Payload, this.state.workerName);

              this.setState({
                responseFromManagerPhotoCodeSend:
                  "success sending link to manager to upload photo"
              });
            }}
          >
            Send Text with workpros profile code link
            {this.state.managerPhotoCode} to the manager{" "}
            {this.state.managerName}
            {this.state.managerPhoneNumber}
          </Button>

          <Button
            onClick={async () => {
              let workerAge = "";
              let workerGender = "";
              let workerGenderProbability = "";
              for (
                let i = 0;
                i <
                this.state.workerNameAndPhoneNumberAndShiftCountArray.length;
                i++
              ) {
                if (
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[i]
                    .workerName == this.state.workerName &&
                  this.state.workerNameAndPhoneNumberAndShiftCountArray[i]
                    .key == "profilePhotoAgeAndGender"
                ) {
                  console.log(
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[i]
                  );
                  workerAge = this.state
                    .workerNameAndPhoneNumberAndShiftCountArray[i].value[0].age;
                  console.log(
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[i]
                      .value[0].age
                  );
                  console.log(
                    this.state.workerNameAndPhoneNumberAndShiftCountArray[i]
                      .value[0]
                  );
                  workerGender = this.state
                    .workerNameAndPhoneNumberAndShiftCountArray[i].value[0]
                    .gender;

                  workerGenderProbability = this.state
                    .workerNameAndPhoneNumberAndShiftCountArray[i].value[0]
                    .genderProbability;
                }
              }

              const textMessageWithAgeGender = `Based on your profile picture your age is ${parseFloat(
                workerAge
              ).toFixed(
                1
              )} and your gender is ${workerGender} with probability ${parseFloat(
                workerGenderProbability
              ).toFixed(2)} which means you are${
                workerGender == "female" ? " not" : ""
              } approved to bid on workpros shifts`;

              console.log(textMessageWithAgeGender);

              this.setState({ textMessageWithAgeGender });

              // const Payload = {
              //   body: textMessage.toLowerCase(),
              //   phoneNumber: this.state.workerPhoneNumber
              // };

              // let params = {
              //   FunctionName: "send_text",
              //   InvocationType: "RequestResponse",
              //   LogType: "Tail",
              //   Payload: JSON.stringify(Payload)
              // };

              // var lambda = new aws.Lambda({
              //   region: "us-east-1"
              // });

              // let lambdaPromise = lambda.invoke(params).promise();

              // const response = await lambdaPromise;

              // await this.SaveSentToDatabase(Payload, this.state.workerName);

              // this.setState({
              //   responseFromWorkerPhotoCodeSend:
              //     "success sending link to worker to upload photo"
              // });
            }}
          >
            Get Text with workpros age and gender to the worker{" "}
            {this.state.workerName}
            {this.state.workerPhoneNumber}
            {this.state.textMessageWithAgeGender}
          </Button>

          <Button
            onClick={async () => {
              console.log(this.state.textMessageWithAgeGender);

              const Payload = {
                body: this.state.textMessageWithAgeGender.toLowerCase(),
                phoneNumber: this.state.workerPhoneNumber
              };

              let params = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              await this.SaveSentToDatabase(Payload, this.state.workerName);

              this.setState({
                responseFromWorkerPhotoCodeSend:
                  "success sending age and gender with text:" +
                  this.state.textMessageWithAgeGender
              });
            }}
          >
            Send Text with workpros age and gender to the worker{" "}
            {this.state.workerName}
            {this.state.workerPhoneNumber}
            {this.state.textMessageWithAgeGender}
          </Button>

          <Button
            onClick={() => {
              var val = Math.floor(100000 + Math.random() * 900000);
              this.setState({ workerBidCode: val + "" });
            }}
          >
            Autogenerate 6 digit worker bid code
          </Button>

          {this.state.workerBidCode}

          <Button
            onClick={async () => {
              const {
                workerName,
                workerPhoneNumber,
                workerBidCode,
                shiftForDistributionStringified,
                shiftAddress,
                shiftEndTimeHour,
                shiftEndTimeMinute,
                shiftEndTimeMeridiem,
                shiftJobType,
                shiftLocation,
                shiftQuantityOfWorkers,
                shiftStartDate,
                shiftStartDayName,
                shiftStartTimeHour,
                shiftStartTimeMinute,
                shiftStartTimeMeridiem,
                shiftStartDateMonth,
                shiftStartDateDay,
                shiftStartDateYear,
                biddingEndTime,
                managerName,
                safeHandlersRequired,
                cashOnSite,
                freeMeal
              } = this.state;
              if (
                workerName &&
                workerPhoneNumber &&
                workerBidCode &&
                shiftAddress
              ) {
                var val = Math.floor(100000 + Math.random() * 900000);

                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                const Payload = {
                  workerName: this.state.workerName,
                  workerPhoneNumber: this.state.workerPhoneNumber,
                  workerBidCode: this.state.workerBidCode,
                  shiftForDistributionStringified,
                  shiftAddress,
                  shiftEndTimeHour,
                  shiftEndTimeMinute,
                  shiftEndTimeMeridiem,
                  shiftJobType,
                  shiftLocation,
                  shiftQuantityOfWorkers,
                  shiftStartDate,
                  shiftStartDayName,
                  shiftStartTimeHour,
                  shiftStartTimeMinute,
                  shiftStartTimeMeridiem,
                  shiftStartDateMonth,
                  shiftStartDateDay,
                  shiftStartDateYear,
                  biddingEndTime,
                  managerName,
                  safeHandlersRequired,
                  cashOnSite,
                  freeMeal
                };

                var params = {
                  FunctionName: "worker_bid_code",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(Payload)
                };

                let lambdaPromise = lambda.invoke(params).promise();

                let value = await lambdaPromise;

                this.setState({
                  responseFromWorkerPhotoCodeSend: value.Payload
                });
              } else if (!workerName) {
                alert("missing worker");
              } else if (!workerBidCode) {
                alert("missing bid code");
              } else if (!shiftAddress) {
                alert("missing shift");
              }
            }}
          >
            Add Worker Bid Code with Shift
          </Button>

          <Button
            onClick={async () => {
              const textMessage = `you can also bid on the shift here ${
                this.state.workerName
              },  ${`https://www.workpros.io/?code=${this.state.workerBidCode}`}`;

              const Payload = {
                body: textMessage.toLowerCase(),
                phoneNumber: this.state.workerPhoneNumber
              };

              let params = {
                FunctionName: "send_text",
                InvocationType: "RequestResponse",
                LogType: "Tail",
                Payload: JSON.stringify(Payload)
              };

              var lambda = new aws.Lambda({
                region: "us-east-1"
              });

              let lambdaPromise = lambda.invoke(params).promise();

              const response = await lambdaPromise;

              await this.SaveSentToDatabase(Payload, this.state.workerName);

              this.setState({
                responseFromWorkerPhotoCodeSend:
                  "success sending link to worker to upload photo"
              });
            }}
          >
            Send worker bid code to worker
          </Button>

          <Button
            onClick={async () => {
              const {
                shiftForDistributionStringified,
                shiftAddress,
                shiftEndTimeHour,
                shiftEndTimeMinute,
                shiftEndTimeMeridiem,
                shiftJobType,
                shiftLocation,
                shiftQuantityOfWorkers,
                shiftStartDate,
                shiftStartDayName,
                shiftStartTimeHour,
                shiftStartTimeMinute,
                shiftStartTimeMeridiem,
                shiftStartDateMonth,
                shiftStartDateDay,
                shiftStartDateYear,
                biddingEndTime,
                managerName,
                safeHandlersRequired,
                cashOnSite,
                freeMeal
              } = this.state;
              if (shiftAddress) {
              } else if (!shiftAddress) {
                alert("missing shift");
                return;
              }

              for (
                let i = 4;
                i < this.state.workerNameAndPhoneNumberArrayLosAngeles.length;
                // i < 4;
                i++
              ) {
                let worker = this.state.workerNameAndPhoneNumberArrayLosAngeles[
                  i
                ];

                console.log(worker.workerName);

                var val = Math.floor(100000 + Math.random() * 900000);

                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                const Payload = {
                  workerName: worker.workerName,
                  workerPhoneNumber: worker.workerPhoneNumber,
                  workerBidCode: val,
                  shiftForDistributionStringified,
                  shiftAddress,
                  shiftEndTimeHour,
                  shiftEndTimeMinute,
                  shiftEndTimeMeridiem,
                  shiftJobType,
                  shiftLocation,
                  shiftQuantityOfWorkers,
                  shiftStartDate,
                  shiftStartDayName,
                  shiftStartTimeHour,
                  shiftStartTimeMinute,
                  shiftStartTimeMeridiem,
                  shiftStartDateMonth,
                  shiftStartDateDay,
                  shiftStartDateYear,
                  biddingEndTime,
                  managerName,
                  safeHandlersRequired,
                  cashOnSite,
                  freeMeal
                };

                var params = {
                  FunctionName: "worker_bid_code",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(Payload)
                };

                let lambdaPromise = lambda.invoke(params).promise();

                let value = await lambdaPromise;

                this.setState({
                  responseFromWorkerPhotoCodeSend: value.Payload
                });

                // new under time pressure
                const textMessage = `you can also bid on the shift here ${
                  worker.workerName
                },  ${`https://www.workpros.io/?code=${val}`}`;

                const PayloadForText = {
                  body: textMessage.toLowerCase(),
                  phoneNumber: this.state.workerPhoneNumber
                };

                let paramsForText = {
                  FunctionName: "send_text",
                  InvocationType: "RequestResponse",
                  LogType: "Tail",
                  Payload: JSON.stringify(PayloadForText)
                };

                var lambda = new aws.Lambda({
                  region: "us-east-1"
                });

                let lambdaPromiseForText = lambda
                  .invoke(paramsForText)
                  .promise();

                const response = await lambdaPromiseForText;

                await this.SaveSentToDatabase(
                  PayloadForText,
                  worker.workerName
                );

                this.setState({
                  responseFromWorkerPhotoCodeSend:
                    "success sending link to worker to upload photo"
                });
              }
            }}
          >
            Send shift offer with worker bid code to all workers in LA
          </Button>

          <div style={{ margin: 10 }}>
            Manager
            <Select
              value={this.state.managerNameAndPhoneNumberStringified}
              onChange={event => {
                console.log(event.target.value);
                this.setState({
                  managerNameAndPhoneNumber: JSON.parse(event.target.value),
                  managerNameAndPhoneNumberStringified: event.target.value,
                  managerName: JSON.parse(event.target.value).managerName,
                  managerPhoneNumber: JSON.parse(event.target.value)
                    .managerPhoneNumber,
                  managerOfShift: {
                    managerName: JSON.parse(event.target.value).managerName,
                    managerPhoneNumber: JSON.parse(event.target.value)
                      .managerPhoneNumber
                  }
                });
              }}
            >
              {this.state.managerNameAndPhoneNumberArray.map(
                managerNameAndPhoneNumber => {
                  return (
                    <MenuItem value={JSON.stringify(managerNameAndPhoneNumber)}>
                      {managerNameAndPhoneNumber.managerName}{" "}
                      {managerNameAndPhoneNumber.managerPhoneNumber}
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </div>

          <div style={{ margin: 10 }}>
            Manager and Email
            <Select
              value={this.state.managerNameAndEmailStringified}
              onChange={event => {
                console.log(event.target.value);
                this.setState({
                  managerNameAndEmail: JSON.parse(event.target.value),
                  managerNameAndEmailStringified: event.target.value,
                  managerName: JSON.parse(event.target.value).managerName,
                  managerEmail: JSON.parse(event.target.value).managerEmail,
                  managerOfShift: {
                    managerName: JSON.parse(event.target.value).managerName,
                    managerEmail: JSON.parse(event.target.value).managerEmail
                  }
                });
              }}
            >
              {this.state.managerNameAndEmailArray.map(managerNameAndEmail => {
                return (
                  <MenuItem value={JSON.stringify(managerNameAndEmail)}>
                    {managerNameAndEmail.managerName}{" "}
                    {managerNameAndEmail.managerEmail}
                  </MenuItem>
                );
              })}
            </Select>
          </div>

          <Button
            style={{ backgroundColor: "red" }}
            onClick={() => {
              this.setState({
                displayManagerOptions: !this.state.displayManagerOptions
              });
            }}
          >
            display manager options
          </Button>
          {this.state.displayManagerOptions &&
            displayManagerPublishOptions(this)}

          {displayRestaurantPublishOptions(this)}
          <Button
            style={{ backgroundColor: "red", textTransform: "none" }}
            onClick={() => {
              this.setState({
                displayShiftPublishOptions: !this.state
                  .displayShiftPublishOptions
              });
            }}
          >
            Display Shift Publish Options
          </Button>

          {this.state.displayShiftPublishOptions &&
            displayShiftPublishOptions(this)}
          {displayManagerPaymentPublishOptions(this)}
        </div>
      </div>
    );
  }

  set = (event, variable) => {
    this.setState({ [variable]: event.target.value });
  };

  propComparator = propName => (a, b) =>
    a[propName] == b[propName] ? 0 : a[propName] < b[propName] ? -1 : 1;

  displaySelectQuantityOfWorkers = () => {
    return (
      <div>
        <label>
          Shift Quantity of Workers
          <TextField
            type="text"
            value={this.state.shiftQuantityOfWorkers}
            onChange={event => this.set(event, "shiftQuantityOfWorkers")}
          />
        </label>
      </div>
    );
  };
  displayInputForShiftLocation = () => {
    return (
      <div style={{ flexDirection: "column" }}>
        <div>
          Shift Location 📍
          {!this.state.shiftLocation.shiftAddress && (
            <TextField
              type="text"
              value={this.state.shiftAddress}
              onChange={event => {
                this.setState({
                  shiftAddress: event.target.value
                });
                this.findShiftAddresses(event.target.value);
              }}
            />
          )}
          {!this.state.shiftLocation.shiftAddress &&
            this.state.shiftAddresses.length > 0 &&
            this.state.shiftAddresses.map(address => {
              return (
                <div>
                  <Button
                    onClick={() => {
                      this.handleAddressClick(address);
                    }}
                  >
                    {address.formatted_address}
                  </Button>
                </div>
              );
            })}
        </div>
        <div>
          {this.state.shiftLocation.shiftAddress &&
            this.state.shiftLocation.shiftAddress}
        </div>
      </div>
    );
  };
  handleRestaurantAddressClick = address => {
    this.setState({ restaurantAddress: address.formatted_address });

    let restaurantLocation = {};

    restaurantLocation.restaurantLatitude = address.geometry.location.lat;
    restaurantLocation.restaurantLongitude = address.geometry.location.lng;
    restaurantLocation.restaurantAddress = address.formatted_address;

    this.setState({ restaurantLocation });
  };
  handleWorkerAddressClick = address => {
    this.setState({ workerAddress: address.formatted_address });

    let workerLocation = {};

    workerLocation.workerLatitude = address.geometry.location.lat;
    workerLocation.workerLongitude = address.geometry.location.lng;
    workerLocation.workerAddress = address.formatted_address;

    this.setState({ workerLocation });
  };
  handleAddressClick = address => {
    this.setState({ shiftAddress: address.formatted_address });

    let shiftLocation = {};

    shiftLocation.shiftLatitude = address.geometry.location.lat;
    shiftLocation.shiftLongitude = address.geometry.location.lng;
    shiftLocation.shiftAddress = address.formatted_address;

    this.setState({ shiftLocation });
  };

  displayLocationInputViaAddress = () => {
    return (
      <div style={{ flexDirection: "column", display: "flex" }}>
        <div style={{ flexDirection: "row", display: "flex" }}>
          <div>Worker Pickup Location 📍</div>
          <div>
            {!this.state.workerPickupLocation.workerPickupAddress && (
              <input
                type="text"
                value={this.state.workerPickupAddress}
                onChange={event => {
                  this.setState({
                    workerPickupAddress: event.target.value
                  });
                  this.findWorkerPickupAddresses(event.target.value);
                }}
              />
            )}
          </div>
        </div>
        <div>
          {!this.state.workerPickupLocation.workerPickupAddress &&
            this.state.workerPickupAddresses.length > 0 &&
            this.state.workerPickupAddresses.map(address => {
              return (
                <div>
                  <Button
                    onClick={() => {
                      this.handleWorkerPickupAddressClick(address);
                    }}
                  >
                    {address.formatted_address}
                  </Button>
                </div>
              );
            })}
        </div>
        {this.state.workerPickupLocation.workerPickupAddress &&
          this.state.workerPickupLocation.workerPickupAddress}
      </div>
    );
  };
  displayDestinationInputViaAddress = () => {
    return (
      <div style={{ flexDirection: "column", display: "flex" }}>
        <div style={{ flexDirection: "row", display: "flex" }}>
          <div>Worker Dropoff Location 📍</div>
          <div>
            {!this.state.workerDestinationLocation.workerDestinationAddress && (
              <input
                type="text"
                value={this.state.workerDestinationAddress}
                onChange={event => {
                  this.setState({
                    workerDestinationAddress: event.target.value
                  });
                  this.findWorkerDestinationAddresses(event.target.value);
                }}
              />
            )}
          </div>
        </div>
        <div>
          {!this.state.workerDestinationLocation.workerDestinationAddress &&
            this.state.workerDestinationAddresses.length > 0 &&
            this.state.workerDestinationAddresses.map(address => {
              return (
                <div>
                  <Button
                    onClick={() => {
                      this.handleWorkerDestinationAddressClick(address);
                    }}
                  >
                    {address.formatted_address}
                  </Button>
                </div>
              );
            })}
        </div>
        {this.state.workerDestinationLocation.workerDestinationAddress &&
          this.state.workerDestinationLocation.workerDestinationAddress}
      </div>
    );
  };
  findWorkerPickupAddresses = address => {
    this.getAddresses(address).then(value => {
      this.setState({ workerPickupAddresses: value });
    });
  };
  findWorkerDestinationAddresses = address => {
    this.getAddresses(address).then(value => {
      this.setState({ workerDestinationAddresses: value });
    });
  };
  findShiftAddresses = address => {
    this.getAddresses(address).then(value => {
      this.setState({ shiftAddresses: value });
    });
  };
  findRestaurantAddresses = address => {
    this.getAddresses(address).then(value => {
      this.setState({ restaurantAddresses: value });
    });
  };
  findWorkerAddresses = address => {
    this.getAddresses(address).then(value => {
      this.setState({ workerAddresses: value });
    });
  };
  getAddresses = address =>
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=AIzaSyBANc6a2f4tWRNr8aRz6qxWSQJhNOrd_eA`
    )
      .then(x => x.json())
      .then(x => x.results);
  handleWorkerPickupAddressClick = address => {
    this.setState({ workerPickupAddress: address.formatted_address });

    let workerPickupLocation = {};

    workerPickupLocation.workerLatitude = address.geometry.location.lat;
    workerPickupLocation.workerLongitude = address.geometry.location.lng;
    workerPickupLocation.workerPickupAddress = address.formatted_address;

    this.setState({ workerPickupLocation });
  };
  handleWorkerDestinationAddressClick = address => {
    this.setState({ workerDestinationAddress: address.formatted_address });

    let workerDestinationLocation = {};

    workerDestinationLocation.workerLatitude = address.geometry.location.lat;
    workerDestinationLocation.workerLongitude = address.geometry.location.lng;
    workerDestinationLocation.workerDestinationAddress =
      address.formatted_address;

    this.setState({ workerDestinationLocation });
  };

  updateAvailabilityToEveryDay = () => {
    return (
      <Button
        onClick={async () => {
          for (
            let i = 0;
            i < this.daysToScheduleAvailabilityForWorker.length;
            i++
          ) {
            await this.handleClickOnUnavailableButton(
              this.daysToScheduleAvailabilityForWorker[i]
            );
          }
        }}
      >
        not every day
      </Button>
    );
  };
  handleClickOnUnavailableButton = dayToChooseAvailabilityFor => {
    const allDayAvailability = {
      fromHour: "12",
      fromMinute: "01",
      fromMeridiem: "am",
      untilHour: "12",
      untilMinute: "01",
      untilMeridiem: "am"
    };

    this.setState({
      ["workerAvailability"]: {
        ...this.state.workerAvailability,
        [dayToChooseAvailabilityFor]: allDayAvailability
      }
    });
  };

  SaveSentToDatabase = async (Payload, name = "") => {
    var lambda = new aws.Lambda({
      region: "us-east-1"
    });

    Payload.name = name;
    var SaveParams = {
      FunctionName: "save_sent",
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify(Payload)
    };

    let SaveSentLambdaPromise = lambda.invoke(SaveParams).promise();

    let value = await SaveSentLambdaPromise;
  };

  handleChange = (
    dayToChooseAvailabilityFor,
    event,
    propertyOfDaysAvailibility
  ) => {
    if (
      Object.keys(this.state.workerAvailability[dayToChooseAvailabilityFor])
        .length == 0
    ) {
      const defaultAvailability = {
        fromHour: "12",
        fromMinute: "01",
        fromMeridiem: "am",
        untilHour: "11",
        untilMinute: "59",
        untilMeridiem: "pm"
      };

      this.setState({
        ["workerAvailability"]: {
          ...this.state.workerAvailability,
          [dayToChooseAvailabilityFor]: {
            ...defaultAvailability,
            [propertyOfDaysAvailibility]: event.target.value
          }
        }
      });
    } else {
      this.setState({
        ["workerAvailability"]: {
          ...this.state.workerAvailability,
          [dayToChooseAvailabilityFor]: {
            ...this.state["workerAvailability"][dayToChooseAvailabilityFor],
            [propertyOfDaysAvailibility]: event.target.value
          }
        }
      });
    }
  };

  state = {
    workerName: "",
    workerPhoneNumber: "",
    workerEmail: "",
    workerConfirmPhoneNumberResponse: "",
    workerConfirmEmailResponse: "",
    workerAvailability: {
      Monday: defaultAvailability,
      Tuesday: defaultAvailability,
      Wednesday: defaultAvailability,
      Thursday: defaultAvailability,
      Friday: defaultAvailability,
      Saturday: defaultAvailability,
      Sunday: defaultAvailability
    },
    workerForShift: {},
    workerPickupLocation: {},
    workerPickupAddress: "",
    workerPickupAddresses: [],
    workerForShiftArray: [],
    workerDestinationLocation: {},
    workerDestinationAddress: "",
    workerDestinationAddresses: [],
    workerForShiftStringified: "",
    workerPaymentStrategy: "",
    workerPaymentUsername: "",
    workerPaymentAmount: "",
    workerForCost: {},
    workerForCostStringified: "",
    workerForCostArray: [],
    workerLowestCostPerHour: "",
    workerCost: "",
    workerForPickup: {},
    workerForPickupStringified: "",
    workerForPickupArray: [],
    workerForDistribution: {},
    workerForDistributionStringified: "",
    workerForDistributionArray: [],
    workerForDistributionSelectedArray: [],
    workerWithLowestCost: {},
    workerWithLowestCostStringified: "",
    workerWithLowestCostArray: [],
    workerForUpdatingLowestPayment: {},
    workerForUpdatingLowestPaymentArray: [],
    workerForUpdatingLowestPaymentStringified: {},
    workerNameAndPhoneNumber: {},
    workerNameAndPhoneNumberArray: [],
    workerNameAndPhoneNumberArrayAlphabetical: [],
    workerNameAndPhoneNumberArrayPhiladelphia: [],
    workerNameAndPhoneNumberArrayLosAngeles: [],
    workerNameAndPhoneNumberArrayDallas: [],

    workerNameAndPhoneNumberStringified: "",

    managerNameAndEmail: {},
    managerNameAndEmailArray: ["manager1", "manager2"],
    managerNameAndEmailStringified: "",

    managerNameAndPhoneNumber: {},
    managerNameAndPhoneNumberArray: ["manager1", "manager2"],
    managerNameAndPhoneNumberStringified: "",
    managerOfShift: {},
    managerOfShiftArray: ["manager1", "manager2"],
    managerOfShiftStringified: "",
    managerForPayment: {},
    managerName: "",
    managerPhoneNumber: "",
    managerEmail: "",
    managerConfirmPhoneNumberResponse: "",
    managerConfirmEmailResponse: "",
    managerCreditCardNumber: "",
    managerCreditCardSecurityCode: "",
    managerCreditCardExpirationDate: "",
    managerForPaymentArray: [],
    managerForPaymentStringified: "",
    managerForTransportStatus: {},
    managerForTransportStatusStringified: "",
    managerForTransportStatusArray: [],
    managerTransportStatusResponse: "",

    restaurantNameAndLocation: {},
    restaurantNameAndLocationArray: [],
    restaurantNameAndLocationStringified: "",

    shiftStartASAPTodayTomorrowOther: "Today",
    shiftStartDateYear: moment().year(),
    shiftStartDateMonth: moment().month(),
    shiftStartDateDay: moment().date(),
    shiftStartDayName: moment().format("dddd"),
    shiftStartDate: new Date(),
    shiftLocation: {},
    shiftAddress: "",
    shiftAddresses: [],
    shiftQuantityOfWorkers: "1",
    shiftJobType: "Dishwasher (Chef Plongeur)",
    shiftStartTimeHour: "1",
    shiftStartTimeMinute: "00",
    shiftStartTimeMeridiem: "am",
    shiftEndTimeHour: "1",
    shiftEndTimeMinute: "00",
    shiftEndTimeMeridiem: "pm",
    shiftsArray: [],
    shiftForManagerPayment: {},
    shiftsForManagerPaymentArray: [],
    shiftsForManagerPaymentStringified: {},
    shiftForWorkerCost: {},
    shiftsForWorkerCostArray: [],
    shiftForWorkerCostStringified: "",
    shiftCost: "",
    shiftForUpdatingCost: {},
    shiftsForUpdatingCostArray: [],
    shiftForUpdatingCostStringified: {},
    shiftWithUpdatedCost: {},
    shiftsWithUpdatedCostArray: [],
    shiftsWithUpdatedCostUIDArray: [],
    shiftWithUpdatedCostStringified: {},
    shiftForDistribution: {},
    shiftsForDistributionArray: [],
    shiftForDistributionStringified: {},

    clientToken: null,

    managerCustomerID: "",

    transportCurrentStatus: "",
    transportSandboxBoolean: "",
    transportSandbox: null,
    transportRequestID: "",

    name: "Adrian",
    receiptId: 0,
    price1: 0,
    price2: 0,

    arrayOfResponses: [],

    restaurantName: "",
    restaurantLocation: {},
    restaurantAddress: "",
    restaurantAddresses: [],
    restaurant: {},
    restaurantStringified: "",
    restaurantArray: [],

    workerLocation: {},
    workerAddress: "",
    workerAddresses: [],

    twilioResponseTextArray: [],
    twilioSentTextArray: [],

    paymentCode: "",

    saveWorkerNameAndPhoneNumberResponse: "",
    saveManagerNameAndPhoneNumberResponse: "",

    saveRestaurantNameAndLocationResponse: "",

    displayWorkersForDistribution: "",
    displayLosAngelesWorkersForDistribution: "",
    displayDallasWorkersForDistribution: "",
    displayPhiladelphiaWorkersForDistribution: "",

    ArrayOfWorkersNamesAndNumbers: [],

    transportStatus: "",

    braintreePaymentResponse: "",

    transportArrivalTime: "",

    additionalTitle: "",
    workerAdditionalTitle: "",

    numberCompleted: "",

    moreCompetitiveWorker: "",
    biddingEndTime: "",
    competingWorker: "",
    losingWorkerAdditionalTitle: "",
    whoYouBeat: "",
    arrivalTime: "",
    car: "",
    license: "",
    arrivingIn: "",
    city: "",
    lowestForCity: "",
    workerWithLowest: "",
    rating: "",

    readyTime: "",

    AutoRespond: false,
    WorkerLowestArray: [],
    CompetingWorkersArray: [],

    ArrayOfWorkersNamesAndNumbersCompeting: [],

    timeLength: "",

    workerUIDArray: [],
    workerNameForDelete: "",
    workerNameAndPhoneNumberForDelete: {},
    workerNameAndPhoneNumberForDeleteStringified: "",

    workerNameForBan: "",
    workerPhoneNumberForBan: "",
    workerNameAndPhoneNumberForBan: {},
    workerNameAndPhoneNumberForBanStringified: "",
    responseFromBan: "",

    managerUIDArray: [],
    managerNameForDelete: "",
    managerNameAndPhoneNumberForDelete: {},
    managerNameAndPhoneNumberForDeleteStringified: "",

    workerNameAndPhoneNumberAndShiftCountArray: [],

    playDrum1: false,
    playDrum3: false,
    playDrum4: false,
    playDrum6: false,

    shiftLength: "",

    iphoneOrAndroid: "",

    publicTransportURL: "",

    distance: "",

    distributeLAShiftResponse: "",

    repeaterInterval: "",

    intervalId: "",

    runningInterval: false,

    hourOfEvent: "",
    minuteOfEvent: "",
    meridiemOfEvent: "",

    allNumericalBids: [],

    autoRespondWithWinning: false,

    error: "",

    freeUber: "",

    freeMeal: "",

    cashOnSite: "",

    uberCost: "",

    workerDeleteResponse: "",

    displayWorkerOptions: false,
    displayManagerOptions: false,

    estimatedCost: "",

    secondsLeft: "0",

    ignoreUnderTwenty: true,

    shiftUIDforDelete: "",

    shiftDeleteResponse: "",

    shiftForDeleteStringified: "",

    firstTimeManager: "",

    managerDeleteResponse: "",

    safeHandlersRequired: "",

    managerEmail: "",

    saveManagerAndEmailResponse: "",

    displayHerokuOptions: false,
    displayShiftPublishOptions: false,

    freeFirstMonth: "",

    responseFromWorkerPhotoCodeSend: "",

    totalTransportCost: "",

    workerNamePhoneNumberTransportCostArrayAlphabetical: [],

    showBidEndOptions: false,

    workerNameAndPhoneNumberBannedArray: [],

    saveWorkerEmailResponse: "",

    countCostByDateArray: [],

    responseFromWorkerPhotoCodeSave: "",

    intervalCountdown: "",

    autoRespondName: true,

    textMessageWithAgeGender: "",
    responseFromSetWorkerBidCode: "",

    responseFromManagerPhotoCodeSave: ""
  };
  instance;
}

export default App;
