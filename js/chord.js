/*
 * Copyright (C) 2020 riuxe.github.io. All Rights Reserved.
 */

const chord_info = [
  ['',		'10003005'],		/* major */
  ['m',		'10030005'],		/* minor */
  ['5',		'10000005'],		/* power chord */
  ['sus4',	'10000405'],
  ['sus2',	'10200005'],
  ['aug',	'100030005'],
  ['dim',	'1003005'],
  ['7',		'10003005007'],
  ['m7',	'10030005007'],
  ['M7',	'100030050007'],
  ['mM7',	'100300050007'],
  ['m7-5',	'10030050007'],
  ['dim7',	'1003005007'],
  ['6',		'1000300506'],
  ['m6',	'1003000506'],
  ['msus4',	'10030405'],
  ['7sus4',	'10000405007'],
  ['add9',	'10203005'],		/* add9/add2 */
  ['9',		'100030050070009'],
];

const chord_diatonic_info = [
  ['T0',	'',	'm'],
  ['S1',	'm',	'm7-5'],
  ['T1',	'm',	'aug'],
  ['S0',	'',	'm'],
  ['D0',	'7',	'7'],
  ['T1',	'm',	''],
  ['D1',	'm7-5',	'dim7'],
];

function chord_suffix(chd) {
  return chord_info[chd][0];
}

function chord_tone_info(chd) {
  return chord_info[chd][1];
}

function chord_by_suffix(suffix) {
  for (let i = 0; i < chord_info.length; i++) {
    if (chord_info[i][0] == suffix)
      return i;
  }

  return -1;
}

function chord_tone_count(chd) {
  let info = chord_tone_info(chd);
  let cnt = 0;

  for (let i = 0; i < info.length; i++) {
    if (info.charAt(i) != '0') {
      cnt++;
    }
  }

  return cnt;
}

function chord_tone(root12, index, inversion) {
  let info = chord_tone_info(index);
  let array = [];

  for (let i = 0; i < info.length; i++) {
    if (info.charAt(i) != '0') {
      array.push(root12 + i);
    }
  }

  for (let i = 0; i < inversion; i++) {
    let v = array.shift();
    array.push(v + 12);
  }

  return array;
}

function chord_tone_name(root7, half, chd) {
  let info = chord_tone_info(chd);
  let start = tone_7to12(root7, half);
  let array = [];

  for (let i = 0; i < info.length; i++) {
    if (info.charAt(i) != '0') {
      let v = parseInt(info.charAt(i), 16) - 1;
      let t = (root7 + v) % 7;
      let name = tone_name7(t);
      let base = tone_7to12(t, 0);
      let delta = ((start + i + 12) - base) % 12;

      if (delta < 6) {
	h = new Array(delta).fill('♯').join('');
      }
      else {
	h = new Array(12-delta).fill('♭').join('');
      }

      array.push(name + h);
    }
  }

  return array;
}

function chord_name(root7, half, chd, inversion) {
  let suffix = chord_suffix(chd);
  let name = tone_name7(root7, half);
  let array = chord_tone_name(root7, half, chd);
  let r = inversion % array.length;

  if (r > 0) {
    suffix += "/" + array[r];
  }

  return name + suffix;
}

function chord_name_all(root12, chd, inversion) {
  let info = tone_info12[root12];
  if (info.length > 1) {
    let name0 = chord_name(info[0], +1, chd, inversion);
    let name1 = chord_name(info[1], -1, chd, inversion);

    return name0 + "<br/>" + name1;
  }
  else {
    return chord_name(info[0], 0, chd, inversion);
  }
}
