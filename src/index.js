'use strict'


import { processJSON } from './stream'
import { analyzeSongs, analyzeSample } from './analyze'
import path from 'path'

const run = async () => {

    const TIME_LABEL = 'Finished in' 
    console.time(TIME_LABEL)

    let filename = '../data/songs.json'
    let filepath = path.join(__dirname, filename)

    const artists = []
    const lyric_sections = []
    const lyric_words = []

    let msg = `Processing json ${filename}...`
    console.log(msg)

    let { jsonAnalysis } = await processJSON(filepath, { analyzeSongs, analyzeSample })

    renderArtistAnalysis(jsonAnalysis.artistAttributions)
    renderCollaboratorsAnalysis(jsonAnalysis.collaborators)
    renderHeaders(jsonAnalysis.headers)

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

const renderArtistAnalysis = (attributions) => {

    let msg = `Artist attribution counts: ${JSON.stringify(attributions, null, 5)}`

    let artistAttributionsRanked = attributionsRanked(attributions)

    msg = `Ranked artist by attributions count: ${JSON.stringify(artistAttributionsRanked.slice(0, 5), null, 5)}`
    console.log(msg)
}

try {
    run()
} catch(err) {
    console.error(err);
}
