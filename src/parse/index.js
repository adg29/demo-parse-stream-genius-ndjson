'use strict'

import { fold } from 'stream-json'

const analysisSchema = {
    artists: {},
    artistAttributions: {},
    artistWords: {}
}
export const analyzeSongs = () => {
    return fold((analysisAggregate, {key, value}) => {

        let song = value
        let attributions = analysisAggregate.attributions
        if (song) {
            console.log(`${key} song ${song.title}`) 
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

        return {
           artistAttributions: attributions,
           analysisAggregate
        }
    }, Object.assign({}, analysisSchema))
}