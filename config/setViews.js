import setHeader from "../components/menus/header.js";
import setMonthView from "../components/views/monthview.js";
import setDayView from "../components/views/dayview.js";
const monthComponent = document.querySelector(".monthview");
const dayComponent = document.querySelector(".dayview");;

let [prev1, prev2] = [null, null];
export default function setViews(component, context, store, datepickerContext) {
  prev1 = prev2;
  prev2 = component;

  function hideViews() {
    const views = [
      monthComponent,
      dayComponent,
    ];

    // reset previous view after switching to a new view
    const resetPrevView = store.getResetPreviousViewCallback();
    if (prev1 !== null && resetPrevView !== null && prev1 !== prev2) {
      resetPrevView();
    }

    views.forEach((view) => {
      view.classList.add("hide-view");
      // if (view !== monthComponent) {
      //   window.onresize = null;
      // }
    });
  }
  // window.removeEventListener("resize", store.getResizeHandle("month"));

  function initView(component) {
    switch (component) {
      case "day":
        context.setComponent(component);
        setHeader(context, component);
        setDayView(context, store, datepickerContext);
        dayComponent.classList.remove("hide-view");
        break;
      case "month":
        context.setComponent(component);
        setHeader(context, component);
        setMonthView(context, store, datepickerContext);
        monthComponent.classList.remove("hide-view");
        // window.onresize = store.getResizeHandle("month");
        // window.addEventListener("resize", store.getResizeHandle("month"));
        break;
      default:
        context.setComponent("month");
        setHeader(context, "month");
        setMonthView(context, store, datepickerContext);
        monthComponent.classList.remove("hide-view");
        break;
    }
  }

  hideViews();
  document.title = context.getMonthName();
  initView(component);
}