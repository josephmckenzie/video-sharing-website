
// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Load credentials and set region from JSON file
AWS.config.loadFromPath('./config.json');


//Creates S3 service object
var s3 = new AWS.S3();


// Name to give to your bucket , remember bucket names must be unique across all S3 users
//var myBucket = 'josephmckenzie-pretranscoded-videos22';

//Key to give your bucket (the file name with out extension in our case)
//var myKey = 'myBucketKey';

// Creates a new bucket with the name you give in the preceeding variable 
//s3.createBucket({Bucket: myBucket}, function(err, data) {
//
//if (err) {
//
//   console.log(err);
//
//   } else {
//// Sets params to the bucket name you just chose, and sets a key for it 
//     params = {Bucket: myBucket, Key: myKey, Body: 'Hello!'};
//
//     s3.putObject(params, function(err, data) {
//
//         if (err) {
//
//             console.log(err)
//
//         } else {
//
//             console.log("Successfully uploaded data to myBucket/myKey");
//
//         }
//
//      });
//
//   }
//
//});

// Lists the buckets your account
//s3.listBuckets(function(err, data) {
//  if (err) console.log(err, err.stack); // an error occurred
//  else     console.log(data);           // successful response
//});

// Any paramaters you need to pass to S3 for now it kust needs the bucket name and how many keys (or files) you want to bring back.
var params = {
 // The Bucket name you want to interact with
  Bucket: "josephmckenzie-pretranscoded-videos", 
 // Max number of objects or files you want to bring back from your bucket. 
 MaxKeys: 2,
 
 };
// This will list all objects (or files) that are in the bucket you specified
 s3.listObjects(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data.Contents[0].Key); 
          var path = require('path')
          var extension = path.extname(data.Contents[0].Key)  
          console.log(extension);
if( extension == '.avi' || extension == '.mp4' || extension == '.mov'){ 
  console.log("you sent vaild format, so you will be allowed to stay and be transcoded");
 elasticTranscoder.createJob(params, function(error, data){
        if (error){
            callback(error);
        }
        console.log('elasticTranscoder callback data: ' + JSON.stringify(data));
    });
} else {
  console.log("you sent invaild format, so you will be deleted");
 
 var params = {
  Bucket: "josephmckenzie-pretranscoded-videos", 
 // The name of the object (or file) you want to delete from your bucket
  Key: data.Contents[0].Key
 };
// This will delete objects (or files) from your bucket.
 s3.deleteObject(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
 });

};
  

 });




 


//// Same as above params but instead of passing it Maxkeys we want to pass the name of the object (or file) you want to delete from your bucket.
//var params = {
//  Bucket: "josephmckenzie-pretranscoded-videos", 
// // The name of the object (or file) you want to delete from your bucket
//  Key: "teecee-1of10000 (copy).virus"
// };
//// This will delete objects (or files) from your bucket.
// s3.deleteObject(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
//   /*
//   data = {
//   }
//   */
// });