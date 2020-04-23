// Global app controller
import Search from './models/Search';
import Recipe from './models/recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import {elements, renderLoader, clearLoader} from './views/base';
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};


/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1. Get the query from the view
    const query = searchView.getInput();

    if(query) {
        //2. New search object and add to state
        state.search = new Search(query);

        //3. prepare UI for results
        searchView.clearInput();//clear the input field
        searchView.clearResults();//clear the results
        renderLoader(elements.searchRes);

        try {
            //4. Search for recipes
            await state.search.getResults();
    
            //5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);            
        } catch(error) {
            alert('something went wrong with the search!');
            clearLoader();
        }
    }


};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); // To prevent the page from reloading each time the form is submitted
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);// reads the data-goto attribute added to the html
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async() => {
    // get the id from the url
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if(id) {
        // prepare the UI for changes
        renderLoader(elements.recipe);

        // Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // create a new recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            // render the recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch(error) {
            alert('Error processing recipe');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    console.log(state.recipe);
});