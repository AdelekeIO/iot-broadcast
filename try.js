const axios = require("axios");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const db = new JsonDB(new Config("myDataBase", true, false, "/"));
var data = [];
// The second argument is used to tell the DB to save after each push
// If you put false, you'll have to call the save() method.
// The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// The last argument is the separator. By default it's slash (/)
// var db = new JsonDB(new Config("myDataBase", true, false, "/"));

const d = async () => {
  let res = await axios({
    method: "POST",
    url: "https://9cwdo1u2ih.execute-api.us-east-1.amazonaws.com/dev/graphql",
    data: {
      query: `{
        devices{
          DeviceID
          mode
          payload
          expiry
          owner{
            CID
            name
            user
            locations
            deviceType
            email
          }
        }
      }`
    }
  })
    .then(res => {
      let { devices } = res.data.data;
      // console.log(devices);
      // data = devices;

      return devices;
    })
    .catch(err => console.log(err));
  // console.log(res);
  data.push(res);
  return res;
};
// setTimeout(() => {}, 10000);
d();
setTimeout(() => {
  if (data.length !== 0) {
    console.log(data);
  } else {
    console.log("Not Available");
  }
}, 3000);
// if (db.getData("/arraytest/myarray[0]/obj")) {
//   var testString = db.getData("/arraytest/myarray[0]/obj");
//   while (testString != "" || testString != undefined) {
//     // code block to be executed
//     console.log(testString);
//   }
// }
// d();
