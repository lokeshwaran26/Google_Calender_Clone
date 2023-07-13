import locales from "../../locales/en.js";
import { placePopup } from "../../utilities/helpers.js";
class FormConfig {
  constructor () {
    this.monthNames = locales.labels.monthsShort;
    this.headerOffset = document.querySelector(".header");
    this.form = document.querySelector(".entries__form");
    this.formBody = document.querySelector(".entries__form--body");
    this.formTitleDescription = document.querySelectorAll(".form-body-single");
    this.formStartEndCtg = document.querySelectorAll(".form-body-double");
    this.formsubmitbtn = document.querySelector(".form--footer__button-save");
    this.formCategoryWrapper = document.querySelector(".form--body__category-modal--wrapper");
    this.formCategorySelect = document.querySelector(".form--body__category-modal--wrapper-selection");
    this.formCategoryWrapperIcon = document.querySelector(".form--body__category-modal--wrapper__color");
    this.formCategoryTitle = document.querySelector(".form--body__category-modal--wrapper__title");
    this.formCatgoryIcon = document.querySelector(".form--body__category-icon");
  }

  setFormStyle(eX, eY, shouldCenter, centerOffset) {
    if (!shouldCenter) {
      shouldCenter = false;
    }
    if (!centerOffset) {
      centerOffset = null;
    }
    let [x, y] = placePopup(
      this.form.offsetWidth,
      this.form.offsetHeight,
      [eX, eY],
      [window.innerWidth, window.innerHeight],
      shouldCenter,
      centerOffset
    );
    this.form.style.left = `${x}px`;
    this.form.style.top = `${y}px`;
    this.form.style.margin = "0";
  }

  setFormSubmitType(type, id) {
    this.formsubmitbtn.setAttribute("data-form-action", type);
    this.formsubmitbtn.setAttribute(
      "data-form-entry-id",
      id === null ? id = "" : id
    );
  }

  configFormTitleDescriptionInput(title, description) {
    this.formTitleDescription.forEach((input, idx) => {
      input.firstElementChild.value = [title, description][idx];
    });
  }


  setFormDateInput(input, date, minutes, dateFormatted) {
    const [dateinput, timeinput] = [
      input.firstElementChild,
      input.lastElementChild
    ];

    const timeformatted = `${date.getHours()}:${minutes}`;
    timeinput.setAttribute(
      "data-form-time",
      timeformatted
    );

    // darn yankee time
    timeinput.textContent = `${+date.getHours() === 0 || +date.getHours() === 12 ? 12 : date.getHours() % 12}:${minutes}${date.getHours() < 12 ? "am" : "pm"}`;

    dateinput.setAttribute("data-form-date", dateFormatted);
    dateinput.textContent = `${this.monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  setFormDatepickerDate(context, datepickerContext, start) {
    start = new Date(start);
    context.setDateSelected(start.getDate());
    datepickerContext.setDate(
      context.getYear(),
      context.getMonth(),
      context.getDay(),
    );
    datepickerContext.setDateSelected(start.getDate());
  }

  configFormDateInputs(dates) {
    for (let i = 0; i < 2; i++) {
      this.setFormDateInput(
        this.formStartEndCtg[i].lastElementChild,
        dates.dateObj[i],
        dates.minutes[i],
        dates.formatted[i],
      );
    }
  }

  configFormCategoryInput(categoryData) {
  const [title, color] = categoryData;
  this.formCategoryWrapper.setAttribute("data-form-category", title);
  this.formCategorySelect.style.backgroundColor = color;
  this.formCategoryWrapperIcon.style.backgroundColor = color;
  this.formCategoryTitle.textContent = title;

  // Check if formCatgoryIcon has a child node
  if (this.formCatgoryIcon.firstChild instanceof Element) {
    this.formCatgoryIcon.firstChild.setAttribute("fill", color);
  }
}

  getConfig(data) {
    this.setFormSubmitType(
      data.submission.type,
      data.submission.id
    );

    this.configFormCategoryInput([
      data.category.name,
      data.category.color,
    ]);

    this.configFormDateInputs(
      data.dates.object
    );

    if (data.submission.type === "edit") {
      this.configFormTitleDescriptionInput(
        data.submission.title,
        data.submission.description
      );
    }
  }
}

const fullFormConfig = new FormConfig();
export default fullFormConfig;