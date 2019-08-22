'use strict'

import fold from 'stream-chain/utils/fold'
import { attributeSections, matchSections, countSections } from '../parse/sections'
import { matchHeaders } from '../parse/headers'
import { nlpArtists } from './headers'

const analysisSchema = {
    songs: 0,
    artists: {},
    artistAttributions: {},
    artistWords: {},
    collaborators: {},
    headers: {}
}

export const analyzeSongs = () => {
    return fold((analysisAggregate, {key, value}) => {
        let song = value
        // console.time(`Analyzed ${key} song ${song.title} in`) 

        let attributions = analysisAggregate.artistAttributions
        let collaborators = analysisAggregate.collaborators
        let headers = analysisAggregate.headers

        let headersMatched = null
        if (song) {

            let sections = matchSections(song.lyrics_text)
            let artist = attributeSections(song)

            console.log('matchSections')
            console.log(sections)

            if (attributions[artist]) {
                attributions[artist] += sections.length
            } else {
                attributions[artist] = sections.length
            }

            //attribute collaborators per section
            sections.forEach((section, i) => {
                console.time(`Matched headers in section ${i}`)
                console.log(section)
                headersMatched = matchHeaders(section)
                console.log(`${headersMatched.length} headers in ${song.title}`)

                //global headers store, sans nlp
                headersMatched.forEach(header => {
                    if (headers[header]) {
                        headers[header] += 1
                    } else {
                        headers[header] = 1
                    }
                })
                console.timeEnd(`Matched headers in section ${i}`)

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

            })

            analysisAggregate.songs++
        } else {
           console.log(`no song on ${key}`) 
        }

        return {
           'artistAttributions': attributions,
           'headers': headers,
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

