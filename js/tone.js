/*
 * Copyright (C) 2020 riuxe.github.io. All Rights Reserved.
 */

/* MIDI C3 */
const tone12_c3 = 0x3c;

const tone_info7 = [
  ['C',  0], 
  ['D',  2],
  ['E',  4],
  ['F',  5],
  ['G',  7],
  ['A',  9],
  ['B', 11],
];

const tone_info12 = [
  [0],
  [0, 1],
  [1],
  [1, 2],
  [2],
  [3],
  [3, 4],
  [4],
  [4, 5],
  [5],
  [5, 6],
  [6],
];

function tone_7to12(note7, half) {
  return tone_info7[note7][1] + half;
}

function tone_midi(tone12, octave) {
  return tone12_c3 + (octave - 3) * 12 + tone12;
}

function tone_name7(tone7, half = 0) {
  let name = tone_info7[tone7][0];
  let h;

  if (half > 0) {
    h = new Array(+half).fill('♯').join('');
  }
  else if (half < 0) {
    h = new Array(-half).fill('♭').join('');
  }
  else {
    h = "";
  }

  return name + h;
}

function tone_name12(tone12, sign = null) {
  let info = tone_info12[tone12];
  if (info.length == 1)
    return tone_name7(info[0]);
  else {
    let name0 = tone_name7(info[0], +1);
    let name1 = tone_name7(info[1], -1);

    if (sign == +1)
      return name0;
    else if (sign == -1)
      return name1;
    else
      return name0 + ',' + name1;
  }
}

const scale_info = [
  ['Major',		[2, 2, 1, 2, 2, 2, 1]],
  ['Minor(natural)',	[2, 1, 2, 2, 1, 2, 2]],
  ['Minor(melodic)',	[2, 1, 2, 2, 2, 2, 1]],
  ['Minor(harmonic)',	[2, 1, 2, 2, 1, 3, 1]],
];

const scale_key = [
  [+0, -1, +0, -1, +0, +0, +1, +0, -1, +0, -1, +0],	/* major */
  [+0, +1, +0, +1, +0, +0, +1, +0, +1, +0, -1, +0],	/* minor */
];

function scale_tone12(scale, key12) {
  let v = key12;
  let array = [v];

  for (let i = 0; i < scale_info[scale][1].length; i++) {
    v += scale_info[scale][1][i];
    array.push(v);
  }

  return array;
}

function key_button_create(selector, id_prefix, id_label_prefix, change_fn) {
  let div = $(selector);

  let button_array = [];

  for (let t12 = 0; t12 < tone_info12.length; t12++) {
    let id = id_prefix + t12;
    let label_id = id_label_prefix + t12;

    let button = $('<input>', {
      type: 'radio',
      id: id,
      name: 'key',
      change: function () {
	change_fn(t12);
      }
    }).appendTo(div);

    button_array.push(button);

    let name = tone_name12(t12);

    let label = $('<label>', {
      id: label_id,
      text: name + ' ',
      for: id,
    }).appendTo(div);
  }

  return button_array;
}

function scale_button_create(selector, id_prefix, change_fn) {
  let div = $(selector);

  let button_array = [];

  for (let i = 0; i < scale_info.length; i++) {
    let id = id_prefix + i;

    let button = $('<input>', {
      type: 'radio',
      id: id,
      name: 'scale',
      change: function () {
	change_fn(i);
      }
    }).appendTo(div);

    button_array.push(button);

    let label = $('<label>', {
      text: scale_info[i][0] + ' ',
      for: id,
    }).appendTo(div);
  }

  return button_array;
}
