export default class FormSetup {
  constructor () {
    this.submission;
    this.category;
    this.dates;
  }


  setSubmission(type, id, title, description) {
    this.submission = {
      type: type,
      id: id || null,
      title: title || null,
      description: description || null,
    };
  }

  setCategory(name, color) {
    this.category = {
      name: name,
      color: color,
    };
  }

  setDates(object) {
    this.dates = { object: object };
  }

  getSetup() {
    return {
      submission: this.submission,
      category: this.category,
      dates: this.dates,
    };
  }
}