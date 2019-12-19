import React, { Component } from "react";

import Button from "@material-ui/core/Button";

import firebase from "firebase";

const moment = require("moment-timezone");

export default function(scope) {
  return (
    <div>
      <Button
        onClick={() => {
          firebase
            .database()
            .ref("/workerLowest/")
            .remove()
            .then(() => {
              alert("deleted successfully");
            });
        }}
      >
        Delete all WORKERS and LOWEST
      </Button>
      {scope.state.CompetingWorkersArray.map(function(WorkerLowest, index) {
        return (
          <div>
            Name: {WorkerLowest.workerLowest.WorkerName} Worker Phone Number:{" "}
            {WorkerLowest.workerLowest.WorkerPhoneNumber}
            Date and Time Updated:{" "}
            {WorkerLowest.workerLowest.dateAndTimeUpdated}
          </div>
        );
      })}
      <Button
        onClick={() => {
          let { hourOfEvent, minuteOfEvent, meridiemOfEvent } = scope.state;

          const event = {
            biddingEndTime: scope.state.biddingEndTime,
            shiftAddress: scope.state.shiftAddress,
            shiftStartTimeHour: scope.state.shiftStartTimeHour,
            shiftStartTimeMinute: scope.state.shiftStartTimeMinute,
            shiftStartTimeMeridiem: scope.state.shiftStartTimeMeridiem,
            shiftStartDate: scope.state.shiftStartDate,
            shiftEndTimeHour: scope.state.shiftEndTimeHour,
            shiftEndTimeMinute: scope.state.shiftEndTimeMinute,
            shiftEndTimeMeridiem: scope.state.shiftEndTimeMeridiem,
            shiftStartDayName: scope.state.shiftStartDayName,
            hourOfEvent,
            minuteOfEvent,
            meridiemOfEvent
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/attemptAutoRespond?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Attempt Auto Respond
      </Button>
      <Button
        onClick={() => {
          const event = {
            workerName: scope.state.workerName,
            workerPhoneNumber: scope.state.workerPhoneNumber,
            managerName: scope.state.managerName,
            managerPhoneNumber: scope.state.managerPhoneNumber,
            shiftStartTimeHour: scope.state.shiftStartTimeHour,
            shiftStartTimeMinute: scope.state.shiftStartTimeMinute,
            shiftStartTimeMeridiem: scope.state.shiftStartTimeMeridiem,
            shiftStartDate: scope.state.shiftStartDate,
            shiftEndTimeHour: scope.state.shiftEndTimeHour,
            shiftEndTimeMinute: scope.state.shiftEndTimeMinute,
            shiftEndTimeMeridiem: scope.state.shiftEndTimeMeridiem
          };
          console.log(event);

          var uri = `http://192.168.1.186:8080/textAskingArrival?jsonObj=${JSON.stringify(
            event
          )}`;
          console.log(uri);
          // var encodedUri = encodeURI(uri);
          // console.log(encodedUri);
          window.open(uri);
        }}
      >
        textAskingArrival Set Timeout for text message to be sent to worker and
        manager at time of shift and eric alerted to confirm arrival
      </Button>
      <Button
        onClick={() => {
          const event = {
            workerName: scope.state.workerName,
            workerPhoneNumber: scope.state.workerPhoneNumber,
            managerName: scope.state.managerName,
            managerPhoneNumber: scope.state.managerPhoneNumber,
            shiftStartTimeHour: scope.state.shiftStartTimeHour,
            shiftStartTimeMinute: scope.state.shiftStartTimeMinute,
            shiftStartTimeMeridiem: scope.state.shiftStartTimeMeridiem,
            shiftStartDate: scope.state.shiftStartDate,
            shiftEndTimeHour: scope.state.shiftEndTimeHour,
            shiftEndTimeMinute: scope.state.shiftEndTimeMinute,
            shiftEndTimeMeridiem: scope.state.shiftEndTimeMeridiem
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/textAskingForStartHour?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        textAskingForStartHour Set Timeout to Heroku for text message to be sent
        to worker and manager at time of shift and eric alerted to confirm
        arrival
      </Button>
      <Button
        onClick={() => {
          const event = {
            workerName: scope.state.workerName,
            workerPhoneNumber: scope.state.workerPhoneNumber,
            managerName: scope.state.managerName,
            managerPhoneNumber: scope.state.managerPhoneNumber,
            shiftStartTimeHour: scope.state.shiftStartTimeHour,
            shiftStartTimeMinute: scope.state.shiftStartTimeMinute,
            shiftStartTimeMeridiem: scope.state.shiftStartTimeMeridiem,
            shiftStartDate: scope.state.shiftStartDate,
            shiftEndTimeHour: scope.state.shiftEndTimeHour,
            shiftEndTimeMinute: scope.state.shiftEndTimeMinute,
            shiftEndTimeMeridiem: scope.state.shiftEndTimeMeridiem
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/textAskingForStartAndEndHour?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        textAskingForStartAndEndHour Set Timeout to Heroku for text message to
        be sent to worker and manager at END of shift and eric alerted to
        confirm arrival
      </Button>
      <Button
        onClick={() => {
          console.log(scope.state.safeHandlersRequired);
          const event = {
            manager: true,
            name: scope.state.restaurantName,
            prices: [
              scope.state.shiftStartASAPTodayTomorrowOther +
                " " +
                scope.state.shiftStartDateMonth +
                "/" +
                scope.state.shiftStartDateDay +
                "/" +
                scope.state.shiftStartDateYear,
              scope.state.shiftStartTimeHour +
                ":" +
                scope.state.shiftStartTimeMinute +
                " " +
                scope.state.shiftStartTimeMeridiem,
              scope.state.shiftEndTimeHour +
                ":" +
                scope.state.shiftEndTimeMinute +
                " " +
                scope.state.shiftEndTimeMeridiem,
              scope.state.restaurantLocation.restaurantAddress,
              scope.state.shiftJobType,
              "Close Toed Shoes" + scope.state.safeHandlersRequired
            ],
            ubers: [],
            items: [
              "Shift Date",
              "Shift Start Time",
              "Shift End Time",
              "Restaurant Address",
              "Work Type",
              "Requirements"
            ],
            receiptId: Math.round(Math.random() * 10000),
            emailAddress: "ericswenson15@icloud.com",
            emailSubject: "WorkPros.io Receipt",
            emailBody: `
            
                  `,
            shiftLowestPayment: scope.state.shiftLowestPayment
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/distribute?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Distribute shift
        {scope.state.shiftStartASAPTodayTomorrowOther +
          " " +
          scope.state.shiftStartDateMonth +
          "/" +
          scope.state.shiftStartDateDay +
          "/" +
          scope.state.shiftStartDateYear}
        {scope.state.shiftStartTimeHour}
        {scope.state.shiftStartTimeMinute}
        {scope.state.shiftStartTimeMeridiem} {scope.state.shiftEndTimeHour}
        {scope.state.shiftEndTimeMinute}
        {scope.state.shiftEndTimeMeridiem}
        {scope.state.restaurantLocation.restaurantAddress}
        {scope.state.shiftJobType}
        {scope.state.safeHandlersRequired ? "and Safe Handlers Card" : ""}
        {scope.state.restaurantName}
        {scope.state.restaurantAddress}
      </Button>
      <Button
        onClick={() => {
          const event = {
            manager: true,
            name: scope.state.restaurantName,
            prices: [
              scope.state.shiftStartASAPTodayTomorrowOther +
                " " +
                scope.state.shiftStartDateMonth +
                "/" +
                scope.state.shiftStartDateDay +
                "/" +
                scope.state.shiftStartDateYear,
              scope.state.shiftStartTimeHour +
                ":" +
                scope.state.shiftStartTimeMinute +
                " " +
                scope.state.shiftStartTimeMeridiem,
              scope.state.shiftEndTimeHour +
                ":" +
                scope.state.shiftEndTimeMinute +
                " " +
                scope.state.shiftEndTimeMeridiem,
              scope.state.restaurantLocation.restaurantAddress,
              scope.state.shiftJobType,
              "Close Toed Shoes" + scope.state.safeHandlersRequired
            ],
            ubers: [],
            items: [
              "Shift Date",
              "Shift Start Time",
              "Shift End Time",
              "Restaurant Address",
              "Work Type",
              "Requirements"
            ],
            receiptId: Math.round(Math.random() * 10000),
            emailAddress: "ejswenson@alumni.princeton.edu",
            emailSubject: "WorkPros.io Receipt",
            emailBody: `
            
                  `,
            shiftLowestPayment: scope.state.shiftLowestPayment
          };
          console.log(event);

          var uri = `https://thawing-refuge-24509.herokuapp.com/pang?jsonObj=${JSON.stringify(
            event
          )}`;
          console.log(uri);
          // var encodedUri = encodeURI(uri);
          // console.log(encodedUri);
          window.open(uri);
        }}
      >
        Pang Create Summary with shift for MANAGER
        {scope.state.shiftStartASAPTodayTomorrowOther +
          " " +
          scope.state.shiftStartDateMonth +
          "/" +
          scope.state.shiftStartDateDay +
          "/" +
          scope.state.shiftStartDateYear}
        {scope.state.shiftStartTimeHour}
        {scope.state.shiftStartTimeMinute}
        {scope.state.shiftStartTimeMeridiem} {scope.state.shiftEndTimeHour}
        {scope.state.shiftEndTimeMinute}
        {scope.state.shiftEndTimeMeridiem}
        {scope.state.restaurantLocation.restaurantAddress}
        {scope.state.shiftJobType}
        {scope.state.safeHandlersRequired ? " and Safe Handlers Card" : ""}
        {scope.state.restaurantName}
        {scope.state.restaurantAddress}
      </Button>

      <Button
        onClick={() => {
          const event = {
            manager: true,
            name: scope.state.workerName,
            prices: [
              scope.state.shiftStartASAPTodayTomorrowOther +
                " " +
                scope.state.shiftStartDateMonth +
                "/" +
                scope.state.shiftStartDateDay +
                "/" +
                scope.state.shiftStartDateYear,
              scope.state.shiftStartTimeHour +
                ":" +
                scope.state.shiftStartTimeMinute +
                " " +
                scope.state.shiftStartTimeMeridiem,
              scope.state.shiftEndTimeHour +
                ":" +
                scope.state.shiftEndTimeMinute +
                " " +
                scope.state.shiftEndTimeMeridiem,
              scope.state.restaurantLocation.restaurantAddress,
              scope.state.shiftJobType,
              "Close Toed Shoes" + scope.state.safeHandlersRequired,
              scope.state.workerPaymentStrategy,
              scope.state.workerPaymentStrategyUsername
            ],
            ubers: [],
            items: [
              "Shift Date",
              "Shift Start Time",
              "Shift End Time",
              "Restaurant Address",
              "Work Type",
              "Requirements",
              "Payment App",
              "App Username"
            ],
            receiptId: Math.round(Math.random() * 10000),
            emailAddress: "ejswenson@alumni.princeton.edu",
            emailSubject: "WorkPros.io Receipt",
            emailBody: `
            
                  `,
            shiftLowestPayment: scope.state.shiftLowestPayment
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/ping?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Ping endpoint Create Summary with shift for WORKER
        {moment(scope.state.shiftStartDate).format("dddd MMMM Mo, YYYY")}
        {scope.state.shiftStartTimeHour}
        {scope.state.shiftStartTimeMinute}
        {scope.state.shiftStartTimeMeridiem} {scope.state.shiftEndTimeHour}
        {scope.state.shiftEndTimeMinute}
        {scope.state.shiftEndTimeMeridiem}
        {scope.state.restaurantLocation.restaurantAddress}
        {scope.state.shiftJobType}
        {scope.state.safeHandlersRequired}
        {scope.state.restaurantName}
        {scope.state.restaurantAddress}
      </Button>
      <Button
        onClick={() => {
          let { hourOfEvent, minuteOfEvent, meridiemOfEvent } = scope.state;

          const event = {
            name: scope.state.restaurantName,
            prices: ["45"],
            ubers: [],
            items: ["Subscription"],
            receiptId: Math.round(Math.random() * 10000),
            emailAddress: scope.state.managerEmail,
            emailSubject: "WorkPros.io Receipt",
            emailBody: `
            
                  `,
            hourOfEvent,
            minuteOfEvent,
            meridiemOfEvent
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/emailInvoice?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Send Subscription Invoice to restaurant {scope.state.restaurantName} and
        manager email {scope.state.managerEmail} at time{" "}
        {scope.state.hourOfEvent +
          ":" +
          scope.state.minuteOfEvent +
          " " +
          scope.state.meridiemOfEvent}
      </Button>
      <Button
        onClick={() => {
          const event = {
            name: scope.state.restaurantName,
            prices: ["45"],
            ubers: [],
            items: ["Subscription"],
            receiptId: Math.round(Math.random() * 10000),
            emailAddress: "ejswenson@alumni.princeton.edu",
            emailSubject: "WorkPros.io Receipt",
            emailBody: `
            
                  `
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/emailInvoice?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Send shift Invoice to restaurant {scope.state.restaurantName} and
        manager email {scope.state.managerEmail}
      </Button>
      <Button
        onClick={() => {
          const event = {
            workerName: scope.state.workerName,
            workerPhoneNumber: scope.state.workerPhoneNumber
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/getAgeAndGender?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        get Age and Gender endpoint for worker
        {scope.state.workerName} and phone number
        {scope.state.workerPhoneNumber}
      </Button>

      <Button
        onClick={() => {
          const event = {
            workerName: scope.state.workerName,
            workerPhoneNumber: scope.state.workerPhoneNumber
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/checkForManager?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        set interval to check for manager text
        {scope.state.restaurantName} and manager email{" "}
        {scope.state.managerEmail}
      </Button>
      {/* 
      <Button
        onClick={() => {
          const event = {
            workerName: scope.state.workerName,
            workerPhoneNumber: scope.state.workerPhoneNumber,
            textMessage: "hello"
          };

          var uri = `https://thawing-refuge-24509.herokuapp.com/getEnglishTranslation?jsonObj=${JSON.stringify(
            event
          )}`;

          window.open(uri);
        }}
      >
        Get spanish translation
      </Button> */}

      {/* app.get("/getEnglishTranslation", async function(req, res) { */}
    </div>
  );
}
