/** @format */

export const NUM_OTP = 6;

export const EXPIRES_OTP = 300;

export const EXPIRES_TOKEN = 1800; // 30m

export const EXPIRES_REFRESH = 2592000; // 30day

export const REGEX_NUMBER = /^[0-9]*$/;

export const REGEX_CODE = /^[a-zA-Z0-9]+$/;

export const REGEX_NUMBER_FLOAT = /^\d*\.?\d*$/;

export const REGEX_ALPHABET = /^[a-zA-Z ]*$/;

export const REGEX_PWD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*.?])[A-Za-z\d#$@!%&*.?]{8,30}$/;

export const REGEX_EMAIL =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export const REGEX_PHONE =
  /((086|096|097|098|032|033|034|035|036|037|038|039|088|091|094|083|084|085|081|082|089|090|093|070|079|077|076|078|092|056|058|099|059)+([0-9]{7})\b)/g;

export const STATUS_NEXT = {
  exist: 'next_when_found',
  unExist: 'next_when_not_found',
};

export const STATUS_USER = [
  { code: 1, text: 'Deactive' },
  { code: 2, text: 'Pending to join group' },
  { code: 3, text: 'Pending to create store' },
  { code: 4, text: 'Pending to create group' },
  { code: 6, text: 'Pending to register collaborators' },
  { code: 5, text: 'Pending to register personal trainer' },
];

export const BIG_CATEGORIES_DATA_DEFAULT = [
  { name: 'Membership' },
  { name: 'Personal Trainer' },
  { name: 'Meal Plan' },
  { name: 'Workout Plan' },
  { name: 'Supplement' },
];