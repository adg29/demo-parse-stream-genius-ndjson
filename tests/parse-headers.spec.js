'use strict'

import { scenarios as HEADERS } from './data/headers'
import { matchHeaders } from '../src/parse/headers'


describe('Headers Parser', () => {
    describe('matchHeaders', () => {
        it('3 header sections counted for a text with 3 joined headers', () => {
            let headers = matchHeaders(HEADERS.MULTI[0])
            expect(headers.length).toEqual(3)
        })
        it('4 header sections for a text with 4 joined headers', () => {
            let headers = matchHeaders(HEADERS.MULTI[1])
            expect(headers.length).toEqual(4)
        })
        it('square brackets are trimmed from a text with one artists of format [#Person]', () => {
            let headers = matchHeaders('[DRAKE]')
            expect(headers[0]).toEqual('DRAKE')
        })
        it('all square brackets occurences are trimmed from a text with multiple artists of format [#Person+]', () => {
            let headers = matchHeaders(HEADERS.MULTI[0])
            expect(headers[0].indexOf('[')).toEqual(-1)
            expect(headers[0].indexOf(']')).toEqual(-1)
        })
    })
})