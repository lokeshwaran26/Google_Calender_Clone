import { getClosest, setTheme } from "../../utilities/helpers.js";
import { createTimestamp } from "../../utilities/dateutils.js";
// import handleShortCutsModal from "./shortcutsModal.js";

const sidebarSubMenuOverlay = document.querySelector('.sidebar-sub-menu__overlay');
const sidebarSubMenu = document.querySelector('.sidebar-sub-menu');
const closeSubMenuBtn = document.querySelector('.close-sub-menu');
const closemenu = "hide-sidebar-sub-menu";
const appBody = document.querySelector(".body");

// dark, light, contrast
const themeRadioBtns = document.querySelectorAll(".theme-radio__input");
const themeRadioOptions = ["dark", "light", "contrast"];

// // keyboard shortcut toggle on/off | open modal
// const shortcutSwitch = document.querySelector(".smia-toggle-shortcuts-checkbox");
// const animationsSwitchBtn = document.querySelector(".smdt-toggle-checkbox");
// const notifyDisabledShortcutsIcon = document.querySelector(".keyboard-disabled-sm");

export default function getSidebarSubMenu(store, context) {

  function closeSubOnEscape(e) {
        closeSubMenu();
        sidebarSubMenuOverlay.classList.remove("sub-overlay-vis");

  }


  function closeSubMenu() {
    const popup = document.querySelector(".sb-sub-popup-confirm");
    if (popup) {
      popup.remove();
      sidebarSubMenuOverlay.classList.remove("sub-overlay-vis");
      return;
    } else {
      store.removeActiveOverlay(closemenu);
      sidebarSubMenu.classList.add(closemenu);
      sidebarSubMenuOverlay.classList.add(closemenu);
      document.removeEventListener("keydown", closeSubOnEscape);
      sidebarSubMenuOverlay.onclick = null;
    }
  }



  function openSubMenu() {



    store.addActiveOverlay(closemenu);
    sidebarSubMenu.classList.remove(closemenu);
    sidebarSubMenuOverlay.classList.remove(closemenu);

    document.addEventListener("keydown", closeSubOnEscape);

  }

  function handleThemeChange(e) {
    const target = e.target;
    const targetinput = target.firstElementChild;
    const value = targetinput.value;
    targetinput.checked = true;
    const currentTheme = context.getColorScheme();
    if (value === currentTheme) {
      return;
    }
    context.setColorScheme(value);
    setTheme(context);
  }


  function delegateSubMenuEvents(e) {
    const themebtn = getClosest(e, ".theme-option");
    const getCloseSubMenuBtn = getClosest(e, ".close-sub-menu");

    if (themebtn) {
      handleThemeChange(e);
      return;
    }

    if (getCloseSubMenuBtn) {
      closeSubMenu();
      return;
    }
  }

  function setSidebarSubMenu() {
    openSubMenu();
    sidebarSubMenu.onmousedown = delegateSubMenuEvents;
  }
  setSidebarSubMenu();
}