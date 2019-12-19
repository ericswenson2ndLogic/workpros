import React from "react";
import aws from "aws-sdk";

export const displayCostEstimation = scope => {
  return (
    <div
      style={{
        justifyContent: "center",
        flexDirection: "column",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div style={{ margin: 5 }} />
      <div>cost estimate here</div>
      <button
        onClick={async () => {
          var lambda = new aws.Lambda({
            region: "us-east-1"
          });

          const Payload = {
            paymentCode: "1234",

            restaurantName: "Hank's",
            restaurantAddress: "1059 Monument Street, Pacific Palisades",

            managerOfShift: {
              managerName: "Sample Name" + Math.random() + " (Los Angeles)",
              managerPhoneNumber: "7578176517"
            },

            biddingEndTime: "7:00 PM PST Today",

            shiftAddress: "321 E Alameda Ave, Burbank, CA 91502, USA",
            shiftEndTimeHour: "4",
            shiftEndTimeMeridiem: "pm",
            shiftEndTimeMinute: "00",
            shiftJobType: "Prep Cook",
            shiftLocation: {
              shiftAddress: "321 E Alameda Ave, Burbank, CA 91502, USA"
            },
            shiftQuantityOfWorkers: "1",
            shiftStartDate: {
              shiftStartASAPTodayTomorrowOther: "Tomorrow",
              shiftStartDate: "October 11, 2019 12:00 AM",
              shiftStartDateDay: 12,
              shiftStartDateMonth: 9,
              shiftStartDateYear: 2019
            },
            shiftStartDayName: "Saturday",
            shiftStartTimeHour: "10",
            shiftStartTimeMeridiem: "am",
            shiftStartTimeMinute: "00"
          };

          var params = {
            FunctionName: "payment_code_with_restaurant_manager_and_shift",
            InvocationType: "RequestResponse",
            LogType: "Tail",
            Payload: JSON.stringify(Payload)
          };

          let lambdaPromise = lambda.invoke(params).promise();

          let value = await lambdaPromise;
        }}
      >
        cost estimation for restaurant with confirmation code with shift with
        manager
      </button>
    </div>
  );
};
