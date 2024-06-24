export default class Utils {
  static generateId() {
    return Math.ceil(Math.random() * 10000000);
  }

  static matchPassword(pass, c_pass) {
    if (!!pass && c_pass !== pass) {
      return true;
    }
    return false;
  }

  static isValidEmail(value) {
    let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    if (regex.test(value)) {
      return true;
    }
    return false;
  }

  static isNumber(str) {
    if (/^[0-9\b]+$/.test(str)) {
      return true;
    }
    return false;
  }

  static inRange(value, max) {
    if (value.length < max) {
      return true;
    }
    return false;
  }

  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static removeUnderscore(str) {
    return str.split("_").join(" ");
  }

  // Calculate row number based on current page and items per page
  static getRowNumber(current_page, per_page, index) {
    return (current_page - 1) * per_page + index + 1;
  }

  static acceptCSV(str) {
    return ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
  }


  static sortByName = (employees) => {
    const options = employees?.map((option) => {
      const firstLetter = option?.name[0]?.toUpperCase();
      return {
        firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
        ...option,
      };
    });
    // Sort the options array based on the 'firstLetter' property.
    options.sort((a, b) => a.firstLetter.localeCompare(b.firstLetter));
    return options;
  };


  static limitStringWithEllipsis(str, limit) {
    if (str.length <= limit) {
      return str;
    }

    return str.substring(0, limit - 3) + "...";
  }
}
