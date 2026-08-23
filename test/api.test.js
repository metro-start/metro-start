import {describe, expect, test} from 'bun:test';
import {getThemes, getWeather, shareTheme} from '../es6/utils/api';

const jsonResponse = (body, options = {}) => new Response(JSON.stringify(body), {
    status: options.status || 200,
    headers: {'Content-Type': 'application/json', ...options.headers},
});

describe('Metro Start web API client', () => {
    test('encodes weather queries and accepts the API response contract', async () => {
        let requestedUrl;
        const weather = await getWeather(
            'https://api.metro-start.com/api',
            'Vancouver & Coast',
            'metric',
            async (url) => {
                requestedUrl = url;
                return jsonResponse({name: 'Vancouver', country: 'CA', temp: 10,
                    tempMax: 12, tempMin: 8, description: 'cloudy'});
            }
        );

        expect(requestedUrl).toContain('location=Vancouver+%26+Coast');
        expect(requestedUrl).toContain('units=metric');
        expect(weather.tempMax).toBe(12);
    });

    test('loads every themes page using the continuation header', async () => {
        const urls = [];
        const responses = [
            jsonResponse([{id: 'one', title: 'One'}], {
                headers: {'X-Continuation-Token': 'next token'},
            }),
            jsonResponse([{id: 'two', title: 'Two'}]),
        ];

        const themes = await getThemes('https://api.example/api', async (url) => {
            urls.push(url);
            return responses.shift();
        });

        expect(themes.map(({id}) => id)).toEqual(['one', 'two']);
        expect(urls[1]).toContain('continuationToken=next+token');
    });

    test('accepts legacy unpaginated themes without generated IDs', async () => {
        let requests = 0;
        const themes = await getThemes('https://legacy.example/api', async () => {
            requests++;
            return jsonResponse([{
                author: 'Metro',
                title: 'Classic',
                online: true,
                themeContent: {background_color: '#000000'},
            }]);
        });

        expect(requests).toBe(1);
        expect(themes[0].id).toBeUndefined();
        expect(themes[0].themeContent.background_color).toBe('#000000');
    });

    test('rejects malformed themes responses', async () => {
        await expect(getThemes('https://api.example/api', async () =>
            jsonResponse({items: []})
        )).rejects.toThrow('invalid response');
    });

    test('stops if the themes API repeats a continuation token', async () => {
        await expect(getThemes('https://api.example/api', async () =>
            jsonResponse([], {headers: {'X-Continuation-Token': 'same'}})
        )).rejects.toThrow('repeated a continuation token');
    });

    test('posts the theme contract as JSON', async () => {
        let request;
        const theme = {title: 'Night', author: 'Metro', themeContent: {}};
        await shareTheme('https://api.example/api', theme, async (url, init) => {
            request = {url, init};
            return new Response(null, {status: 200});
        });

        expect(request.url).toEndWith('/newtheme');
        expect(request.init.method).toBe('POST');
        expect(JSON.parse(request.init.body)).toEqual(theme);
    });

    test('surfaces API failures with status and response text', async () => {
        await expect(getWeather('https://api.example/api', 'x', 'metric',
            async () => new Response('unavailable', {status: 502})
        )).rejects.toThrow('HTTP 502: unavailable');
    });
});
