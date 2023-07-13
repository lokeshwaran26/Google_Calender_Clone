import locales from "../../locales/en.js";

export default function setHeader(context, component, store) {
  let temp = new Date();
  const btntoday = document.querySelector(".btn-today");
  btntoday.setAttribute("data-tooltip", `${locales.labels.weekdaysLong[temp.getDay()]}, ${locales.labels.monthsLong[temp.getMonth()]} ${temp.getDate()}`);

  const dateTimeTitle = document.querySelector(".datetime-content--title");
  const header = document.querySelector(".header");
  const selectElement = document.querySelector(".select__modal");
  const btnprev = document.querySelector('.prev');
  const btnnext = document.querySelector('.next');
  const datetimeWrapper = document.querySelector(".h-col-2");
  const datetimeContent = document.querySelector(".datetime-content");
  const prevnext = document.querySelector(".prev-next");

  const configHeader = (borderstyle, componentTitle) => {
    header.style.borderBottom = borderstyle;
    dateTimeTitle.textContent = componentTitle;
    datetimeWrapper.classList.remove("datetime-inactive");
    datetimeWrapper.style.paddingRight = "0";
    datetimeContent.removeAttribute("style");
    prevnext.removeAttribute("style");
  };

  const setHeaderAttributes = (view) => {
    if (view !== "list") {
      btnprev.setAttribute("data-tooltip", `prev ${view}`);
      btnnext.setAttribute("data-tooltip", `next ${view}`);
    }
    selectElement.textContent = view[0].toUpperCase() + view.slice(1);
    selectElement.setAttribute("data-value", view.slice(0, 1).toUpperCase());
  };

  switch (component) {
    case "day":
      configHeader("1px solid transparent", `${context.getMonthName()} ${context.getDay()}, ${context.getYear()}`);
      setHeaderAttributes("day");
      break;
    case "month":
      configHeader("1px solid transparent", `${context.getMonthName()} ${context.getYear()}`);
      setHeaderAttributes("month");
      break;
    default:
      break;
  }
}
