import { generateId } from "../utilities/helpers.js";

export default class Entry {
  constructor (category, completed, description, end, start, title) {
    this.category = category;
    this.completed = completed;
    this.description = description;
    this.end = end;
    this.id = generateId();
    this.start = start;
    this.title = title;
  }
}

class CoordinateEntry {
  constructor (category, completed, coordinates, description, id, title) {
    this.category = category;
    this.completed = completed || false;
    this.coordinates = coordinates || {};
    this.description = description;
    this.id = id;
    this.title = title;
  }
}

class Day {
  constructor (dayEntries, allDayEntries) {
    this.boxes = dayEntries;
    this.boxesTop = allDayEntries;
  }

  setAllBoxes(tempEntries) {
    this.boxes = tempEntries.day;
    this.boxesTop = tempEntries.allDay;
  }

  addBox(box) {
    this.boxes.push(box);
  }

  addBoxTop(box) {
    this.boxesTop.push(box);
  }

  getBox(id) {
    return this.boxes.find(box => box.id === id);
  }

  getBoxes() {
    return this.boxes;
  }

  getBoxesTop() {
    return this.boxesTop;
  }

  getAllBoxes() {
    return [...this.boxes, ...this.boxesTop];
  }

  getLength() {
    return this.boxes.length;
  }

  getBoxesTopLengths() {
    return this.getBoxesTop().reduce((a, c) => {
      let start = new Date(c.start);
      if (a[start.getDay()]) {
        a[start.getDay()]++;
      }
      else {
        a[start.getDay()] = 1;
      }
      return a;
    }, {});
  }

  getEntriesByTitle(title) {
    return this.boxes.filter(box => box.title.toLowerCase().includes(title.toLowerCase()));
  }

  updateCoordinates(id, coordinates) {
    this.getBox(id).coordinates = coordinates;
  }

  getEntriesEndingOnDay(day) {
    return this.boxes.filter(box => +box.coordinates.e === day);
  }

  sortByY(bxs) {
    return bxs.sort((a, b) => {
      let diff = +a.coordinates.y - +b.coordinates.y;
      if (diff === 0) {
        return +a.coordinates.e - +b.coordinates.e;
      } else {
        return diff;
      }
    });
  }

  checkForCollision() {
    const bxs = this.getBoxes();
    let overlaps = [];
    for (let i = 0; i < bxs.length; i++) {
      for (let j = i + 1; j < bxs.length; j++) {
        const e1 = bxs[i];
        const e2 = bxs[j];
        if (e1.coordinates.y < e2.coordinates.e && e1.coordinates.e > e2.coordinates.y) {
          if (!overlaps.includes(e1)) {
            overlaps.push(e1);
          }
          if (!overlaps.includes(e2)) {
            overlaps.push(e2);
          }
        }
      }
    }
    return overlaps.sort((a, b) => +a.coordinates.y - +b.coordinates.y)
  }

  updateStore(store, id) {
    const boxEntry = this.getBox(id);
    const coords = boxEntry.coordinates;
    let boxstart = +coords.y * 15;
    let boxend = +coords.e * 15;

    const startDate = new Date(boxEntry.start);
    const starthours = Math.floor(boxstart / 60);
    const startminutes = boxstart % 60;
    startDate.setHours(starthours);
    startDate.setMinutes(startminutes);

    const endDate = new Date(boxEntry.start);
    let endhours = Math.floor(boxend / 60);
    let endminutes = boxend % 60;
    if (endhours === 24) {
      endhours = 23;
      endminutes = 59;
    }
    endDate.setHours(endhours);
    endDate.setMinutes(endminutes);

    store.updateEntry(id, {
      start: startDate,
      end: endDate,
    });
  }
}

export {
  CoordinateEntry,
  Day,
};