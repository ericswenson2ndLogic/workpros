const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

const nodemailer = require("nodemailer");

const pdf = require("html-pdf");

const fs = require("fs");

const moment = require("moment-timezone");

moment.tz.setDefault("America/Los_Angeles");

app.use(express.static(path.join(__dirname, "build")));

app.get("/ping", function(req, res) {
  // const handler = event => {
  //   const {
  //     name,
  //     prices,
  //     ubers,
  //     items,
  //     receiptId,
  //     emailAddress,
  //     emailSubject,
  //     emailBody,
  //     shiftLowestPayment
  //   } = event;

  //   const today = new Date();

  //   const todayMoment = moment(today);

  //   let sum = "";
  //   const doc = `
  //   <!doctype html>
  //   <html>
  //      <head>
  //         <meta charset="utf-8">
  //         <title>PDF Result Template</title>
  //         <style>
  //            .invoice-box {
  //            max-width: 800px;
  //            margin: auto;
  //            padding: 30px;
  //            border: 1px solid #eee;
  //            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
  //            font-size: 16px;
  //            line-height: 24px;
  //            font-family: 'Helvetica Neue', 'Helvetica',
  //            color: #555;
  //            }
  //            .margin-top {
  //            margin-top: 50px;
  //            }
  //            .justify-center {
  //            text-align: center;
  //            }
  //            .invoice-box table {
  //            width: 100%;
  //            line-height: inherit;
  //            text-align: left;
  //            }
  //            .invoice-box table td {
  //            padding: 5px;
  //            vertical-align: top;
  //            }
  //            .invoice-box table tr td:nth-child(2) {
  //            text-align: right;
  //            }
  //            .invoice-box table tr.top table td {
  //            padding-bottom: 20px;
  //            }
  //            .invoice-box table tr.top table td.title {
  //            font-size: 45px;
  //            line-height: 45px;
  //            color: #333;
  //            }
  //            .invoice-box table tr.information table td {
  //            padding-bottom: 40px;
  //            }
  //            .invoice-box table tr.heading td {
  //            background: #eee;
  //            border-bottom: 1px solid #ddd;
  //            font-weight: bold;
  //            }
  //            .invoice-box table tr.details td {
  //            padding-bottom: 20px;
  //            }
  //            .invoice-box table tr.item td {
  //            border-bottom: 1px solid #eee;
  //            }
  //            .invoice-box table tr.item.last td {
  //            border-bottom: none;
  //            }
  //            .invoice-box table tr.total td:nth-child(2) {
  //            border-top: 2px solid #eee;
  //            font-weight: bold;
  //            }
  //            @media only screen and (max-width: 600px) {
  //            .invoice-box table tr.top table td {
  //            width: 100%;
  //            display: block;
  //            text-align: center;
  //            }
  //            .invoice-box table tr.information table td {
  //            width: 100%;
  //            display: block;
  //            text-align: center;
  //            }
  //            .new-page {
  //              page-break-before: always;
  //            }
  //            }
  //         </style>
  //      </head>
  //      <body>
  //         <div class="invoice-box">
  //            <table cellpadding="0" cellspacing="0">
  //               <tr class="top">
  //                  <td colspan="2">
  //                     <table>
  //                        <tr>
  //                           <td class="title"><img  src="https://img.icons8.com/ios/500/000000/forumbee-filled.png"
  //                              style="width:100%; max-width:156px;"></td>
  //                           <td>
  //                              Date: ${`${todayMoment.format("LLLL")}.`}
  //                           </td>
  //                        </tr>
  //                     </table>
  //                  </td>
  //               </tr>
  //               <tr class="information">
  //                  <td colspan="2">
  //                     <table>
  //                        <tr>
  //                           <td>
  //                              Worker name: ${name}
  //                           </td>
  //                           <td>
  //                              Shift number: ${receiptId}
  //                           </td>
  //                        </tr>
  //                     </table>
  //                  </td>
  //               </tr>
  //               <tr class="heading">
  //                  <td>Shift Confirmation:</td>
  //                  <td>Specification</td>
  //               </tr>

  //               ${prices.map((price, index) => {
  //                 // sum += price;
  //                 return `<tr class="item">
  //                     <td>Item ${index + 1}: ${items[index]}</td>
  //                     <td>${price}</td>
  //                   </tr>`;
  //               })}
  //            </table>
  //            <br />
  //            <h1 class="justify-center">Total Payout: ${shiftLowestPayment}$</h1>

  //         </div>

  //         <div style = "display:block; clear:both; page-break-after:always;"></div>
  //         <p class="new-page"></p>

  //         <div class="invoice-box">
  //         <table cellpadding="0" cellspacing="0">
  //         <tr class="top">
  //            <td colspan="2">
  //               <table>

  //                 </table>
  //                 </td>
  //              </tr>
  //              </table>
  //         </div>
  //      </body>
  //   </html>
  //   `;

  //   return new Promise((resolve, reject) => {
  //     pdf.create(doc).toFile("ShiftSummary.pdf", err => {
  //       if (err) {
  //         console.log(err);
  //         return console.log("error");
  //       }
  //       Promise.resolve();

  //       const transporter = nodemailer.createTransport({
  //         service: "gmail",
  //         auth: {
  //           user: "ericswenson15@gmail.com",
  //           pass: "Ejs2689."
  //         }
  //       });

  //       var mailOptions = {
  //         from: "ericswenson15@gmail.com",
  //         to: emailAddress,
  //         subject: emailSubject,
  //         html: emailBody,
  //         text: "Check out this attached pdf file",
  //         attachments: [
  //           {
  //             filename: "ShiftSummary.pdf",
  //             path: __dirname + "/ShiftSummary.pdf",
  //             contentType: "application/pdf"
  //           }
  //         ]
  //       };

  //       transporter.sendMail(mailOptions, function(error, info) {
  //         if (error) {
  //           console.log(error);
  //         } else {
  //           resolve(`success sending email to ${emailAddress}`);
  //           console.log("Email sent: to " + to);
  //         }
  //       });
  //     });
  //   });
  // };

  // const testDirectly = async () => {
  //   const event = {
  //     name: "Montez Robinson (Dallas)",
  //     prices: [
  //       "October 31st",
  //       "9:00 AM",
  //       "5215 North O'Connor Boulevard, Central Lower Lobby",
  //       "Line Cook (Sous Chef)",
  //       "Close Toed Shoes and Safe Handler's Card",
  //       "CashApp",
  //       "$montezuma90"
  //     ],
  //     ubers: [],
  //     items: [
  //       "Shift Date",
  //       "Shift Time",
  //       "Restaurant Address",
  //       "Work Type",
  //       "Requirements",
  //       "Payment Method",
  //       "Payment Username"
  //     ],
  //     receiptId: Math.round(Math.random() * 10000),
  //     emailAddress: "ejswenson@alumni.princeton.edu",
  //     emailSubject: "WorkPros.io Receipt",
  //     emailBody: `

  //     `,
  //     shiftLowestPayment: "50"
  //   };

  //   handler(event);
  // };

  // testDirectly();

  return res.send("pong");
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 3000);
