'use strict'

import { scenarios as SONGS } from './data/songs-3-truncated-lyrics_text'
import { countSections, attributeSections } from '../src/parse/sections'

describe('Section Parser', () => {
    it('countSections returns 3 sections given a lyrics_text value with 3 separated blocks', () => {
        let count = countSections(SONGS.SECTIONS.THREE[0].lyrics_text)
        expect(count).toEqual(3)
    })
    it('countSections returns 4 sections given a lyrics_text value with 4 separated blocks', () => {
        let count = countSections(SONGS.SECTIONS.FOUR[0].lyrics_text)
        expect(count).toEqual(4)
    })
    it('countSections returns primary_artist given valid JSON song data', () => {
        let attribution = attributeSections(SONGS.SECTIONS.FOUR[0])
        expect(attribution).toEqual(SONGS.SECTIONS.FOUR[0].primary_artist)
    })
    it('countSections returns null object given invalid JSON song data', () => {
        let attribution = attributeSections(SONGS.ARTISTS.INVALID)
        expect(attribution).toBeNull()
    })
    xit('matchSections finds section with no section header at all')
    xit('attributeSectionWords increments word count by 1 for #Artist that uses #Word across different sections')
})