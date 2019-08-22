'use strict'

const nlp = require('compromise')


export const nlpArtists = (header) => {
    let doc = nlp(header)
    // let capitals= doc.clauses().match('#TitleCase+ !(&+)')
    let persons = doc.clauses().match('!(verse|hook|chorus|intro|bridge|outro|+|and|&) (#Person|lil #Person+|. #Person+)+')
    return {
      header: header,
      predictions: [...new Set(doc.people().concat(persons).out('array'))]
    }
}