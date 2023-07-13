import Entry from "../factory/entries.js";
import { testDate, compareDates } from "../utilities/dateutils.js";
import locales from "../locales/en.js";
const colors = locales.colors;


class Store {
  constructor () {
    this.store = localStorage.getItem("store")
      ? JSON.parse(localStorage.getItem("store"))
      : [];

    this.userUpload;

    this.ctg = localStorage.getItem("ctg")
      ? JSON.parse(localStorage.getItem("ctg"))
      : {
        default: { color: colors.blue[4], active: true },
      };

    this.activeOverlay = new Set();

    this.handleRenders = {
      sidebar: {
        callback: null,
      },
      datepicker: {
        reset: null,
      },
      form: {
        callback: null,
      },
      reconfig: {
        callback: null,
      },
      calendars: {
        previous: {
          reset: null,
        },
        month: {
          reset: null,
          resize: null,
        },
        day: {
          reset: null,
        },
      },
    };

    this.animationStatus = true;
  }



  /* ************************* */
  /* LOCAL STORAGE MANAGEMENT */
  static getStore() {
    return JSON.parse(localStorage.getItem("store")) || [];
  }

  static getActiveStore() {
    return JSON.parse(localStorage.getItem("activeStore")) || [];
  }

  static getCtg() {
    return JSON.parse(localStorage.getItem("ctg")) || [];
  }


  static getAnimationStatus() {
    return JSON.parse(localStorage.getItem("animationStatus"));
  }

  // *******************
  static setStore(store) {
    localStorage.setItem("store", JSON.stringify(store));
  }

  static setActiveStore(activeStore) {
    localStorage.setItem("activeStore", JSON.stringify(activeStore));
  }


  static setAnimationStatus(status) {
    localStorage.setItem("animationStatus", JSON.stringify(status));
  }

  /* ************************* */
  
  /* essential crud (entries) - create, read, update, delete */
  addEntry(entry) {
    this.store.push(entry);
    Store.setStore(this.store);
  }

  createEntry(...args) {
    this.addEntry(new Entry(...args));
    Store.setStore(this.store);
  }

  deleteEntry(id) {
    this.store = this.store.filter((entry) => entry.id !== id);
    Store.setStore(this.store);
  }

  getActiveEntries() {
    const active = this.getActiveCategories();
    if (!active) return [];
    const activeEntries = this.store.filter((entry) => {
      return active ? active.indexOf(entry.category) > -1 : [];
    });
    return activeEntries;
  }

  getEntry(id) {
    return this.store.find((entry) => entry.id === id);
  }

  getEntries() {
    return this.store || [];
  }

  getEntriesByCtg(ctg) {
    return this.store.filter((entry) => {
      return entry.category === ctg;
    });
  }

  removeLastEntry() {
    this.store.pop();
    Store.setStore(this.store);
  }

  getLastEntryId() {
    return this.store[this.store.length - 1].id;
  }

  compareEntries(entry1, entry2) {
    for (let key in entry1) {
      if (key === "id" || key === "coordinates") continue;
      if (key === "end" || key === "start") {
        if (new Date(entry1[key]).getTime() - new Date(entry2[key]).getTime() !== 0) {
          return false;
        }
      } else if (entry1[key] !== entry2[key]) {
        return false;
      }
    }
    return true;
  }

  updateEntry(id, data) {
    let entry = this.getEntry(id);
    entry = Object.assign(entry, data);
    Store.setStore(this.store);
  }


  getFirstAndLastEntry() {
    let sorted = this.sortBy(this.getActiveEntries(), "start", "desc");
    if (sorted === undefined) {
      return [0, 0];
    } else {
      return [sorted[0].start, sorted[sorted.length - 1].end];
    }
  }
  /* **************************** */

  generateCoordinates(start, end) {
    [start, end] = [testDate(start), testDate(end)];

    let startMin = start.getHours() * 4 + Math.floor(start.getMinutes() / 15);
    let endMin = end.getHours() * 4 + Math.floor(end.getMinutes() / 15);
    let height = endMin - startMin;
    let total = startMin + height;

    if (!compareDates(start, end)) {
      return {
        allDay: true,
        x: start.getDay(),
        x2: end.getDay(),
      };
    } else {
      return {
        allDay: false,
        x: start.getDay(),
        y: startMin,
        h: height,
        e: total,
      };
    }
  }

  getDayEntries(day) {
    let activeEntries = this.getActiveEntries();
    let boxes = {
      allDay: [], // entries that start on one day and end on another
      day: [], // entries that start and end on same day
    };

    if (activeEntries.length === 0) return boxes;

    let dayEntries = activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      return (
        y === day.getFullYear() && m === day.getMonth() && d === day.getDate()
      );
    });

    dayEntries.forEach((entry) => {
      entry.coordinates = this.generateCoordinates(
        new Date(entry.start),
        new Date(entry.end)
      );

      if (entry.coordinates.allDay) {
        boxes.allDay.push(entry);
      } else {
        boxes.day.push(entry);
      }
    });
    return boxes;
  }

  getDayEntriesArray(targetDate) {
    let activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];

    return activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      return (
        y === targetDate.getFullYear() &&
        m === targetDate.getMonth() &&
        d === targetDate.getDate()
      );
    });
  }

  getMonthEntries(montharr) {
    let activeEntries = this.getActiveEntries();
    if (activeEntries.length === 0) return [];

    return activeEntries.filter((entry) => {
      let entryDate = new Date(entry.start);
      return (
        entryDate >= montharr[0] && entryDate <= montharr[montharr.length - 1]
      );
    });
  }

  getMonthEntryDates(montharr) {
    let entries = this.getMonthEntries(montharr);
    let grouped = {};
    entries.forEach((entry) => {
      let entryDate = new Date(entry.start);
      const [y, m, d] = [
        entryDate.getFullYear(),
        entryDate.getMonth(),
        entryDate.getDate(),
      ];
      let key = `${y}-${m}-${d}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    });
    return Object.keys(grouped);
  }

  getGroupedMonthEntries(entries) {
    return entries.reduce((acc, entry) => {
      let tempDate = new Date(entry.start);
      let day = tempDate.getDate();
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(entry);
      return acc;
    }, {});
  }

  getDefaultCtg() {
    return Object.entries(this.ctg)[0];
  }

  getFirstActiveCategory() {
    for (let [key, value] of Object.entries(this.ctg)) {
      if (value.active) {
        return key;
      }
    }
    return "default";
  }

  getFirstActiveCategoryKeyPair() {
    for (let [key, value] of Object.entries(this.ctg)) {
      if (value.active) {
        return [key, value.color];
      }
    }
    const backup = this.getDefaultCtg();
    return [backup[0], backup[1].color];
  }

  getActiveCategories() {
    let active = Object.keys(this.ctg).filter((key) => this.ctg[key].active);
    if (active.length > 0) {
      return active;
    } else {
      active = [];
    }
  }

  getActiveCategoriesKeyPair() {
    return Object.entries(this.ctg).filter((key) => key[1].active);
  }

  getAllCtg() {
    return this.ctg;
  }


  getCtgColor(ctg) {
    return this.ctg[ctg].color;
  }


  hasCtg(categoryName) {
    let hasctg = false;
    for (let key in this.ctg) {
      if (key.toLowerCase() === categoryName.toLowerCase()) {
        hasctg = true;
      }
    }
    return hasctg;
  }


  /*  ANIMATION MANAGEMENT */

  getAnimationStatus() {
    const status = Store.getAnimationStatus();
    return status !== null ? status : true;
  }

  setAnimationStatus(status) {
    this.animationStatus = status;
    Store.setAnimationStatus(status);
  }


  /*  OVERLAY MANAGEMENT */

  addActiveOverlay(overlay) {
    this.activeOverlay.add(overlay);
  }

  removeActiveOverlay(overlay) {
    const len = this.activeOverlay.size;
    if (len === 0) {
      return;
    } else if (this.activeOverlay.size === 1) {
      this.activeOverlay = new Set();
      return;
    } else {
      this.activeOverlay = new Set(
        [...this.activeOverlay].filter((o) => o !== overlay)
      );
      return;
    }
  }

  getActiveOverlay() {
    return this.activeOverlay;
  }

  hasActiveOverlay() {
    return this.activeOverlay.size > 0;
  }


  /* ******************************************* */
  /*  STATE MANAGEMENT : RENDERING / RESET / RESIZE */

  setFormRenderHandle(type, callback) {
    this.handleRenders.calendars[type].render = callback;
  }

  setFormResetHandle(type, callback) {
    this.handleRenders.calendars[type].reset = callback;
  }

  setRenderFormCallback(callback) {
    this.handleRenders.form.callback = callback;
  }

  setRenderSidebarCallback(callback) {
    this.handleRenders.sidebar.callback = callback;
  }

  setResizeHandle(type, callback) {
    this.handleRenders.calendars[type].resize = callback;
  }

  setDataReconfigCallback(callback) {
    this.handleRenders.reconfig.callback = callback;
  }

  setResetDatepickerCallback(callback) {
    this.handleRenders.datepicker.reset = callback;
  }

  setResetPreviousViewCallback(callback) {
    this.handleRenders.calendars["previous"].reset = callback;
  }

  setRenderCategoriesCallback(callback) {
    this.handleRenders.categories.callback = callback;
  }

  getRenderCategoriesCallback() {
    return this.handleRenders.categories.callback;
  }

  getResetPreviousViewCallback() {
    return this.handleRenders.calendars["previous"].reset;
  }

  getResetDatepickerCallback() {
    return this.handleRenders.datepicker.reset;
  }

  getDataReconfigCallback() {
    return this.handleRenders.reconfig.callback;
  }

  getResizeHandle(type) {
    if (this.handleRenders.calendars[type] === undefined) {
      return null;
    } else {
      return this.handleRenders.calendars[type].resize;
    }
  }

  getFormRenderHandle(type) {
    if (this.handleRenders.calendars[type] === undefined) {
      return null;
    } else {
      return this.handleRenders.calendars[type].render;
    }
  }

  getFormResetHandle(type) {
    if (this.handleRenders.calendars[type].reset === undefined) {
      return null;
    } else {
      return this.handleRenders.calendars[type].reset;
    }
  }

  getRenderFormCallback() {
    const callback = this.handleRenders.form.callback;
    if (callback !== null) {
      return callback;
    } else {
      return null;
    }
  }

  getRenderSidebarCallback() {
    const callback = this.handleRenders.sidebar.callback;
    if (callback !== null) {
      return callback;
    } else {
      return null;
    }
  }
  /* ************************************ */
}

export default new Store();
