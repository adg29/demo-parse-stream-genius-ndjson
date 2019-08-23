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
    artistAttributions: {},
    artistTerms: {},
    collaborators: {},
    headers: {},
}

export const analyzeSongs = () => {
    return fold((analysisAggregate, {key, value}) => {
        let song = value
        console.time(`Analyzed ${song.primary_artist} in\n`) 

        let attributions = analysisAggregate.artistAttributions
        let collaborators = analysisAggregate.collaborators
        let headers = analysisAggregate.headers
        let artistTerms = analysisAggregate.artistTerms
        let terms = analysisAggregate.terms

        // console.log(`loop termsWithArrayFromSet ${key}`)
        // console.log(artistTerms)

        let headersMatched = null
        if (song) {

            let sections = matchSections(song.lyrics_text)
            let artist = attributeSections(song)

            if (attributions[artist]) {
                attributions[artist] += sections.length
            } else {
                attributions[artist] = sections.length
            }

            sections.forEach((section, i) => {
                // console.time(`Tokenized section ${i} in`)
                let sectionTerms = nlp(section).terms().out('array')
                // console.log(`sectionTerms`)
                // console.log(JSON.stringify(sectionTerms, null, 5))
                // console.timeEnd(`Tokenized section ${i} in`)

                // console.time(`Matched headers in section ${i}`)
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
                // console.timeEnd(`Matched headers in section ${i}`)

                // console.time('Collaborators recognized from headers in')
                let { persons } = nlpArtists(headersMatched.join("\n"), nlp)
                persons.forEach(featured => {
                    //increment collaborators entry for person, attributing them this section
                    if (collaborators[featured]) {
                        collaborators[featured] += 1
                    } else {
                        collaborators[featured] = 1
                    }
                    //merge artistTerms set with sectionTerms, attributing them all the terms in this section but only once over the entire dataset
                    if (artistTerms[featured]) {
                        // console.log(`existing terms for ${featured}`)
                        // console.log(artistTerms[featured].size)
                        artistTerms[featured] = new Set([...artistTerms[featured], ...sectionTerms])
                        // console.log(`merged terms for ${featured} section ${i}`)
                        // console.log(sectionTerms.length)
                    } else {
                        // console.log(`init terms for ${featured}`)
                        artistTerms[featured] = new Set([...sectionTerms])
                        // console.log(artistTerms[featured].size)
                    }
                    // console.log(`reconciled terms for ${featured}`)
                    // console.log(artistTerms[featured].size)
                })
                // console.log(`${persons.length} from ${headersMatched.join("\n")}`)
                // console.log(`${JSON.stringify(persons, null, 5)}`)
                // console.timeEnd('Collaborators recognized from headers in')

            })

            analysisAggregate.songs++
        } else {
           console.log(`no song on ${key}`) 
        }

        let termsWithArrayFromSet = Object.entries(artistTerms).reduce((tSetFlattened, t) => {
            tSetFlattened[t[0]] = Array.from(t[1])
            return tSetFlattened
        }, {})
        // console.log(`flattened terms`)
        // console.log(termsWithArrayFromSet)
        console.timeEnd(`Analyzed ${song.primary_artist} in\n`)
        return {
            'songs': analysisAggregate.songs++,
            'artistAttributions': attributions,
            'collaborators': collaborators,
            'artistTerms': {...termsWithArrayFromSet},
            'headers': headers
        }
    }, Object.assign({}, analysisSchema))
}