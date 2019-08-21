'use strict'

const fs = require('fs')
const Chain = require('stream-chain')
const { parser } = require('stream-json')
const { Transform } = require('stream')
const { streamArray } = require('stream-json/streamers/StreamArray')

const TIME_LABEL = 'time of json stream processing pipeline' 

export function processJSON(filepath, { analyzeSongs }) {
    console.time(TIME_LABEL)
    return new Promise((resolve, reject) => {
        let jsonAnalysis = null

        const dataStreamSource = fs.createReadStream(filepath)
        const pipeline = new Chain([
            dataStreamSource,
            parser(),
            streamArray(),
            analyzeSongs(),
            new Transform({
                writableObjectMode: true,
                transform(chunk, _, callback) {
                  // transform to JSON string
                  let jsonAnalysisString = `${JSON.stringify(chunk, null, 5)}\n`
                  jsonAnalysis = JSON.parse(jsonAnalysisString)
                  callback(null, jsonAnalysisString)
                }
            })
        ])

        pipeline.on('end', (data) => {
            console.timeEnd(TIME_LABEL)
            let msg = `Pipeline finished processing the stream ${filepath}`
            resolve({
                msg,
                jsonAnalysis
            })
        })

        pipeline.on('error', console.error);

        // use the chain, and save the result to a file
        dataStreamSource
            .pipe(pipeline)
            .pipe(fs.createWriteStream('tests/results/songs-analysis-results.json'))



    })
}