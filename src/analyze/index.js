'use strict'

const nlp = require('compromise')
const LEXICON = {ARTISTS: require('../../data/lexicon-artists') }
nlp.plugin(LEXICON.ARTISTS)

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

            if (attributions[artist]) {
                attributions[artist] += sections.length
            } else {
                attributions[artist] = sections.length
            }

            //attribute collaborators per section
            sections.forEach((section, i) => {
                console.time(`Tokenized section ${i} in`)
                let terms = nlp(section).terms().out('freq')
                console.log(JSON.stringify(terms, null, 5))
                console.timeEnd(`Tokenized section ${i} in`)

                console.time(`Matched headers in section ${i}`)
                headersMatched = matchHeaders(section)
                // console.log(`${headersMatched.length} headers in ${song.title}`)

                //global headers store
                headersMatched.forEach(header => {
                    if (headers[header]) {
                        headers[header] += 1
                    } else {
                        headers[header] = 1
                    }
                })
                console.timeEnd(`Matched headers in section ${i}`)

                console.time('Collaborators recognized from headers in')
                let { persons } = nlpArtists(headersMatched.join("\n"), nlp)
                persons.forEach(featured => {
                    if (persons[featured]) {
                        collaborators[featured] += 1
                    } else {
                        collaborators[featured] = 1
                    }
                })
                // console.log(`${persons.length} from ${headersMatched.join("\n")}`)
                // console.log(`${JSON.stringify(persons, null, 5)}`)
                console.timeEnd('Collaborators recognied from headers in')

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



export const analyzeSample = ({RANDOM = false, SAMPLE_SIZE = 10, STREAM_SIZE = 2000} = {}) => {
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

