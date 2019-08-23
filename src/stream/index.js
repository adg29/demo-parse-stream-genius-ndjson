'use strict'

const fs = require('fs')
const Chain = require('stream-chain')
const { parser } = require('stream-json')
const { Transform } = require('stream')
const { streamArray } = require('stream-json/streamers/StreamArray')

const TIME_LABEL = 'Processed json stream pipeline in' 

export function processJSON(filepath, { analyzeSongs, config }) {
    console.time(TIME_LABEL)
    return new Promise((resolve, reject) => {
        let jsonAnalysis = null

        const dataStreamSource = fs.createReadStream(filepath)
        const pipeline = new Chain([
            dataStreamSource,
            parser(),
            streamArray(),
            sampleJSON(config),
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

export const sampleJSON = ({RANDOM = false, SAMPLE_SIZE = 10, STREAM_SIZE = 2000} = {}) => {
    if (RANDOM) {
        const sampleIndices = new Set();
        while(sampleIndices.size !== SAMPLE_SIZE) {
          sampleIndices.add(Math.floor(Math.random() * STREAM_SIZE) + 1);
        }

        return ({key, value}) => {
            if (sampleIndices.has(key)) return {key, value}
            else return null
        }
    } else {
        return ({key, value}) => {
            if (key < SAMPLE_SIZE) return {key, value}
            else return null
        }
    }
}

