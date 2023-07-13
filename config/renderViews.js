import setViews from "./setViews.js";
import setDatepicker from "../components/menus/datepicker.js";
import setSidebarDatepicker from "../components/menus/sidebarDatepicker.js";
import { getClosest, throttle } from "../utilities/helpers.js";
import setEntryForm from "../components/forms/entryForm.js";
import getSidebarSubMenu from "../components/menus/sidebarSubMenu.js";

const colorSchemeMeta = document.getElementsByName("color-scheme")[0];

const header = document.querySelector(".h__container");
const headerLogo = document.querySelector(".logo");

const toggleForm = document.querySelector(".toggle-form");
const sbToggleForm = document.querySelector(".sb-toggle-form-btn");
const formOverlay = document.querySelector(".form-overlay");
const form = document.querySelector(".entries__form");

const datepicker = document.querySelector(".datepicker");
const datepickeroverlay = document.querySelector(".datepicker-overlay");
const dateTimeWrapper = document.querySelector(".datetime-wrapper");
const dateTimeBtn = document.querySelector(".datetime-content");

const sbDatepicker = document.querySelector(".datepicker-sidebar");
const sbDatepickerBody = document.querySelector(".sbdatepicker__body--dates");
const sbCategoriesWrapper = document.querySelector(".sb__categories--body-form");

const selectElement = document.querySelector(".select__modal");
const selectOverlay = document.querySelector(".change-view--overlay");
const optionswrapper = document.querySelector(".change-view--wrapper");
const options = document.querySelectorAll(".view-option");

const sidebar = document.querySelector(".sidebar");
const sbCategories = document.querySelector(".sb__categories");

const viewsContainer = document.querySelector(".container__calendars");
const monthwrapper = document.querySelector(".monthview");


export default function renderViews(context, datepickerContext, store) {
  
  // function setColorScheme() {
  //   const setlight = () => {
  //     context.setColorScheme("light");
  //     colorSchemeMeta.setAttribute("content", "light");
  //     appBody.classList.add("light-mode");
  //     appBody.classList.remove("contrast-mode");
  //   };

  //   const setdark = () => {
  //     context.setColorScheme("dark");
  //     colorSchemeMeta.setAttribute("content", "dark light");
  //     appBody.classList.remove("light-mode");
  //     appBody.classList.remove("contrast-mode");
  //   };

  //   const setcontrast = () => {
  //     context.setColorScheme("contrast");
  //     colorSchemeMeta.setAttribute("content", "dark");
  //     appBody.classList.remove("light-mode");
  //     appBody.classList.add("contrast-mode");
  //   };

  //   const currentScheme = context.getColorScheme();
  //   if (currentScheme === "light") {
  //     setdark();
  //   } else if (currentScheme === "dark") {
  //     setcontrast();
  //   } else {
  //     setlight();
  //   }
  // }

  function fullRender(component) {
    setViews(component, context, store, datepickerContext);
  }

  function setInitialAttributes() {
    selectElement.setAttribute("data-value", `${context.getComponent().slice(0, 1).toUpperCase()}`);

    headerLogo.setAttribute("data-current-day-of-month", new Date().getDate());
  }

  function renderSidebarDatepicker() {
    if (!sidebar.classList.contains("hide-sidebar")) {
      datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay());
      setSidebarDatepicker(context, store, datepickerContext);
    }
  }


  function getPreviousDay() {
    context.setPrevDay();
    fullRender("day");
    context.setDateSelected(context.getDay());
    renderSidebarDatepicker();
  }

  function getNextDay() {
    context.setNextDay();
    fullRender("day");
    context.setDateSelected(context.getDay());
    renderSidebarDatepicker();
  }

  function getPreviousWeek() {
    context.setPrevWeek();
    fullRender("week");
    renderSidebarDatepicker();
  }

  // function getNextWeek() {
  //   context.setNextWeek();
  //   fullRender("week");
  //   renderSidebarDatepicker();
  // }

  function getPreviousMonth() {
    context.setPrevMonth();
    fullRender("month");
    renderSidebarDatepicker();
  }

  function getNextMonth() {
    context.setNextMonth();
    fullRender("month");
    renderSidebarDatepicker();
  }

  function getPreviousYear() {
    context.setPrevYear();
    fullRender("year");
    renderSidebarDatepicker();
    return;
  }

  // function getNextYear() {
  //   context.setNextYear();
  //   fullRender("year");
  //   renderSidebarDatepicker();
  //   return;
  // }

  let tm = 250; 
  function handleTransition(view, keyframeDirection, callback) {
    if (!store.getAnimationStatus()) {
      callback();
      return;
    } else {
      const removeslide = (dir) => {
        dir === "left" ? view.classList.remove("transition--right") : view.classList.remove("transition--left");
      };


      removeslide(keyframeDirection);
      const slide = `transition--${keyframeDirection}`;
      if (view.classList.contains(slide)) {
        // prevent transition from firing too often
        callback();
        tm += 250;
      } else {
        view.classList.add(slide);
        setTimeout(() => {
          view.classList.remove(slide);
        }, tm);
        callback();
        tm = 250;
      }
    }
  }

  function handleForm() {
    setEntryForm(context, store, datepickerContext);
    form.setAttribute("style", "top:5%;left:5%;right:5%;bottom:5%;margin:auto;");
    form.classList.remove("hide-form");
    formOverlay.classList.remove("hide-form-overlay");
    store.addActiveOverlay("hide-form-overlay");
  }

  function handleToggleSubmenu() {
    getSidebarSubMenu(store, context);
  }

  function handleBtnMainMenu() {
    const currentSidebarState = context.getSidebarState();

    if (currentSidebarState === "hide") {
      toggleForm.onclick = handleForm;
      sbToggleForm.onclick = null;
      // sbToggleSubBtn.onclick = null;
      sbCategories.onmousedown = null;
      sbDatepicker.onclick = null;

      // clear categories/datepicker content when inactive
      setTimeout(() => {
        sbDatepickerBody.innerText = "";
        sbCategoriesWrapper.innerText = "";
      }, 100);

      viewsContainer.classList.remove("container__calendars-sb-active");
      sidebar.classList.add("hide-sidebar");
      toggleForm.classList.remove("hide-toggle--form");
      dateTimeWrapper.classList.remove("datetime-inactive");
      dateTimeBtn.removeAttribute("tabindex");

    } else {
      toggleForm.onclick = null;
      sbToggleForm.onclick = handleForm;
      // sbToggleSubBtn.onclick = handleToggleSubmenu;


      viewsContainer.classList.add("container__calendars-sb-active");
      sidebar.classList.remove("hide-sidebar");
      toggleForm.classList.add("hide-toggle--form");
      dateTimeWrapper.classList.add("datetime-inactive");
      dateTimeBtn.setAttribute("tabindex", "-1");

      const resetdatepicker = store.getResetDatepickerCallback();
      if (resetdatepicker !== null) {
        resetdatepicker();
        store.setResetDatepickerCallback(null);
      }

      datepickerContext.setDate(
        +context.getYear(), +context.getMonth(), +context.getDay()
      );
      datepickerContext.setDateSelected(+context.getDay());

      renderSidebarDatepicker();
    }
  }

  function handleBtnToday() {
    if (!context.isToday() && context.getComponent() !== "list") {
      let tempdate = new Date();
      context.setDate(
        tempdate.getFullYear(),
        tempdate.getMonth(),
        tempdate.getDate(),
      );

      fullRender(context.getComponent());
      renderSidebarDatepicker();
    }
  }

  function handleBtnPrev() {
    switch (context.getComponent()) {
      case "day":
        handleTransition(
          document.querySelector(".dayview--header-day__number"),
          "right",
          getPreviousDay
        );
        break;
      case "month":
        handleTransition(monthwrapper, "right", getPreviousMonth);
        break;
      default:
        break;
    }
  }

  function handleBtnNext() {
    switch (context.getComponent()) {
      case "day":
        handleTransition(
          document.querySelector(".dayview--header-day__number"),
          "left",
          getNextDay
        );
        break;
      case "month":
        handleTransition(monthwrapper, "left", getNextMonth);
        break;
      default:
        break;
    }
  }

  function handleDatePickerBtn(e) {
    datepicker.classList.remove("hide-datepicker");
    datepickeroverlay.classList.remove("hide-datepicker-overlay");
    datepickerContext.setDate(context.getYear(), context.getMonth(), context.getDay());
    const rect = e.target.getBoundingClientRect();
    const newDatepickerLeft = parseInt(rect.left);
    // convert rect left into a percentage so that it scales with window resize
    const perc = parseInt((newDatepickerLeft / window.innerWidth) * 100);
    datepicker.setAttribute("style", `left:${perc}%;top:12px;`);
    setDatepicker(context, store, datepickerContext, "header");

  }

  function setOptionStyle(option) {
    const views = ['day', 'month'];
    const activeIndex = views.indexOf(option);
    for (let i = 0; i < options.length; i++) {
      if (i === activeIndex) {
        options[i].classList.add("change-view--option__active");
      } else {
        options[i].classList.remove("change-view--option__active");
      }
    }
  }

  function closeOptionsModal() {
    selectElement.classList.remove("selection--active");
    selectOverlay.style.display = "none";
    selectOverlay.classList.add("toggle-options");
    optionswrapper.classList.add("toggle-options");
    optionswrapper.classList.remove("toggle-animate");
  }

  function renderOption(option, initialRender) {
    const comp = context.getComponent();
    // console.log(comp, option)

    if (option === comp && !initialRender) return;
    closeOptionsModal();
    context.setComponent(option);
    fullRender(option);
    setOptionStyle(option);
    if (comp ) {
      renderSidebarDatepicker();
    }
    document.activeElement.blur();
  }

  function handleSelect(e) {
    selectElement.classList.add("selection--active");
    selectOverlay.classList.remove("toggle-options");
    selectOverlay.style.display = "block";
    optionswrapper.classList.remove("toggle-options");
    optionswrapper.classList.add("toggle-animate");
    const setOption = (e) => {
      const option = e.target.getAttribute("data-view-option");
      renderOption(option);
    };
    optionswrapper.onclick = setOption;
    selectOverlay.onclick = closeOptionsModal;
  }

  // EVENT DELEGATION : HEADER ELEMENTS
  function delegateHeaderEvents(e) {
    e.preventDefault();
    const btnMainMenu = getClosest(e, ".menu");
    const btnToday = getClosest(e, ".btn-today");
    const btnPrev = getClosest(e, ".prev");
    const btnNext = getClosest(e, ".next");
    const dateTime = getClosest(e, ".datetime-content");
    // const search = getClosest(e, ".h-search");
    const settings = getClosest(e, ".settings");
    const select = getClosest(e, ".select__modal");

    if (btnMainMenu) {
      context.toggleSidebarState();
      handleBtnMainMenu();
      return;
    }

    if (btnToday) {
      handleBtnToday();
      return;
    }

    if (btnPrev) {
      handleBtnPrev();
      return;
    }

    if (btnNext) {
      handleBtnNext();
      return;
    }

    if (dateTime) {
      handleDatePickerBtn(e);
      return;
    }

    // if (search) {
    //   createGoTo(context, store, datepickerContext);
    //   return;
    // }

    if (settings) {
      handleToggleSubmenu(e);
      return;
    }

    if (select) {
      handleSelect(e);
      return;
    }
  }

  const handleHeaderDelegation = throttle(delegateHeaderEvents, 150);


  const appinit = () => {

    renderOption(context.getComponent(), true);
    setInitialAttributes();
    handleBtnMainMenu();


    store.setRenderFormCallback(handleForm);
    const ensureSidebarIsOpen = () => {
      context.setSidebarState("open");
      handleBtnMainMenu();
    };
    store.setRenderSidebarCallback(ensureSidebarIsOpen);

    header.onclick = throttle(handleHeaderDelegation, 150);

  };
  appinit();
}