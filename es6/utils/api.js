const ensureSuccess = async (response) => {
    if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}${message ? `: ${message}` : ''}`);
    }
    return response;
};

export async function getWeather(baseUrl, location, units, fetchImpl = fetch) {
    const query = new URLSearchParams({location, units});
    const response = await ensureSuccess(
        await fetchImpl(`${baseUrl}/weather?${query}`)
    );
    return response.json();
}

export async function getThemes(baseUrl, fetchImpl = fetch) {
    const themes = [];
    const seenTokens = new Set();
    let continuationToken;
    do {
        const query = new URLSearchParams({pageSize: '100'});
        if (continuationToken) {
            query.set('continuationToken', continuationToken);
        }
        const response = await ensureSuccess(
            await fetchImpl(`${baseUrl}/themes?${query}`)
        );
        const page = await response.json();
        if (!Array.isArray(page)) {
            throw new TypeError('Themes API returned an invalid response');
        }
        themes.push(...page);
        continuationToken = response.headers.get('X-Continuation-Token');
        if (continuationToken && seenTokens.has(continuationToken)) {
            throw new Error('Themes API repeated a continuation token');
        }
        seenTokens.add(continuationToken);
    } while (continuationToken);
    return themes;
}

export async function shareTheme(baseUrl, theme, fetchImpl = fetch) {
    await ensureSuccess(await fetchImpl(`${baseUrl}/newtheme`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(theme),
    }));
}
