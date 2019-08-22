'use strict'

const nlp = require('compromise')
const LEXICON = {
    ARTISTS: require('../../data/lexicon-artists')
}

export const nlpArtists = (header) => {
    header = header.replace(/[&+]/g,',')
    let doc = nlp(header, LEXICON.ARTISTS).normalize()
    let persons = doc.clauses().match('!(verse|hook|chorus|intro|bridge|outro|+|and|&) (#Person|lil #Person+|. #Person+)+')
    return {
      header: header,
      predictions: [...new Set(doc.people().concat(persons).out('array'))]
    }
}