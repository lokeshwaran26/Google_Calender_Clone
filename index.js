import context, { datepickerContext } from "./context/appContext.js";
import store from "./context/store.js";
import setAppDefaults from "./config/appDefaults.js";
import renderViews from "./config/renderViews.js";

setAppDefaults(context, store);
renderViews(context, datepickerContext, store);