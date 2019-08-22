'use strict'

import fold from 'stream-chain/utils/fold'
import { attributeSections, countSections } from '../parse/sections'
import { matchHeaders } from '../parse/headers'
import { nlpArtists } from './headers'

const analysisSchema = {
    songs: 0,
    artists: {},
    artistAttributions: {},
    artistWords: {},
    collaborators: {},
    headers: []
}

export const analyzeSongs = () => {
    return fold((analysisAggregate, {key, value}) => {

        let song = value
        let attributions = analysisAggregate.artistAttributions
        let collaborators = analysisAggregate.collaborators
        let headers = analysisAggregate.headers
        if (song) {
            // console.log(`${key} song ${song.title}`) 

            let artist = attributeSections(song)
            let sections = countSections(song.lyrics_text)

            if (attributions[artist]) {
                attributions[artist] += sections
            } else {
                attributions[artist] = sections
            }

            console.time('Matched headers in')
            let headersMatched = matchHeaders(song.lyrics_text)
            console.log(`${headersMatched.length} headers in ${song.title}`)
            headers.concat(headersMatched)
            console.timeEnd('Matched headers in')

            console.time('Predicted collaborators from headers in')
            let { predictions } = nlpArtists(headersMatched.join("\n"))
            predictions.forEach(featured => {
                if (collaborators[featured]) {
                    collaborators[featured] += 1
                } else {
                    collaborators[featured] = 1
                }
            })
            console.log(`${predictions.length} from ${headersMatched.join("\n")}`)
            console.log(`${JSON.stringify(predictions, null, 5)}`)
            console.timeEnd('Predicted collaborators from headers in')


            analysisAggregate.songs++
        } else {
           console.log(`no song on ${key}`) 
        }

        return {
           artistAttributions: attributions,
           ...analysisAggregate
        }
    }, Object.assign({}, analysisSchema))
}


export const sampleIndices = new Set();
while(sampleIndices.size !== 10) {
  sampleIndices.add(Math.floor(Math.random() * 2000) + 1);
}

export const analyzeSample = () => {
    return ({key, value}) => {
        if (sampleIndices.has(key)) return {key, value}
        else return null
    }
}

