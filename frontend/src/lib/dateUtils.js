/**
 * Utility functions for date and time formatting
 */

export const safeDateString = (dateVal) => {
  if (!dateVal || dateVal === "-") return "";
  const str = String(dateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/");
    let yearNum = parseInt(y, 10);
    if (yearNum > 2400) yearNum -= 543;
    return `${yearNum}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDate = (dateVal, language = "en") => {
  if (!dateVal || dateVal === "-") return "-";

  const isoStr = safeDateString(dateVal);
  if (isoStr && /^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
    const [y, m, dStr] = isoStr.split("-");
    const day = dStr.padStart(2, "0");
    const month = m.padStart(2, "0");
    let year = parseInt(y, 10);
    if (language === "th") {
      year += 543;
    }
    return `${day}/${month}/${year}`;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  let year = d.getFullYear();
  if (language === "th") {
    year += 543;
  }
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateVal, language = "en") => {
  if (!dateVal || dateVal === "-") return "-";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  let year = d.getFullYear();
  if (language === "th") {
    year += 543;
  }
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
