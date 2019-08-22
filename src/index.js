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

    let attributions = jsonAnalysis.artistAttributions

    msg = `Artist attribution counts: ${JSON.stringify(attributions, null, 5)}`

    let attributionsRanked = Object.keys(attributions)
        .sort((a, b) => attributions[b] - attributions[a])
        .map(a => ({artist: a, attributions: attributions[a]}))

    msg = `Ranked artist by attributions count: ${JSON.stringify(attributionsRanked.slice(0, 5), null, 5)}`
    console.log(msg)

    renderCollaboratorsAnalysis()

    msg = `Processed ${jsonAnalysis.songs} objects via ${filename} stream`
    console.log(msg)

    console.timeEnd(TIME_LABEL)
}

try {
    run()
} catch(err) {
    console.error(err);
}
