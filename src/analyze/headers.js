'use strict'

export const nlpArtists = (header, nlp) => {
    header = header.replace(/[&+]/g,',')
    let doc = nlp(header).normalize()
    let persons = doc.clauses().match('!(verse|hook|chorus|intro|bridge|outro|+|and|&) (#Person|lil #Person+|. #Person+)+')
    return {
      header: header,
      predictions: [...new Set(doc.people().concat(persons).out('array'))]
    }
}