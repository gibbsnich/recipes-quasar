import cheerio from 'cheerio';
//import { ipcRenderer } from '@/electron';

function rmWhitespace(str) {
    return str.replace(/ +(?= )/g,'').trim();
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

class ChefkochFetcher {
    canFetch(url) {
        return url.indexOf('www.chefkoch.de') > -1;
    }

    async fetch($) {
        const name = $('h1').text();
        const servingsField = $('input.ds-input');
        const serving = {
            type: capitalize(servingsField.attr('name')),
            value: servingsField.attr('value'),
        };
        const ingredients = [];
        $('table.ingredients tr').each((idx, ing) => {
            const cells = $(ing).children('td');
            const amount = rmWhitespace($(cells[0]).text());
            const i = rmWhitespace($(cells[1]).text());
            ingredients.push({amount: amount, ingredient: i});
        });
        const articles = $('article');
        const prepArticle = articles.filter((idx, a) => a.attribs['class'].indexOf('recipe') === -1);
        let preparation = '';
        if (prepArticle.length === 0) {
            console.warn('Cannot extract preparation instructions.')
        } else {
            const meta = $(prepArticle[0]).children('small.ds-recipe-meta');
            preparation = rmWhitespace(meta.next().text());
        }
        return {name, serving, ingredients, preparation, recipeCategories: []};
    }
}

class SchrotUndKornFetcher {
    canFetch(url) {
        return url.indexOf('schrotundkorn.de') > -1;
    }

    fetch($) {
        const name = $('h1').text();
        const serving = {
            type: $('dt.servings__term').text(),
            value: $('span.servings__value').text(),
        }
        const ingredients = [];
        $('li.ingredients__item').each((idx, ing) => {
            const i = $(ing).children('a').text();
            const a = ['span.ingredients__item-quantity', 'span.ingredients__item-quantity-whole', 'span.ingredients__item-unit']
                .map((s) => $(ing).children(s).text()).filter((s) => s.length > 0).reduce((s,t) => s + ' ' + t, '');
            ingredients.push({amount: a, ingredient: i});
        });
        let preparation = '';
        $('ol.instructions__list p.instructions__step-instruction').each((idx, s) => {
            preparation += s.children.filter((c) => c.type === 'text').map((c) => rmWhitespace(c.data)).reduce((s,t) => s+t, '');
            preparation += '\n\n';
        });
        preparation = preparation.substring(0,preparation.length-2);
        return {name, serving, ingredients, preparation, recipeCategories: []};
    }
}

const fetchers = [new ChefkochFetcher(), new SchrotUndKornFetcher()];

export const fetchRecipe = async (url) => {
    const fetcher = fetchers.find(f => f.canFetch(url));
    if (!fetcher) {
        return null;
    }
    //const body = await ipcRenderer.invoke('request', url);
    const body = await window.recipeApi.request(url);
    const $ = cheerio.load(body);
    const recipe = await fetcher.fetch($);
    recipe.url = url;
    return recipe;
};
