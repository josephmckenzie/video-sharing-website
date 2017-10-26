/**
 * Created by Peter Sbarski
 * Updated by Mike Chambers
 * Last Updated: 1/02/2017
 *
 * Required Env Vars:
 * ELASTIC_TRANSCODER_REGION
 * ELASTIC_TRANSCODER_PIPELINE_ID
 */

//We will want to add the capability of reading an enviromental variable from a local .env and loading it in to process.env
//I'll check and see if this is actually required here as it wasnt in here originally but I usually always add it in my code, but I also have nver tried an env inside of a .json file so it may be for that. Ill update the comments to reflect once I find out for sure.
require('dotenv').config();

'use strict';
//We require the aws node module so we can easly interact with Amazon's Api
var AWS = require('aws-sdk');
//We first need to start a new instance of Amazon's Elastic Transcoder that will transcode the video in to the correct formats and bitrate for a users given device
var elasticTranscoder = new AWS.ElasticTranscoder({
 //**** Use an enviromental variable as not to upload any sensitive account credentials or information
    region: process.env.ELASTIC_TRANSCODER_REGION
});

exports.handler = function(event, context, callback){
    console.log('Welcome to Joes Super Cool Video Transcoder');
 //event is the video file and any associated file information from youruniqueandcoolname-video-upload bucket
    console.log('event: ' + JSON.stringify(event));

    var key = event.Records[0].s3.object.key;
    console.log(key)
    //we check the name of the input file as some may have spaces in them and if they do replaces them with a '+'
    //Using a /g (which is global) will ensure that all spaces are replaced because by default the .replace method only updates the first value needing modified it comes to.
    var sourceKey = decodeURIComponent(key.replace(/\+/g, ' '));

    // next we will want to remove the extension from the file name
    // Here I may have to change this up to account for any periods in the file name unless we account for that before video upload.
    var outputKey = sourceKey.split('.')[0];

    var params = {
     // Once again we want to use an enviromental variable to to ensure our secure account information is kept confidental
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
// We call upon the elasticTranscoder to create a job passing in the params that include the filename with along with the format and bitrate for it to be transcoded into a more awesome format 
    elasticTranscoder.createJob(params, function(error, data){
        if (error){
            callback(error);
        }
        console.log('elasticTranscoder callback data: ' + JSON.stringify(data));
    });
};
