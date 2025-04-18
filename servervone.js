const express = require('express');
const http = require('http');
const axios = require('axios');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');
const crypto = require('crypto');
const admin = require('firebase-admin');
const cron = require('node-cron');
const app = express();
const multer = require('multer');
const path = require('path');
const fetchRetry = require('node-fetch-retry');
const server = http.createServer(app);
const io = socketIO(server);
const port = process.env.PORT || 3308;
const requestIp = require('request-ip');
app.use(requestIp.mw())

app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));


var serviceAccount = require('./nodejs/doctracknotif-firebase-adminsdk-l5hyw-4ecbd3cc3b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


//const ServerIp = "http://192.168.203.13";
//const ServerIp = "http://192.168.254.111";

const ServerIp = "http://192.168.254.134";
//const ServerIp = "http://192.168.8.24";


//const ServerIp = "http://192.168.100.217";


//https://www.davaocityportal.com/gord/ajax/dataprocessor.php?seize=1
//http://localhost/gord/ajax/dataprocessor.php?seize=1
async function sendNotifForNonRegulatory() {
  try {
    const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?seize=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json(); 

    const tokens = data.map(item => ({ PushToken: item.PushToken, TransactionDelay: item.TransactionDelay, EmployeeNumber: item.EmployeeNumber }));

    //console.log('Fetched tokens:', tokens);

    const delayed = 0;

    for (let i = 0; i < tokens.length; i++) {
      const { PushToken, TransactionDelay: delay } = tokens[i]; // Corrected destructuring
    

      // Skip sending notification if TransactionDelay is 0
      if (delay === 0) {
        continue; // Move to the next iteration of the loop
      }


      const message = {
        notification: {
          title: 'Delayed Transactions',
          body: `${delay} transactions that have more than 3 days delayed`,
        },
        data: {
          screens: 'OfficeDelays',
          channelId: 'nonregulatorydelays',
          actions: JSON.stringify([
            {
              title: 'Mark as Read',
              pressAction: {
                id: 'read',
              },
            },
          ]),
        },
        groupId: 'NonRegDelays',
      };
    

    const payload = {
      tokens: [PushToken],
      data: {
        notifee: JSON.stringify(message),
        groupId: 'NonRegDelays',
      },
    };

    // Send the multicast message
    const messaging = admin.messaging(); // Assuming you have imported and initialized admin.messaging()
    const fcmResponse = await messaging.sendEachForMulticast(payload);

    //console.log('FCM Response:', fcmResponse);

    fcmResponse.responses.forEach((resp, idx) => {
      //console.log(`FCM Response for token ${tokens[idx].PushToken}:`, resp);
      //console.log(
       // `Successfully sent messages for token ${tokens[idx].PushToken}:`,
      //  resp.successCount,
     // );
    });
  }

    console.log(
      'Messages sent successfully to users non reg',
      
      tokens.map(token => token.EmployeeNumber),
    );
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
//sendNotifForNonRegulatory();


//https://www.davaocityportal.com/gord/ajax/dataprocessor.php?snatch=1
//http://localhost/gord/ajax/dataprocessor.php?snatch=1
async function sendNotifForRegulatory() {
  try {
    const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?snatch=1`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    
    const data = await response.json(); 

    const tokens = data.map(item => ({ PushToken: item.PushToken, TransactionDelay: item.TransactionDelay, EmployeeNumber: item.EmployeeNumber }));

    //console.log('Fetched tokens:', tokens);

    for (let i = 0; i < tokens.length; i++) {
      const { PushToken, TransactionDelay: delay } = tokens[i]; // Corrected destructuring

         // Skip sending notification if TransactionDelay is 0
         if (delay === 0) {
          continue; // Move to the next iteration of the loop
        }
    
      const message = {
        notification: {
          title: 'Delayed Transactions',
          body: `${delay} transactions that have more than 3 days delayed`,
        },
        data: {
          screens: 'Summary',
          channelId: 'regulatorydelays',
          actions: JSON.stringify([
            {
              title: 'Mark as Read',
              pressAction: {
                id: 'read',
              },
            },
          ]),
        },
        groupId: 'RegDelays',
      };
    

    const payload = {
      tokens: [PushToken],
      data: {
        notifee: JSON.stringify(message),
        groupId: 'RegDelays',
      },
    };

    // Send the multicast message
    const messaging = admin.messaging(); // Assuming you have imported and initialized admin.messaging()
    const fcmResponse = await messaging.sendEachForMulticast(payload);

    //console.log('FCM Response:', fcmResponse);

    fcmResponse.responses.forEach((resp, idx) => {
      //console.log(`FCM Response for token ${tokens[idx].PushToken}:`, resp);
      //console.log(
       // `Successfully sent messages for token ${tokens[idx].PushToken}:`,
      //  resp.successCount,
     // );
    });
  }

    console.log(
      'Messages sendNotifForReg sent successfully to users ',
      
      tokens.map(token => token.EmployeeNumber),
    );
  } catch (error) {
    console.error('Error sending message:', error);
  }
}
//sendNotifForRegulatory();


app.post('/triggerFunction', async (req, res) => {
 // const officeCodes = ['8751', '1031', '1081', 'BAAC', '1071', '1061', '1091'];
 const officeCode = 'TRAC';

  try {
    // Call the function
   // await sendToUsersWithOfficeCodes(officeCodes);

    sendNotifForNonRegulatory();
    sendNotifForRegulatory();
  //sendNotifRealtime(officeCode);
    res.status(200).send('Function triggered successfully');
  } catch (error) {
    console.error('Error triggering function:', error);
    res.status(500).send('Internal Server Error');
  }
});

const serverTime = new Date();
console.log(`Server time is: ${serverTime}`);

try {
  cron.schedule('0 8,13,15 * * 1-5', () => {
    const currentTime = new Date();
    console.log(`Cron job executed at ${currentTime}`);
    sendNotifForRegulatory();
    sendNotifForNonRegulatory();
  });
} catch (error) {
  console.error('Error scheduling cron job:', error);
}

//if(substr($docType, 0, 5) == "WAGES" || (substr($docType, 0, 8)  == "BENEFITS" && $docType != "BENEFITS - ELAP") || substr($docType, 0, 9)  == "ALLOWANCE" || $docType  == "ASSISTANCE - FINANCIAL"){

/* app.get('/julien/:office/:tn/:doctype', async (req, res) => {
  try {
    const ip = req.ip; 
    console.log('Requester IP:', ip);

    if (ip !== '::ffff:192.168.200.4' && ip !== '::ffff:192.168.100.217' && ip !== '::ffff:192.168.203.13' && ip !== '::ffff:192.168.61.1'){
      return res.status(403).json({ error: 'Forbidden' }); 
    }

    const headers = req.headers;
    const host = req.headers.host; 
    console.log('Host:', host);

    const officeCode = (req.params.office);
    console.log('Office Code:', officeCode);

    const tn = (req.params.tn);
    console.log('TN:', tn);

    const doctype = decodeURIComponent(req.params.doctype).replace(/\+/g, ' ');
    console.log('DT:', doctype);


    const sendNotifMyTransaction = (officeCode) => {
      console.log(`Notification sent for transaction in office: ${officeCode}`);
      // Implement the logic to send notification for my transaction
       };

      // Filter the doctype based on the given conditions
      if (doctype.startsWith("WAGES") || 
      (doctype.startsWith("BENEFITS") && doctype !== "BENEFITS - ELAP") || 
      doctype.startsWith("ALLOWANCE") || 
      doctype === "ASSISTANCE - FINANCIAL") {

      sendNotifMyTransaction(tn);
    }

    if (typeof officeCode === 'string' && officeCode.trim().length > 0) {
      try {
        const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?killua=1&office=${officeCode}`;

        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          throw new Error(`API request failed with status: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();

        io.to(officeCode).emit('updatedNowData', {Count: data, officeCode: officeCode});

        sendNotifRealtime(officeCode);

        return res.json({
          message: 'Data received and processed successfully',
          ip: ip,
          headers: headers,
          host: host,
          data: data 
        });
      } catch(error) {
        console.error('Error occurred:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid office code' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
 */

/* app.get('/julien/:office/:tn/:doctype', async (req, res) => {
  try {
    const ip = req.ip; 
    //console.log('Requester IP:', ip);

    if (ip !== '::ffff:192.168.200.4' && ip !== '::ffff:192.168.100.217' && ip !== '::ffff:192.168.203.13' && ip !== '::ffff:192.168.61.1'){
      return res.status(403).json({ error: 'Forbidden' }); 
    }

    const headers = req.headers;
    const host = req.headers.host; 
   // console.log('Host:', host);

    const officeCode = (req.params.office);
    console.log('Office Code:', officeCode);

    const tn = (req.params.tn);
    console.log('TN:', tn);

    const doctype = decodeURIComponent(req.params.doctype).replace(/\+/g, ' ');
    console.log('DT:', doctype);

    // Filter the doctype based on the given conditions
    if (doctype.startsWith("WAGES") || doctype.includes("SLP") || 
      (doctype.startsWith("BENEFITS") && doctype !== "BENEFITS - ELAP") || 
      doctype.startsWith("ALLOWANCE") || 
      doctype === "ASSISTANCE - FINANCIAL") {

      sendNotifMyTransaction(tn);

      // Return early if the first condition is met
      return res.json({
        message: 'Notification sent for specific document types',
        ip: ip,
        headers: headers,
        host: host
      });
    }

    if (typeof officeCode === 'string' && officeCode.trim().length > 0) {
      try {
        const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?killua=1&office=${officeCode}`;

        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          throw new Error(`API request failed with status: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();

        io.to(officeCode).emit('updatedNowData', {Count: data, officeCode: officeCode});

        sendNotifRealtime(officeCode);

        return res.json({
          message: 'Data received and processed successfully',
          ip: ip,
          headers: headers,
          host: host,
          data: data 
        });
      } catch(error) {
        console.error('Error occurred:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid office code' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
 */


/* app.get('/julien/:office/:tn/:doctype', async (req, res) => {
  try {
    const ip = req.ip;
    //console.log('Requester IP:', ip);

    if (ip !== '::ffff:192.168.200.4' && ip !== '::ffff:192.168.100.217' && ip !== '::ffff:192.168.203.13' && ip !== '::ffff:192.168.61.1'){
      return res.status(403).json({ error: 'Forbidden' });
    }

    const headers = req.headers;
    const host = req.headers.host;
    //console.log('Host:', host);

    const officeCode = req.params.office;
    console.log('Office Code:', officeCode);

    const tn = req.params.tn;
    console.log('TN:', tn);

    const doctype = decodeURIComponent(req.params.doctype).replace(/\+/g, ' ');
    console.log('DT:', doctype);

    // Condition for sending notification for document types except those starting with "SLP"
    if (!doctype.startsWith("SLP")) {
      sendNotifRealtime(officeCode);
    }

    // Filter the doctype based on the given conditions
    if (doctype.startsWith("WAGES") || doctype.includes("SLP") || 
      (doctype.startsWith("BENEFITS") && doctype !== "BENEFITS - ELAP") || 
      doctype.startsWith("ALLOWANCE") || 
      doctype === "ASSISTANCE - FINANCIAL") {

      sendNotifMyTransaction(tn);

      // Return early if the first condition is met
      return res.json({
        message: 'Notification sent for specific document types',
        ip: ip,
        headers: headers,
        host: host
      });
    }

    if (typeof officeCode === 'string' && officeCode.trim().length > 0) {
      try {
        const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?killua=1&office=${officeCode}`;

        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          throw new Error(`API request failed with status: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();

        io.to(officeCode).emit('updatedNowData', {Count: data, officeCode: officeCode});

        return res.json({
          message: 'Data received and processed successfully',
          ip: ip,
          headers: headers,
          host: host,
          data: data
        });
      } catch(error) {
        console.error('Error occurred:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid office code' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); */



async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error('All retry attempts failed.');
        throw error;
      }
    }
  }
}

app.get('/julien/:office/:tn/:doctype', async (req, res) => {
  try {
    const ip = req.ip;
    console.log(ip);

    const allowedIps = [
      '::ffff:192.168.200.4',
      '::ffff:192.168.100.217',
      '::ffff:192.168.203.13',
      '::ffff:192.168.61.1',
      '::ffff:192.168.254.134',
    ];
    if (!allowedIps.includes(ip)) {
      return res.status(403).json({ error: 'Forbidden' });
    }


    const headers = req.headers;
//     const host = req.headers.host;

//     const officeCode = req.params.office;
//     console.log('Office Code:', officeCode);

//     const tn = req.params.tn;
//     console.log('TN:', tn);

//     const doctype = decodeURIComponent(req.params.doctype).replace(/\+/g, ' ');
//     console.log('DT:', doctype);

    const { office: officeCode, tn, doctype } = req.params;
    console.log('Office Code:', officeCode);
    console.log('TN:', tn);
    console.log('DT:', decodeURIComponent(doctype).replace(/\+/g, ' '));

    const decodedDoctype = decodeURIComponent(doctype).replace(/\+/g, ' ');

    if (!decodedDoctype.startsWith('SLP')) {
      sendNotifRealtime(officeCode);
    }

    if (
      decodedDoctype.startsWith('WAGES') ||
      decodedDoctype.includes('SLP') ||
      (decodedDoctype.startsWith('BENEFITS') && decodedDoctype !== 'BENEFITS - ELAP') ||
      decodedDoctype.startsWith('ALLOWANCE') ||
      decodedDoctype === 'ASSISTANCE - FINANCIAL'
    ) {
      sendNotifMyTransaction(tn);
    }

    if (typeof officeCode === 'string' && officeCode.trim().length > 0) {
      try {
        const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?killua=1&office=${officeCode}`;

        const data = await fetchWithRetry(apiUrl, {}, 3, 2000); // Retry 3 times with 2 seconds delay

        if (!decodedDoctype.startsWith('SLP')) {
          io.to(officeCode).emit('updatedNowData', { Count: data, officeCode });
        }

        return res.json({
          message: 'Data received and processed successfully',
          ip,
          headers: req.headers,
          host: req.headers.host,
          data,
        });
      } catch (error) {
        console.error('Error occurred:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid office code' });
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//LEGIT
// app.get('/julien/:office/:tn/:doctype', async (req, res) => {
//   try {
//     const ip = req.ip;

//     console.log(ip);


//     if (ip !== '::ffff:192.168.200.4' && ip !== '::ffff:192.168.100.217' && ip !== '::ffff:192.168.203.13' && ip !== '::ffff:192.168.61.1' && ip !== '::ffff:192.168.254.134' && ip != '::ffff:120.28.215.237') {
     
     
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const headers = req.headers;
//     const host = req.headers.host;

//     const officeCode = req.params.office;
//     console.log('Office Code:', officeCode);

//     const tn = req.params.tn;
//     console.log('TN:', tn);

//     const doctype = decodeURIComponent(req.params.doctype).replace(/\+/g, ' ');
//     console.log('DT:', doctype);

//     // Condition for sending notification for document types except those starting with "SLP"
//     if (!doctype.startsWith("SLP")) {
//       sendNotifRealtime(officeCode);
//     }


    

//     // Filter the doctype based on the given conditions
//     if (doctype.startsWith("WAGES") || doctype.includes("SLP") || 
//       (doctype.startsWith("BENEFITS") && doctype !== "BENEFITS - ELAP") || 
//       doctype.startsWith("ALLOWANCE") || 
//       doctype === "ASSISTANCE - FINANCIAL") {

//       sendNotifMyTransaction(tn);

//       // Continue to the next part to trigger the socket.io emit
//     }

//     if (typeof officeCode === 'string' && officeCode.trim().length > 0) {
//       try {
//         const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?killua=1&office=${officeCode}`;

//         const apiResponse = await fetch(apiUrl);

//         if (!apiResponse.ok) {
//           throw new Error(`API request failed with status: ${apiResponse.status}`);
//         }
//         const data = await apiResponse.json();

//          // Emit the socket event unless the document type starts with "SLP"
//          if (!doctype.startsWith("SLP")) {
//           io.to(officeCode).emit('updatedNowData', { Count: data, officeCode: officeCode });
//         }

//         return res.json({
//           message: 'Data received and processed successfully',
//           ip: ip,
//           headers: headers,
//           host: host,
//           data: data
//         });
//       } catch (error) {
//         console.error('Error occurred:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//       }
//     } else {
//       return res.status(400).json({ error: 'Invalid office code' });
//     }
//   } catch (error) {
//     console.error('Error occurred:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// });





//REAL
//https://www.davaocityportal.com/gord/ajax/dataprocessor.php?itachi=1
//http://localhost/gord/ajax/dataprocessor.php?itachi=1
// async function sendNotifRealtime(officeCode) {
//   if (!officeCode) {
//     return;
//   } else {
//     try {
//       const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?itachi=1&office=${officeCode}`);
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch data');
//       }
      
//       const data = await response.json(); 
//       console.log(data);

//       const tokens = data.map(item => ({
//         PushToken: item.PushToken,
//         TransactionCountperOffice: item.TransactionCountperOffice,
//         EmployeeNumber: item.EmployeeNumber
//       })).filter(item => item.PushToken); // Filter out items without a PushToken

//     /*   if (tokens.length === 0) {
//         return; // Exit early if there are no valid push tokens
//       }
//  */
//       for (let i = 0; i < tokens.length; i++) {
//         const { PushToken, TransactionCountperOffice: count } = tokens[i]; 

//         if (!count) {
//           continue;
//         }


//         const message = { 
//           notification: {
//             title: 'Recently Updated',
//             body: `${count} of your office transactions have already been updated.`,
//           },
//           data: {
//             screens: 'RecentUpdated',
//             channelId: 'recentlyupdated',
//             groupId: 'Updated',
//             officeCode: officeCode,
//             actions: JSON.stringify([
//               {
//                 title: 'Mark as Read',
//                 pressAction: {
//                   id: 'read',
//                 },
//               },
//             ]),
//           },
//         };

//         const payload = {
//           tokens: [PushToken],
//           data: {
//             notifee: JSON.stringify(message),
//             groupId: 'Updated',
//           },
//         };

//         // Send the multicast message
//         const messaging = admin.messaging(); // Assuming you have imported and initialized admin.messaging()
//         const fcmResponse = await messaging.sendEachForMulticast(payload);

//         fcmResponse.responses.forEach((resp, idx) => {
//           // Handle each response if needed
//         });
//       }

//       console.log(
//         'Messages sendNotifRealtime sent successfully to users ',
//         tokens.map(token => token.EmployeeNumber),
//       );
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   }
// }

async function sendNotifRealtime(officeCode, retryCount = 3, delayMs = 5000) {
  if (!officeCode) {
    return;
  }

  let attempt = 0;

  while (attempt < retryCount) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch data for officeCode ${officeCode}`);

      const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?itachi=1&office=${officeCode}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      console.log(data);

      const tokens = data
        .map(item => ({
          PushToken: item.PushToken,
          TransactionCountperOffice: item.TransactionCountperOffice,
          EmployeeNumber: item.EmployeeNumber,
        }))
        .filter(item => item.PushToken); // Filter out items without a PushToken

      for (let i = 0; i < tokens.length; i++) {
        const { PushToken, TransactionCountperOffice: count, EmployeeNumber } = tokens[i];

        if (!count) {
          continue;
        }

        const message = {
          notification: {
            title: 'Recently Updated',
            body: `${count} of your office transactions have already been updated.`,
          },
          data: {
            screens: 'RecentUpdated',
            channelId: 'recentlyupdated',
            groupId: 'Updated',
            officeCode: officeCode,
            actions: JSON.stringify([
              {
                title: 'Mark as Read',
                pressAction: {
                  id: 'read',
                },
              },
            ]),
          },
        };

        const payload = {
          tokens: [PushToken],
          data: {
            notifee: JSON.stringify(message),
            groupId: 'Updated',
          },
        };

        const messaging = admin.messaging();
        const fcmResponse = await messaging.sendMulticast(payload);

        fcmResponse.responses.forEach((resp, idx) => {
          if (resp.success) {
            console.log(
              `Message successfully sent to ${EmployeeNumber} with token index ${idx}`,
            );
          } else {
            console.error(
              `Error sending message to ${EmployeeNumber} with token index ${idx}: ${resp.error.message}`,
            );

            // Optionally, handle token errors, e.g., removing invalid tokens
            if (resp.error.code === 'messaging/invalid-registration-token') {
              console.warn(`Invalid token for EmployeeNumber: ${EmployeeNumber}`);
              // Add logic to remove invalid tokens from your database
            } else if (resp.error.code === 'messaging/registration-token-not-registered') {
              console.warn(`Unregistered token for EmployeeNumber: ${EmployeeNumber}`);
              // Add logic to clean up unregistered tokens
            }
          }
        });
      }

      console.log(
        'Messages sendNotifRealtime sent successfully to users ',
        tokens.map(token => token.EmployeeNumber),
      );
      break; // Exit loop on successful execution

    } catch (error) {
      console.error('Error sending message:', error.message);

      if (attempt < retryCount - 1) {
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error('All retry attempts failed.');
      }
    }

    attempt++;
  }
}

// async function sendNotifRealtime(officeCode) {
//   if (!officeCode) {
//     return;
//   }

//   try {
//     const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?itachi=1&office=${officeCode}`);

//     if (!response.ok) {
//       throw new Error('Failed to fetch data');
//     }

//     const data = await response.json();
//     console.log(data);

//     const tokens = data
//       .map(item => ({
//         PushToken: item.PushToken,
//         TransactionCountperOffice: item.TransactionCountperOffice,
//         EmployeeNumber: item.EmployeeNumber,
//       }))
//       .filter(item => item.PushToken); // Filter out items without a PushToken

//     for (let i = 0; i < tokens.length; i++) {
//       const { PushToken, TransactionCountperOffice: count } = tokens[i];

//       if (!count) {
//         continue;
//       }

//       const message = {
//         notification: {
//           title: 'Recently Updated',
//           body: `${count} of your office transactions have already been updated.`,
//         },
//         data: {
//           screens: 'RecentUpdated',
//           channelId: 'recentlyupdated',
//           groupId: 'Updated',
//           officeCode: officeCode,
//           actions: JSON.stringify([
//             {
//               title: 'Mark as Read',
//               pressAction: {
//                 id: 'read',
//               },
//             },
//           ]),
//         },
//       };

//       const payload = {
//         tokens: [PushToken],
//         data: {
//           notifee: JSON.stringify(message),
//           groupId: 'Updated',
//         },
//       };

//       const maxRetries = 3; // Number of retry attempts
//       let attempt = 0;
//       let success = false;

//       while (attempt < maxRetries && !success) {
//         try {
//           const messaging = admin.messaging(); // Assuming admin.messaging() is initialized
//           const fcmResponse = await messaging.sendEachForMulticast(payload);

//           fcmResponse.responses.forEach((resp, idx) => {
//             if (!resp.success) {
//               console.error(`Failed to send message to token: ${payload.tokens[idx]}`, resp.error);
//             }
//           });

//           success = true; // Mark as successful if no errors occurred
//           console.log(`Notification sent successfully to token: ${PushToken}`);
//         } catch (error) {
//           attempt++;
//           console.error(
//             `Error sending notification to token: ${PushToken}, Attempt: ${attempt}`,
//             error
//           );

//           if (attempt < maxRetries) {
//             // Wait for a short delay before retrying (exponential backoff)
//             await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
//           } else {
//             console.error(`Failed to send notification after ${maxRetries} attempts`);
//           }
//         }
//       }
//     }

//     console.log(
//       'Messages sendNotifRealtime sent successfully to users ',
//       tokens.map(token => token.EmployeeNumber)
//     );
//   } catch (error) {
//     console.error('Error sending message:', error);
//   }
// }


async function sendNotifMyTransaction(tn) {
  console.log(`Notification for My Transaction`);
  //console.log("TN",tn);

  if (!tn) {
    return;
  } else {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?gusion=1&year=${currentYear}&tn=${tn}`);
      //console.log("res",response)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json(); 


      const tokens = data.map(item => ({
        PushToken: item.PushToken,
        EmployeeNumber: item.EmployeeNumber
      })).filter(item => item.PushToken); 

      if (tokens.length === 0) {
        return; 
      }

      for (let i = 0; i < tokens.length; i++) {
        const { PushToken } = tokens[i]; 

        if (!PushToken) {
          continue;
        }


        const message = { 
          notification: {
            title: 'My Personal',
            body: `${tn} have already been updated.`,
          },
          data: {
            screens: 'MyTransactions',
            channelId: 'mypersonal',
            actions: JSON.stringify([
              {
                title: 'Mark as Read',
                pressAction: {
                  id: 'read',
                },
              },
            ]),
          },
          groupId: 'MyTransactions',
          channelId: 'MyPersonal'
        };

        const payload = {
          tokens: [PushToken],
          data: {
            notifee: JSON.stringify(message),
            groupId: 'MyTransactions',
          },
        };

        // Send the multicast message
        const messaging = admin.messaging(); // Assuming you have imported and initialized admin.messaging()
        const fcmResponse = await messaging.sendMulticast(payload);

        fcmResponse.responses.forEach((resp, idx) => {
          // Handle each response if needed
        });
      }

      console.log(
        'Messages sendNotifMyTransactions sent successfully to users ',
        tokens.map(token => token.EmployeeNumber),
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

async function sendNotifInspector(TrackingNumber, Inspector) {
  try {
    const response = await fetch(`${ServerIp}/gord/ajax/dataprocessor.php?inspectorNotif=1&empnum=${encodeURIComponent(Inspector)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    const tokens = data.map(item => item.PushToken);

    const message = {
      notification: {
        title: 'Inspection',
        body: `You are assigned to inspect ${TrackingNumber}`,
      },
      data: {
        screens: 'ForInspection',
        channelId: 'forinspection',
        actions: JSON.stringify([
          {
            title: 'Mark as Read',
            pressAction: {
              id: 'read',
            },
          },
        ]),
      },
      groupId: 'ForInspection',
    };

    const payload = {
      tokens,  
      data: {
        notifee: JSON.stringify(message),
        groupId: 'ForInspection',
      },
    };

    const messaging = admin.messaging();
    const fcmResponse = await messaging.sendEachForMulticast(payload);
    
    console.log('FCM response:', fcmResponse);
  } catch (error) {
    console.error('Error sending inspector notifications:', error);
  }
}

app.post('/sendNotifInspector', async (req, res) => {
  const { TrackingNumber, Inspector } = req.body;

  if (!TrackingNumber || !Inspector) {
    return res.status(400).send('TrackingNumber and Inspector are required');
  }

  try {
    await sendNotifInspector(TrackingNumber, Inspector);
    res.status(200).send('Notifications sent successfully');
  } catch (error) {
    console.error('Error in /sendNotifInspector route:', error);
    res.status(500).send('Error sending notifications');
  }
});


const latestVersion = {
  version: '2.4',
  updateUrl: 'https://www.davaocityportal.com/gm8/DocMobile.apk' // URL where the update can be downloaded
};
console.log(latestVersion.version);

/* const latestVersion = '1.0.4';
console.log(latestVersion); */

app.get('/get-latest-version', (req, res) => {
  res.json({ latestVersion });
});
/*-------------------API -----------------------*/

/* app.get('/protectedRoute', verifyToken, (req, res) => {
  res.json({ message: 'Access granted!' });
});
 */

/* 
// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, 'feitan', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    req.user = decoded;
    next();
  });
} */


/* app.post('/loginApi', async (req, res) => {
  const { EmployeeNumber, Password, PushToken, UserDevice} = req.body;


  const hashedPassword = crypto
    .createHash('md5')
    .update(Password)
    .digest('hex');


  if (!EmployeeNumber || !Password || !PushToken || !UserDevice) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?ark=1&user=${EmployeeNumber}&pass=${hashedPassword}&pushToken=${PushToken}`;
  const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?ark=1&user=${EmployeeNumber}&pass=${encodeURIComponent(hashedPassword)}&pushToken=${PushToken}&userDevice=${encodeURIComponent(UserDevice)}`;

  console.log(apiUrl);

  try {
    const apiResponse = await fetch(apiUrl);
  
    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }
  
    const data = await apiResponse.json();
  
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    const employeeNumber = data[0].EmployeeNumber;
    const password = data[0].Password;

    if (EmployeeNumber !== employeeNumber || hashedPassword !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    //console.log(data);
  
    const token = jwt.sign({ data }, 'feitan');
  
    return res.json({ token });
  } catch (error) {
    console.error('Something went wrong!:', error.message);
    return res.status(500).json({ error: 'Error fetching data from external API' });

  }}); */


  app.post('/loginApi', async (req, res) => {
  const { EmployeeNumber, Password, PushToken, UserDevice } = req.body;

  console.log(EmployeeNumber, Password, PushToken, UserDevice);

  if (!EmployeeNumber || !Password || !PushToken || !UserDevice) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');
  const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?ark=1&user=${EmployeeNumber}&pass=${encodeURIComponent(hashedPassword)}&pushToken=${PushToken}&userDevice=${encodeURIComponent(UserDevice)}`;

  console.log(apiUrl);

  try {
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: `API request failed with status: ${apiResponse.status}` });
    }

    const data = await apiResponse.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const employeeNumber = data[0].EmployeeNumber;
    const password = data[0].Password;

    if (EmployeeNumber !== employeeNumber || hashedPassword !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ data }, 'feitan');
    return res.json({ token });

  } catch (error) {
    console.error('Something went wrong!', error);
    //return res.status(500).json({ error: 'Error fetching data from external API' });
    return res.status(500).json({ error: 'Something went wrong!' });

  }
});


app.post('/logoutApi', async (req, res) => {
  const { EmployeeNumber } = req.body;
  //console.log(EmployeeNumber);

  if (!EmployeeNumber) {
    return res.status(400).json({ error: 'Missing credentials' });
    
  }

 //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?sayonara=1&user=${EmployeeNumber}`; //live
  const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?sayonara=1&user=${EmployeeNumber}`; //local

  try {

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }
    console.log('Logged out successfully');

    // Assuming you don't expect any response from the API
    // If you do, you need to handle it accordingly
    // const data = await apiResponse.json();

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error updating LoginState and PushToken:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/userInfo', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenString = token.split(' ')[1];

    const isValidTokenFormat =
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/.test(tokenString);
  
    if (!isValidTokenFormat) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
  
    jwt.verify(tokenString, process.env.JWT_SECRET || 'defaultSecret', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?ark=1&user=${decoded.EmployeeNumber}&pass=${decoded.hashedPassword}`;

      const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?ark=1&user=${decoded.EmployeeNumber}&pass=${decoded.hashedPassword}`;

      const apiResponse = await fetchRetry(apiUrl);

      if (!apiResponse.ok) {
        throw new Error(`API request failed with status: ${apiResponse.status}`);
      }

      const userData = await apiResponse.json();

      return res.json(userData);
    });

  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/regOfficeDelays', async (req, res) => {

  try {
    const {OfficeCode} = req.query;

    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?leomord=1&office=${OfficeCode}` // live
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?leomord=1&office=${OfficeCode}`  //localhost
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?leomord=1&office=${OfficeCode}` // development

    //console.log(apiUrl);

    const apiResponse = await fetchRetry(apiUrl);

    
    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    res.json(data);

  } catch (error) {
    console.error('Error fetching data in regOfficeDelays:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/officeDelays', async (req, res) => {

  try {
    const {OfficeCode} = req.query;

    //console.log(OfficeCode);

    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?leomord=1&office=${OfficeCode}` // live
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?silvana=1&office=${OfficeCode}`  //localhost
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?silvana=1&office=${OfficeCode}`  //localhost


    const apiResponse = await fetchRetry(apiUrl);

    //console.log(apiResponse);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    res.json(data);

    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in officeDelays:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/genInformation', async (req, res) => {
  const { TrackingNumber, Year, accountType, officeCode } = req.query;

 // console.log(TrackingNumber, Year, accountType, officeCode);


  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?starfield=1&year=${Year}&tn=${TrackingNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?starfield=1&year=${Year}&tn=${TrackingNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?starfield=1&year=${Year}&tn=${TrackingNumber}&accountType=${accountType}&office=${officeCode}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in genInformation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/obrInformation', async (req, res) => {
  const { TrackingNumber, Year } = req.query;

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?palworld=1&year=${Year}&tn=${TrackingNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?palworld=1&year=${Year}&tn=${TrackingNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?palworld=1&year=${Year}&tn=${TrackingNumber}`;

    
    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in genInformation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/salaryList', async (req, res) => {
  const { TrackingNumber, Year } = req.query;

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?madara=1&year=${Year}&tn=${TrackingNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?madara=1&year=${Year}&tn=${TrackingNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?madara=1&year=${Year}&tn=${TrackingNumber}`;

    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

  } catch (error) {
    console.error('Error fetching data in SalaryList:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PR, PO, PX DETAILS
app.get('/prpopxDetails', async (req, res) => {
  const { TrackingNumber, Year, TrackingType } = req.query;
  //console.log(TrackingNumber, Year, TrackingType);


  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?enshrouded=1&year=${Year}&tn=${TrackingNumber}&type=${TrackingType}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?enshrouded=1&year=${Year}&tn=${TrackingNumber}&type=${TrackingType}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?enshrouded=1&year=${Year}&tn=${TrackingNumber}&type=${TrackingType}`;

    const apiResponse = await fetch(apiUrl);
    //console.log(apiUrl)

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
   // console.log("From server", data);
    
    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in prpopxDetails:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/paymentBreakdown', async (req, res) => {
  const { TrackingNumber, TrackingType, Year } = req.query;

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?falldown=1&year=${Year}&tt=${TrackingType}&tn=${TrackingNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?falldown=1&year=${Year}&tt=${TrackingType}&tn=${TrackingNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?falldown=1&year=${Year}&tt=${TrackingType}&tn=${TrackingNumber}`;

    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    //console.log("frmserver",data)

    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in payementBreakdown:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/paymentHistory', async (req, res) => {
  const { TrackingNumber, Year } = req.query;

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?horizon=1&year=${Year}&tn=${TrackingNumber}`;

    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    //console.log("frmserver",data)

    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in payementHistory:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/computationBreakdown', async (req, res) => {
  const { TrackingNumber, Year } = req.query;

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?fallout=1&year=${Year}&tn=${TrackingNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?fallout=1&year=${Year}&tn=${TrackingNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?fallout=1&year=${Year}&tn=${TrackingNumber}`;

    
    const apiResponse = await fetch(apiUrl);
    //console.log(apiUrl)


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in payementBreakdown:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/transactionHistory', async (req, res) => {
  const { TrackingNumber, Year } = req.query;

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?riptide=1&year=${Year}&tn=${TrackingNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?riptide=1&year=${Year}&tn=${TrackingNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?riptide=1&year=${Year}&tn=${TrackingNumber}`;
    
    const apiResponse = await fetch(apiUrl);
    //console.log(apiUrl)


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
   // console.log(data)

    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in genInformation:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/myTransactions', async (req, res) => {
  const {EmployeeNumber, Year} = req.query;

  //console.log("Year-- Server",Year, EmployeeNumber);
  

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?lesley=1&year=${Year}&empnum=${EmployeeNumber}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?lesley=1&year=${Year}&empnum=${EmployeeNumber}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?lesley=1&year=${Year}&empnum=${EmployeeNumber}`; //

    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    //console.log(data);

   // io.emit('myTransactionData', data);

    

    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in myTransactions:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/recentlyUpdated', async (req, res) => {
  const {OfficeCode} = req.query;

  //console.log("Year-- Server",Year);
  

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;

    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in recentlyUpdated:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

io.on('connection', (socket) => {
  //console.log('a user connected');

  const officeCode = socket.handshake.query.officeCode;


  socket.join(officeCode);
  /* console.log(`Client joined room: ${officeCode}`); */


  // Handle disconnection
  socket.on('disconnect', () => {
  /*   console.log('user disconnected'); */
  });
});

app.get('/updatedNow', async (req, res) => {
  const {OfficeCode} = req.query;
  
  //http://192.168.100.217/gord/ajax/dataprocessor.php?killua=1&office=
  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?killua=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?killua=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?killua=1&office=${OfficeCode}`;
    
    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    res.json(data);

    io.emit('updatedNowData', data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in updated now:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/transactionUpdate', async (req, res) => {
  const {Office, Year} = req.query;
  
  //http://192.168.100.217/gord/ajax/dataprocessor.php?killua=1&office=
  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?killua=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?killua=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?gusion=1&year=${Year}&office=${Office}`; //
    
    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    res.json(data); 

    io.emit('updatedNowData', data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in updated now:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/read', async (req, res) => {
  const {OfficeCode} = req.query;
  try {


    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?kakashi=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?kakashi=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?kakashi=1&office=${OfficeCode}`;

    
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log(data);
    
    res.json(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in reading notification:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/transactionSummary', async (req, res) => {
  const {Year, TrackingType, OfficeCode} = req.query;

  //console.log(Year, TrackingType, OfficeCode);

  //console.log("Year-- Server",Year);
  

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?gojo=1&year=${Year}&tt=${TrackingType}&office=${OfficeCode}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in transactionSummary:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/othersVouchers', async (req, res) => {
  const { year, office } = req.query; // Use lower case to match the frontend query parameters

  //console.log(year, office);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?toji=1&year=${year}&office=${office}`;

    //console.log(apiUrl);

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in othersVouchers:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/othersOthers', async (req, res) => {
  const { year, office } = req.query; // Use lower case to match the frontend query parameters

  //console.log(year, office);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?itadori=1&year=${year}&office=${office}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in othersothers:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/searchTrackingNumber', async (req, res) => {
  const { year, office, accountType, key } = req.query; 

  //console.log(year, office, accountType, key);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?nighteye=1&year=${year}&office=${office}&accountType=${accountType}&key=${key}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in searchTrackingNumber:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/searchPayroll', async (req, res) => {
  const { year, office, accountType, key } = req.query; 

  //console.log(year, office, accountType, key);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?allmight=1&year=${year}&office=${office}&accountType=${accountType}&key=${key}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in searchPayroll:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/getInspectionItems', async (req, res) => {
  const { year, trackingNumber,  accountType } = req.query; 

  console.log(year, trackingNumber,  accountType);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?conan=1&year=${year}&tn=${trackingNumber}&accountType=${accountType}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in searchPayroll:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/getInspectionPRDetails', async (req, res) => {
  const { year, trackingNumber } = req.query; 

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?inspectionPRDetails=1&year=${year}&tn=${trackingNumber}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in getInspectionPRDetails:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/inspectItems', async (req, res) => {
  const { year, employeeNumber, deliveryId, trackingNumber, status , invNumber, invDate, remarks} = req.query; 

  try {
    //const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?saitama=1&year=${year}&empnum=${employeeNumber}&tn=${trackingNumber}&status=${status}&remarks=${encodeURIComponent(remarks)}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?inspectItems=1&year=${year}&empnum=${employeeNumber}&deliveryId=${deliveryId}&tn=${trackingNumber}&status=${status}&invNumber=${invNumber}&invDate=${invDate}&remarks=${encodeURIComponent(remarks)}`;

    const apiResponse = await fetch(apiUrl);

    console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //  console.log(data);

  } catch (error) {
    console.error('Error fetching data in inspect items:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/getInspectorImage', async (req, res) => {
  try {
      const { year, trackingNumber } = req.query; 
     // console.log(year, trackingNumber);

      const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?getInspectorImage=1&year=${year}&tn=${trackingNumber}`;
     // console.log(apiUrl)
      const response = await fetch(apiUrl);
     // console.log(response);

      const data = await response.json();

     // console.log(data);

      if (data.success) {
          const images = data.images; 
          res.json({ success: data.success, images });
      } else {
          res.json({ error: data.error });
      }
  } catch (error) {
      console.error('Error fetching inspector images:', error);
      res.status(500).json({ error: 'An error occurred while fetching images.' });
  }
});


app.get('/getInspectionList', async (req, res) => {
  const { employeeNumber } = req.query; 

  //console.log(employeeNumber);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?genos=1&empnum=${employeeNumber}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in getInspectList:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/getRecentActivity', async (req, res) => {
  const { employeeNumber } = req.query; 

  if (!employeeNumber) {
    return res.status(400).json({ error: 'Employee number is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?loki=1&empnum=${employeeNumber}`;
    
    const apiResponse = await fetch(apiUrl);
    
    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

  } catch (error) {
    console.error('Error fetching data in getRecentActivity:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/getQRData', async (req, res) => {
  const { Year, TrackingNumber } = req.query; 

  //console.log(Year, TrackingNumber);

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?frieren=1&year=${Year}&tn=${TrackingNumber}`;

    const apiResponse = await fetch(apiUrl);

    //console.log(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

  } catch (error) {
    console.error('Error fetching data in get QR data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

//NEW 1-22-2025 below

app.get('/receiverReceived', async (req, res) => {
  const { Year, TrackingNumber, TrackingType, DocumentType, Status, AccountType, Privilege, OfficeCode, EmployeeNumber, inputParams } = req.query; 
  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?receiverReceived=1&year=${Year}&tn=${TrackingNumber}&tt=${TrackingType}&documentType=${DocumentType}&status=${Status}&accountType=${AccountType}&privilege=${Privilege}&officeCode=${OfficeCode}&empNum=${EmployeeNumber}&inputParams=${inputParams}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

  } catch (error) {
    console.error('Error fetching data in receiverReceived:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/receiverReverted', async (req, res) => {
  const { Year, TrackingNumber, TrackingType, DocumentType, Status, AccountType, Privilege, OfficeCode, EmployeeNumber } = req.query; 
  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?receiverReverted=1&year=${Year}&tn=${TrackingNumber}&tt=${TrackingType}&documentType=${DocumentType}&status=${Status}&accountType=${AccountType}&privilege=${Privilege}&officeCode=${OfficeCode}&empNum=${EmployeeNumber}`;

    console.log(apiUrl);
    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

  } catch (error) {
    console.error('Error fetching data in receiver reverted:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/receivingCount', async (req, res) => {
  const { EmployeeNumber } = req.query; 
  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?tobio=1&empnum=${EmployeeNumber}`;

    const apiResponse = await fetch(apiUrl);


    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);

  } catch (error) {
    console.error('Error fetching data in receivingCount:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/myAccountability', async (req, res) => {
  const { EmployeeNumber } = req.query;

  if (!EmployeeNumber) {
    return res.status(400).json({ error: 'EmployeeNumber is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?dabi=1&empnum=${EmployeeNumber}`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in myAccountability:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/trackingSummary', async (req, res) => {
  const { Year, OfficeCode } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  if (!OfficeCode) {
    return res.status(400).json({ error: 'OfficeCode is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?igris=1&year=${Year}&officeCode=${OfficeCode}`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in tracking summary:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/regTrackingSummary', async (req, res) => {
  const { Year, OfficeCode } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  if (!OfficeCode) {
    return res.status(400).json({ error: 'OfficeCode is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?beru=1&year=${Year}&officeCode=${OfficeCode}`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in reg tracking summary:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/trackingSummaryList', async (req, res) => {
  const { Year, OfficeCode, Status } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  if (!OfficeCode) {
    return res.status(400).json({ error: 'OfficeCode is required' });
  }
  if (!Status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?igris2=1&year=${Year}&officeCode=${OfficeCode}&status=${Status}`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in tracking summary list:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/regTrackingSummaryList', async (req, res) => {
  const { Year, OfficeCode, Status } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  if (!OfficeCode) {
    return res.status(400).json({ error: 'OfficeCode is required' });
  }
  if (!Status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?beru2=1&year=${Year}&officeCode=${OfficeCode}&status=${Status}`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in tracking summary list:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/requestForInspection', async (req, res) => {
  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?requestForInspection=1`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in request Inspection:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/inspectionInspectors', async (req, res) => {
  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?inspectionInspectors`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in inspection inspectors:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/onSchedule', async (req, res) => {
  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?onSchedule`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data in on Schedule:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/assignInspector', async (req, res) => {
  const { id, inspectorEmp, inspectorName } = req.query;

  console.log(id, inspectorEmp, inspectorName);

  if (!id || !inspectorEmp || !inspectorName) {
    return res.status(400).json({ error: 'requestId and inspectorId are required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?assignInspector=1&id=${id}&inspectorEmp=${inspectorEmp}&inspectorName=${inspectorName}`;
    const apiResponse = await axios.get(apiUrl);

    res.json(apiResponse.data);
  } catch (error) {
    console.error('Error fetching data:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.statusText });
    }
    
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getEvaluation', async (req, res) => {
  const { Year, EmployeeNumber, Status } = req.query;

  //console.log(Year, EmployeeNumber, Status);

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluation=1&year=${Year}&empnum=${EmployeeNumber}&status=${Status}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

    // Broadcast the update to all connected clients
    //io.emit('evaluationUpdated', data);
  } catch (error) {
    console.error('Error fetching evaluation data:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/evaluatorEvaluate', async (req, res) => {
  const { Year,TrackingNumber, EmployeeNumber, Status } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorEvaluate=1&year=${Year}&tn=${TrackingNumber}&empnum=${EmployeeNumber}&status=${Status}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching evaluation data:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/evaluatorRevert', async (req, res) => {
  const { Year,TrackingNumber, EmployeeNumber, Status } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorRevert=1&year=${Year}&tn=${TrackingNumber}&empnum=${EmployeeNumber}&status=${Status}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching evaluation data:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/getEvaluatorSummary', async (req, res) => {
  const { Year, EmployeeNumber } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorSummary=1&year=${Year}&empnum=${EmployeeNumber}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching evaluator summary:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/getEvaluatorAnnualSummary', async (req, res) => {
  const { Year, EmployeeNumber } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorAnnualSummary=1&year=${Year}&empnum=${EmployeeNumber}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching evaluator summary:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/getEvaluatorMonthlySummary', async (req, res) => {
  const { Year, EmployeeNumber } = req.query;

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorMonthlySummary=1&year=${Year}&empnum=${EmployeeNumber}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching evaluator summary:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/getEvaluatorMonthlyDetails', async (req, res) => {
  const { Year, EmployeeNumber, Status, Month } = req.query;
  //console.log(Year,EmployeeNumber,Status, Month);
  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorMonthlyDetails=1&year=${Year}&empnum=${EmployeeNumber}&status=${Status}&month=${Month}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching evaluator summary:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

/* app.get('/getEvaluatorSummary', async (req, res) => {
  const { Year, EmployeeNumber } = req.query;
  //console.log(Year, EmployeeNumber);

  if (!Year) {
    return res.status(400).json({ error: 'Year is required' });
  }
  if (!EmployeeNumber) {
    return res.status(400).json({ error: 'EmployeeNumber is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?evaluatorSummary=1&year=${Year}&empnum=${EmployeeNumber}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });
    
    if (!data || (Array.isArray(data.accumulated) && data.accumulated.length === 0 && 
                  Array.isArray(data.unique) && data.unique.length === 0)) {
      return res.status(200).json({ message: 'No data available', accumulated: [], unique: [] });
    }

    res.json({ accumulated: data.accumulated || [], unique: data.unique || [] });

  } catch (error) {
    console.error('Error fetching evaluation data:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
}); */

app.get('/getInspection', async (req, res) => {
  const { EmployeeNumber } = req.query;

  if (!EmployeeNumber) {
    return res.status(400).json({ error: 'EmployeeNumber is required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?inspection=1&empnum=${EmployeeNumber}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);

  } catch (error) {
    console.error('Error fetching inspection data:', error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/addSchedule', async (req, res) => {
  const { deliveryId, date } = req.query;

  console.log(deliveryId,date);

  if (!deliveryId || !date) {
    return res.status(400).json({ error: 'deliveryId and date are required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?addSchedule=1&deliveryId=${deliveryId}&date=${encodeURIComponent(date)}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);
  } catch (error) {
    console.error('Error adding schedule:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/editDeliveryDate', async (req, res) => {
  const { deliveryId, deliveryDate } = req.query;

  if (!deliveryId || !deliveryDate) {
    return res.status(400).json({ error: 'deliveryId and deliveryDate are required' });
  }

  try {
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?editDeliveryDate=1&deliveryId=${deliveryId}&deliveryDate=${encodeURIComponent(deliveryDate)}`;
    const { data } = await axios.get(apiUrl, { timeout: 5000 });

    res.json(data);
  } catch (error) {
    console.error('Error adding schedule:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Internal Server Error' });
  }
});

app.get('/getAttachmentFiles', async (req, res) => {
  try {
      const { year, trackingNumber, form } = req.query; 

      console.log(year, trackingNumber, form )

      const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?getAttachmentFiles=1&year=${year}&tn=${trackingNumber}&type=${encodeURIComponent(form)}`;
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
          return res.status(response.status).json({ error: 'Failed to fetch attachment files from server.' });
      }

      const data = await response.json();

      if (data.success) {
          const images = data.images; 
          return res.json({ success: data.success, images });
      } else {
          return res.json({ error: data.error });
      }
  } catch (error) {
      console.error('Error fetching attachment files:', error);
      return res.status(500).json({ error: 'An error occurred while fetching attachment files.' });
  }
});

app.get('/projectCleansing', async (req, res) => {

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?sukuna=1`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in project cleansing:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/projectCleansingDetails', async (req, res) => {
  const {Barangay, Title, Office, Status, Inspected, Fund} = req.query;
  //console.log(Barangay, Title, Office, Status, Inspected, Fund);

  try {
    // Existing code remains the same
    //const apiUrl = `https://www.davaocityportal.com/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    //const apiUrl = `http://localhost/gord/ajax/dataprocessor.php?beatrix=1&office=${OfficeCode}`;
    const apiUrl = `${ServerIp}/gord/ajax/dataprocessor.php?mahoraga=1&barangayName=${Barangay}&title=${Title}&office=${Office}&status=${Status}&inspected=${Inspected}&fund=${Fund}`;

    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    
    res.json(data);
    //console.log(data);

    // Remaining code remains the same
  } catch (error) {
    console.error('Error fetching data in project cleansing details:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});




// Configure multer for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create the uploads folder if it doesn't exist
const fs = require('fs');
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// POST endpoint for image upload
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.status(200).send({
    message: 'File uploaded successfully!',
    file: req.file
  });
});










server.listen(3308, () => {
  console.log('Server is running on port 3308');
  console.log(`Server is running at http://localhost:${port}/`);
});
