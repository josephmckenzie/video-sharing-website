

//We will want to add the capability of reading an environmental variable from a local .env and loading it in to process.env
//I'll check and see if this is actually required here as it wasnt in here originally but I usually always add it in my code, but I also have never tried an env inside of a .json file so it may be for that. Ill update the comments to reflect once I find out for sure.
require('dotenv').config();

'use strict';
//We require the aws node module so we can easly interact with Amazon's Api
var AWS = require('aws-sdk');
//We first need to start a new instance of Amazon's Elastic Transcoder that will transcode the video in to the correct formats and bit rate for a users given device
var elasticTranscoder = new AWS.ElasticTranscoder({
 //**** Use an enviroment variable as not to upload any sensitive account credentials or information
    region: process.env.ELASTIC_TRANSCODER_REGION
});
var s3 = new AWS.S3();

exports.handler = function(event, context, callback){
    console.log('Welcome to Joes Super Cool Video Transcoder');
 //event is the video file and any associated file information from youruniqueandcoolname-video-upload bucket
    console.log('event: ' + JSON.stringify(event));

    var key = event.Records[0].s3.object.key;
    console.log(key)
    //we check the name of the input file as some may have spaces in them and if they do replaces them with a '+'
    //Using a /g (which is global) will ensure that all spaces are replaced because by default the .replace method only updates the first value needing modified it comes to.
     var sourceKey = decodeURIComponent(key.replace(/\s+/g, '+'));
    // next we will want to remove the extension from the file name
    //Having changed my regexp expression I now can remove all the periods in a filename except the last one before the extension type
      var rogue_period_replacer = sourceKey.replace(/\.(?=.*\.)/g,'+');

    // Having replaced all periods except for the very last one we can now remove the one for the extension as well so that we can have an output key which is the file name without an extension or non alphanumeric 
    var outputKey = rogue_period_replacer.split('.')[0];
    var extension = rogue_period_replacer.split('.')[1];
 
 
    var elasticParams = {
     // Once again we want to use an environmental variable to ensure our secure account information is kept confidential
        PipelineId: process.env.ELASTIC_TRANSCODER_PIPELINE_ID,
     //our outputKey is the file name after all spaces have been  updated to a '+'  and the extension type removed  
     OutputKeyPrefix: outputKey + '/',
        Input: {
         // sourceKey is our file name before the extension was removed
            Key: sourceKey
        },
        Outputs: [
            {
                Key: outputKey + '-1080p' + '.mp4',
                PresetId: '1351620000001-000001' //Generic 1080p
            },
            {
                Key: outputKey + '-720p' + '.mp4',
                PresetId: '1351620000001-000010' //Generic 720p
            },
            {
                Key: outputKey + '-web-720p' + '.mp4',
                PresetId: '1351620000001-100070' //Web Friendly 720p
            }
        ]};
 
   var listObjectsparams = {
    // The Bucket name you want to interact with
    Bucket: "josephmckenzie-pretranscoded-videos", 
    // Max number of objects or files you want to bring back from your bucket. 
    MaxKeys: 2,
   };
   // This will list all objects (or files) that are in the bucket you specified
   s3.listObjects(listObjectsparams, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data.Contents[0].Key); 
    var path = require('path')
    var extension = path.extname(data.Contents[0].Key)  
    console.log(extension);
    if( extension == '.avi' || extension == '.mp4' || extension == '.mov'){ 
     console.log("you sent vaild format, so you will be allowed to stay and be transcoded");
     elasticTranscoder.createJob(elasticParams, function(error, data){
      if (error){
       callback(error);
      }
      console.log('elasticTranscoder callback data: ' + JSON.stringify(data));
     });
    } else {
     console.log("you sent invaild format, so you will be deleted");

     var deleteParams = {
      Bucket: "josephmckenzie-pretranscoded-videos", 
      // The name of the object (or file) you want to delete from your bucket
      Key: data.Contents[0].Key
     };
     // This will delete objects (or files) from your bucket.
     s3.deleteObject(deleteParams, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
     });
    };
   });
  };