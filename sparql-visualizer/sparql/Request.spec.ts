import { buildRequestURL, requestSPARQLSelectResponse, sparqlResponseToDataTable } from './Request';

import sinon from 'sinon';
import { SPARQLSelectResponse } from './index.types';

type SinonStub = import('sinon').SinonStub;

const WIKIDATA_URL: string = 'wikidata.org';
const JSON_FETCH_HEADERS: RequestInit = {
    headers: {
        Accept: 'application/sparql-results+json'
    }
};
const JSON_RESPONSE: SPARQLSelectResponse = {
    head: {
        vars: ['a', 'b'],
        link: ['c', 'd']
    },
    results: {
        bindings: [
            {
                Moep: {
                    type: 'uri',
                    value: 'f'
                },
                Blubb: {
                    type: 'literal',
                    value: 'h'
                },
                kljlk: {
                    type: 'literal',
                    value: 'v'
                }
            },

            {
                Moep: {
                    type: 'uri',
                    value: 'm'
                },
                Blubb: {
                    type: 'literal',
                    value: 'n'
                },
                kljlk: {
                    type: 'literal',
                    value: 'k'
                }
            }
        ]
    }
};
const SPARQL_QUERY: string = '# sparql query';

describe('SPARQL Request', () => {
    let fetchStub: SinonStub;

    beforeEach(() => {
        fetchStub = sinon.stub();

        window.fetch = fetchStub;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should compose the endpint and SPARQL query in the right URL', () => {
        expect(buildRequestURL(WIKIDATA_URL, SPARQL_QUERY)).toEqual(
            'wikidata.org?query=%23%20sparql%20query'
        );
    });

    it('should include a JSON content header', async () => {
        fetchStub.resolves(createStubResponse());

        await requestSPARQLSelectResponse(WIKIDATA_URL);

        expect(fetchStub.firstCall.args).toEqual([WIKIDATA_URL, JSON_FETCH_HEADERS]);
    });

    it('should throw an error if request fails', async () => {
        fetchStub.rejects();

        expect(requestSPARQLSelectResponse(WIKIDATA_URL)).rejects;
    });

    it('should return a valid json response', async () => {
        fetchStub.resolves(createStubResponse(JSON_RESPONSE));

        const response: object = await requestSPARQLSelectResponse(WIKIDATA_URL);

        expect(response).toEqual(JSON_RESPONSE);
    });

    it('should format the SelectResponse into a Value array', () => {
        expect(sparqlResponseToDataTable(JSON_RESPONSE)).toEqual([
            { Moep: 'f', Blubb: 'h', kljlk: 'v' },
            { Moep: 'm', Blubb: 'n', kljlk: 'k' }
        ]);
    });

    function createStubResponse(returnValue: object = {}): Response {
        return {
            json: sinon.stub().resolves(returnValue)
        } as any;
    }
});
