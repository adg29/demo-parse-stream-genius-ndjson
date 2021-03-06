'use strict'

import { processJSON } from './stream'
import { analyzeSongs } from './analyze'
import path from 'path'

const filename = '../data/songs.json'

const run = async (config) => {

    const TIME_LABEL = 'Finished in' 
    console.time(TIME_LABEL)

    let filepath = path.join(__dirname, filename)

    const artists = []
    const lyric_sections = []
    const lyric_words = []

    let msg = `Processing json ${filename}...`
    console.log(msg)

    let { jsonAnalysis } = await processJSON(filepath, { analyzeSongs, config })

    renderArtistAnalysis(jsonAnalysis)
    renderCollaboratorsAnalysis(jsonAnalysis.collaborators)
    // renderHeaders(jsonAnalysis.headers)

    msg = `Processed ${jsonAnalysis.songs} objects via ${filename} stream`
    console.log(msg)

    console.timeEnd(TIME_LABEL)
}

const attributionsRanked = (attributions) => {
    return Object.keys(attributions)
        .sort((a, b) => attributions[b] - attributions[a])
        .map(a => ({artist: a, attributions: attributions[a]}))
}

const renderHeaders = (headers) => {
    let msg = `${JSON.stringify(headers, null, 5)}`
    console.log(headers)
}

const renderCollaboratorsAnalysis = (collaborators) => {

    let msg = `Collaborator attribution counts: ${JSON.stringify(collaborators, null, 5)}`
    console.log(msg)

    let collaboratorsAttributionsRanked = attributionsRanked(collaborators)

    msg = `Ranked collaborators by attributions count: ${JSON.stringify(collaboratorsAttributionsRanked.slice(0, 5), null, 5)}`
    console.log(msg)

}

const renderArtistAnalysis = ({artistAttributions: attributions, artistTerms: terms}) => {

    let msg = `Artist attribution counts: ${JSON.stringify(attributions, null, 5)}`

    let artistAttributionsRanked = attributionsRanked(attributions)

    msg = `Ranked artist by attributions count: ${JSON.stringify(artistAttributionsRanked.slice(0, 5), null, 5)}`
    console.log(msg)

    msg = `Terms by artist count: ${JSON.stringify(terms, null, 5)}`
    // console.log(msg)

    const setsRanked = (sets) => {
        return Object.keys(sets)
            .sort((a, b) => sets[b].length - sets[a].length)
            .map(a => ({artist: a, 'count': sets[a].length}))
    }
    msg = `Ranked artists by terms count: ${JSON.stringify(setsRanked(terms).slice(0,5), null, 5)}`
    console.log(msg)
}

const commander = require('commander');
const program = new commander.Command();
program.version('1.0,0');

program
    .option('-r, --random', 'randomly pick stream objects')
    .option('-s, --sample-size <number>', 'sample subset of stream objects', (v, p) => parseInt(v) ,10)


try {
    program.parse(process.argv);

    let { random , sampleSize } = program
    const config = {
        random,
        sampleSize
    }
    run(config)
} catch(err) {
    console.error(err);
}
