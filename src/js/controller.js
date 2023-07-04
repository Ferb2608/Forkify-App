import { async } from 'regenerator-runtime';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultsView.js';
import bookMarksView from './views/bookMarkView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import paginationView from './views/paginationView.js';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
if (module.hot) {
  module.hot.accept();
}
//1) Loading recipe from API
const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    //Update result view to mark selected result
    resultView.update(model.getSearchResultPage());
    bookMarksView.update(model.state.bookmarks);
    //Loading recipe
    await model.loadRecipe(id);
    //Render recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    resultView.render(model.getSearchResultPage());

    //Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPaginition = function (goToPage) {
  resultView.render(model.getSearchResultPage(goToPage));

  //Render initial pagination buttons
  // paginationView.render(model.state.search);
  paginationView.render(model.state.search);
};
const controlServings = function (newServings) {
  //Update the recipe view
  recipeView.update(model.state.recipe);
  //Update the recipe servings (in state)
  model.updateServings(newServings);
};
const controlAddBookmark = function () {
  //1 Add/remove bookmark
  if (!model.state.recipe.booked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2. Update recipe view
  recipeView.update(model.state.recipe);

  //3. Render bookmark
  bookMarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookMarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    //Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    //Render bookmark view
    bookMarksView.render(model.state.bookmarks);

    //Change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //Close form window
    setTimeout(function () {
      addRecipeView.toogleWindow();
    }, 2 * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookMarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPaginition);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
