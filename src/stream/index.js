'use strict'

const fs = require('fs')
const Chain = require('stream-chain')
const { parser } = require('stream-json')
const { Transform } = require('stream')
const { streamArray } = require('stream-json/streamers/StreamArray')

import { countSections, attributeSections } from '../parse/sections'


const TIME_LABEL = 'time of json stream processing pipeline' 

export function processJSON(filepath) {
    console.time(TIME_LABEL)
    console.log(`processing ${filepath}`)
    return new Promise((resolve, reject) => {
        let countProcessedObjects = 0
        let attributions = {}


        const dataStreamSource = fs.createReadStream(filepath)
        const pipeline = new Chain([
            dataStreamSource,
            parser(),
            streamArray(),
            ({key, value}) => {
                let song = value
                if (song) {
                    // console.log(`${key} song ${song.title}`) 
                    let artist = attributeSections(song)
                    let sections = countSections(song.lyrics_text)
                    if (attributions[artist]) {
                        attributions[artist] += sections
                    } else {
                        attributions[artist] = sections
                    }
                } else {
                   console.log(`no song on ${key}`) 
                }
                return song
            },
            // uses an arbitrary transform stream
            new Transform({
                writableObjectMode: true,
                transform(x, _, callback) {
                  // transform to text
                  callback(null, JSON.stringify(x))
                }
            }),
        ])

        pipeline.on('data', (data) => {
            ++countProcessedObjects
        })

        pipeline.on('end', () => {
            console.timeEnd(TIME_LABEL)
            let msg = `Processed ${countProcessedObjects} objects via ${filepath} stream`
            resolve({
                msg,
                countProcessedObjects,
                attributions
            })
        })

        // log errors
        pipeline.on('error', console.error);
        // use the chain, and save the result to a file
        dataStreamSource
           .pipe(pipeline)
           .pipe(fs.createWriteStream('tests/results/songs-analysis-results.json'))


    })
}


