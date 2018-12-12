import { a, b, errorStates } from './constants';


export let helper;

export function setHelper(newHelper) {
  return helper || (helper = newHelper);
}

export const inWords = (num) => {
  const numberToString = num.toString();
  if ((numberToString).length > 9) return 'overflow';
  const n = (`000000000${num}`).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; let str = '';
  str += (Number(n[1]) !== 0) ? `${a[Number(n[1])] || `${b[n[1][0]]} ${a[n[1][1]]}`}crore ` : '';
  str += (Number(n[2]) !== 0) ? `${a[Number(n[2])] || `${b[n[2][0]]} ${a[n[2][1]]}`}lakh ` : '';
  str += (Number(n[3]) !== 0) ? `${a[Number(n[3])] || `${b[n[3][0]]} ${a[n[3][1]]}`}thousand ` : '';
  str += (Number(n[4]) !== 0) ? `${a[Number(n[4])] || `${b[n[4][0]]} ${a[n[4][1]]}`}hundred ` : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || `${b[n[5][0]]} ${a[n[5][1]]}`) : '';
  return str;
};

export const validate = (name, type, form) => {
  if (type === 'string') {
    if (form[name].length > 40) {
      return errorStates.string.tooLong;
    } else if (form[name].length > 0 && form[name].length <= 40) {
      return '';
    }
  }

  if (type === 'address') {
    const hexDecimalCheck = form[name].slice(0, 2);
    if (hexDecimalCheck !== '0x') {
      return errorStates.address.invalid;
    }
    if (form[name].length !== 42) {
      return errorStates.address.invalid;
    }
  }
  if (form[name].length === 0) {
    return errorStates.empty.empty;
  }
  return '';
};

export const containsIgnoreCase = (array, value) => {
  for (let i = 0; i < array.length; i += 1) {
    if (array[i].toLowerCase() === value.toLowerCase()) {
      return true;
    }
  }
  return false;
};
