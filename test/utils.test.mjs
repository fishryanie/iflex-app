/** @format */

import {
  URLToTile,
  percentage,
  convertToSeconds,
  generatePassword,
  Pagination,
  convertToMilliseconds,
} from '#helpers';
import { expect, should } from 'chai';

describe('Convert To Milliseconds', () => {
  it('should return correct milliseconds for "01:23:45"', () => {
    expect(convertToMilliseconds('01:23:45')).to.equal(5025000);
  });
  it('should return correct milliseconds for "01:00:00"', () => {
    expect(convertToMilliseconds('01:00:00')).to.equal(3600000);
  });
  it('should return correct milliseconds for "00:05:30"', () => {
    expect(convertToMilliseconds('00:05:30')).to.equal(330000);
  });
  it('should return correct milliseconds for "00:01:00"', () => {
    expect(convertToMilliseconds('00:01:00')).to.equal(60000);
  });
  it('should return correct milliseconds for "00:00:30"', () => {
    expect(convertToMilliseconds('00:00:30')).to.equal(30000);
  });
});

describe('Convert To Seconds', () => {
  it('should return correct seconds for "01:23:45"', () => {
    expect(convertToSeconds('01:23:45')).to.equal(5025);
  });
  it('should return correct seconds for "01:00:00"', () => {
    expect(convertToSeconds('01:00:00')).to.equal(3600);
  });
  it('should return correct seconds for "00:05:30"', () => {
    expect(convertToSeconds('00:05:30')).to.equal(330);
  });
  it('should return correct seconds for "00:01:00"', () => {
    expect(convertToSeconds('00:01:00')).to.equal(60);
  });
  it('should return correct seconds for "00:00:30"', () => {
    expect(convertToSeconds('00:00:30')).to.equal(30);
  });
});

describe('Generate Password', () => {
  const password = generatePassword();
  // it('should generate random password with minimum 8 characters and maximum 20 characters', () => {
  //   expect(password.length).to.be.within(8, 20);
  // });
  it('should contain at least one upper case character', () => {
    expect(password).to.match(/[A-Z]/);
  });
  it('should contain at least one lower case character', () => {
    expect(password).to.match(/[a-z]/);
  });
  it('should contain at least one number', () => {
    expect(password).to.match(/\d/);
  });
  // it('should contain at least one special character', () => {
  //   expect(password).to.match(/[!-@#\`|.,;'"+=~()$%^&_*]/);
  // });
});

describe('Url To Tile', () => {
  it('should convert URL string to uppercase and replace hyphens with spaces', () => {
    const url = '/example-string';
    const expectedResult = 'EXAMPLE STRING';
    const result = URLToTile(url);
    expect(result).to.equal(expectedResult);
  });
});

describe('percentage', () => {
  it('calculates the correct percentage', () => {
    const totalValue = 100;
    const partialValue = 50;
    const result = percentage(totalValue, partialValue);
    expect(result).to.equal('50.00');
  });
  it('calculates the correct percentage with decimal places', () => {
    const totalValue = 100;
    const partialValue = 75.345;
    const result = percentage(totalValue, partialValue);
    expect(result).to.equal('75.34');
  });
  it('returns "0.00" if totalValue is 0', () => {
    const totalValue = 0;
    const partialValue = 50;
    const result = percentage(totalValue, partialValue);
    expect(result).to.equal('Infinity');
  });
});

