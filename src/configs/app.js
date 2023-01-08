
const listDateNewBook = 'EBOOKS_NEW'
const listDaysOfWeeek = 'DAYS_OF_WEEK'

const allowed = {
  uppers: "QWERTYUIOPASDFGHJKLZXCVBNM",
  lowers: "qwertyuiopasdfghjklzxcvbnm",
  numbers: "1234567890",
  symbols: "!@#$%^&*"
}

const getRandomCharFromString = (str) => str.charAt(Math.floor(Math.random() * str.length))
const generatePassword = (length = 16) => { // password will be @Param-length, default to 8, and have at least one upper, one lower, one number and one symbol
  let pwd = "";
  pwd += getRandomCharFromString(allowed.uppers); //pwd will have at least one upper
  pwd += getRandomCharFromString(allowed.lowers); //pwd will have at least one lower
  pwd += getRandomCharFromString(allowed.numbers); //pwd will have at least one number
  pwd += getRandomCharFromString(allowed.symbols);//pwd will have at least one symbolo
  for (let i = pwd.length; i < length; i++)
    pwd += getRandomCharFromString(Object.values(allowed).join('')); //fill the rest of the pwd with random characters
  return pwd
}


function addDays(numDays){
  const today = new Date()
  today.setHours(7,0,0,0);
  today.setDate(today.getDate() + numDays)
  return today
}

function addArrayDays(type, count){
  const array = []
  switch (type) { 
    case listDateNewBook: {
      for (let index = -10; index <= 0; index++) {
        array.push(addDays(index))
      }
      return array;
    }
    case listDaysOfWeeek: {
      let dayOfWeek = addDays(0).getDay()
      for (let index = -dayOfWeek + 1; index <=  7 - dayOfWeek; index++) {
        array.push(addDays(index))
      }
      return array;
    }
    default: return array
  }
}

function randomArray(arr, count) {
  let len = arr.length;
  let lookup = {};
  let tmp = [];
  if (count > len) count = len;
  for (let i = 0; i < count; i++) {
    let index;
    do {
      index = ~~(Math.random() * len);
    } while (index in lookup);
    lookup[index] = null;
    tmp.push(arr[index]);
  }
  return tmp;
}

function randomString(length) {
  var result           = [];
  var characters       = 'abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
  }
  return result.join('');
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  let newDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  newDate.setHours(7,0,0,0);
  return newDate;
}

function subStr(value){
  return value?.substring(value.lastIndexOf('/')+1, value?.length);    
}

const globalFunc = {
  addDays,
  addArrayDays,
  subStr,
  randomDate,
  randomArray,
  randomString,
  randomInteger,
  generatePassword
}



module.exports = globalFunc