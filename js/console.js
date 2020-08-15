/*
 * Copyright (c) 2020 riuxe.github.io. All Rights Reserved.
 */

const keyboard_param = {
  keyboard_size: 61,
  keyboard_tone12_start: tone12_c3 - 12*2,
  white_width: 24,
  black_width: 20,
  white_height: 140,
  black_height: 80,
  active_color: '#ffdd22',
  dot_radius: 10,
  dot_color: '#ee0066',
  dot_color_weak: '#ffddff',
  id_prefix: 'keyboard_key_',
  down_fn: keyboard_down,
  up_fn: keyboard_up,
}

const chord_color = {
  'T0': '#00ff11',
  'T1': '#ddffcc',
  'S0': '#ffbb00',
  'S1': '#ffddcc',
  'D0': '#cc00ff',
  'D1': '#ffccdd'
};


let state = {
  keyboard: null,
  scale: 0,
  key: 0,
  inversion: 0,
  dic_input: null,
  dic_output: null,
  output: null,
  button_release: {},
  button_all: null,
};


function array_rotate(array, left) {
  for (let i = 0; i < left; i++) {
    let v = array.shift();
    array.push(v);
  }

  return array;
}

function keyboard_down(kbd, id_array, tone_array) {
  let data = midi_data(tone_array, true, 0, 80);
  midi_tx(state.output, data);
}

function keyboard_up(kbd, id_array, tone_array) {
  let data = midi_data(tone_array, false, 0, 0);
  midi_tx(state.output, data);
}

function key_scale_change(key12, scale) {
  if (key12 != state.key) {
    state.key = key12;
  }
  else if (scale != state.scale) {
    if ($('#key_scale_checkbox').prop('checked')) {
      if (scale == 0)
	key12 = (key12 + 3) % 12;
      else if (state.scale == 0) {
	key12 = (key12 + 9) % 12;
      }

      state.key = key12;
      $('#key_' + key12).prop('checked', true);
    }

    state.scale = scale;
  }

  keyboard_key_scale_change(state.keyboard, tone12_c3 + key12, scale);

  for (let chd = 0; chd < chord_info.length; chd++) {
    for (let t12 = 0; t12 < tone_info12.length; t12++) {
      if (state.button_all[t12][chd] != null)
	state.button_all[t12][chd].css('background-color', '#e0e0e0');
    }
  }

  let scale_chd = (scale == 0? 0 : 3);
  let tone_array = scale_tone12(scale_chd, key12);

  for (let i = 0; i < tone_array.length - 1; i++) {
    let chd = chord_by_suffix(chord_diatonic_info[i][scale_chd == 0? 1:2]);
    let t = tone_array[i] % 12;
    if (state.button_all[t][chd] != null) {
      let color = chord_color[chord_diatonic_info[i][0]];
      state.button_all[t][chd].css('background-color', color);
    }
  }
}

function button_name(t12, chd) {
  return 'chord_' + t12 + ':' + chd;
}

function button_create(t12, chd) {
  return $('<button>', {
    "class": 'chord_button',
    id: button_name(t12, chd),
    html: chord_name_all(t12, chd, 0),

    mousedown: function (ev) {
      button_down(t12, chd, ev);
    },

    mouseup: function (ev) {
      button_up(t12, chd, ev, 'up')
    },

    mouseleave: function (ev) {
      button_up(t12, chd, ev, 'up')
    },

    mouseout: function (ev) {
    },
  });
}

function button_down(t12, chd, ev) {
  let id = ev.target.id;
  let inversion = state.inversion;
  let info = tone_info12[t12];

  if (info.length > 1) {
    let t0 = info[0];
    let half0 = +1;
    let name0 = chord_name(t0, half0, chd, inversion);
    let array0 = chord_tone_name(t0, half0, chd);
    let text0 = (name0 + '=[ ' + array_rotate(array0, inversion).join(', ') + ' ]');

    let t1 = info[1];
    let half1 = -1;
    let name1 = chord_name(t1, half1, chd, inversion);
    let array1 = chord_tone_name(t1, half1, chd);
    let text1 = (name1 + '=[ ' + array_rotate(array1, inversion).join(', ') + ' ]');

    $('#chord_tone_span').text(text0 + ', ' + text1);
  }
  else {
    let t = info[0];
    let name = chord_name(t, 0, chd, inversion);
    let array = chord_tone_name(t, 0, chd);
    let text = (name + '=[ ' + array_rotate(array, inversion).join(', ') + ' ]');
    $('#chord_tone_span').text(text);
  }

  let chord = chord_tone(tone12_c3 + t12, chd, inversion);
  let data = midi_data(chord, true, 0, 80);
  midi_tx(state.output, data);

  let id_array = chord.map(t => keyboard_param.id_prefix + t);
  keyboard_pushed(state.keyboard, id_array, true);

  state.button_release[id] = chord;
}

function button_up(t12, chd, ev, fun) {
  let id = ev.target.id;

  if (state.button_release[id] == null) {
    console.log('button_release is null: ' + fun);
    return;
  }

  let chord = state.button_release[id];
  let data = midi_data(chord, false, 0, 0);
  midi_tx(state.output, data);

  let id_array = chord.map(t => keyboard_param.id_prefix + t);
  keyboard_pushed(state.keyboard, id_array, false);

  delete state.button_release[id];
}

function button_change(inversion) {
  for (let t12 = 0; t12 < tone_info12.length; t12++) {
    for (let chd = 0; chd < chord_info.length; chd++) {
      state.button_all[t12][chd].html(chord_name_all(t12, chd, inversion));
    }
  }
}

function table_create() {
  let table = $('#chord_table');
  let tr = $('<tr>').appendTo(table);

  $('<th>Chord</th>').appendTo(tr);

  for (let t12 = 0; t12 < tone_info12.length; t12++) {
    let info = tone_info12[t12];
    let name;
    if (info.length == 2) {
      let name0 = tone_name12(info[0], +1);
      let name1 = tone_name12(info[1], -1);
      name = name0 + ',' + name1;
    }
    else {
      name = tone_name12(info[0], 0);
    }

    $('<th>' + name + '</th>').appendTo(tr);
  }

  state.button_all = new Array(tone_info12.length);
  for (let t12 = 0; t12 < state.button_all.length; t12++) {
    state.button_all[t12] = new Array(chord_info.length).fill(null);
  }

  for (let chd = 0; chd < chord_info.length; chd++) {
    let tr = $('<tr>', {
      id: 'chord_row_' + chd,
    }).appendTo(table);
    $('<td>X' + chord_suffix(chd) + '</td>').appendTo(tr);
    for (let t12 = 0; t12 < tone_info12.length; t12++) {
      let td = $('<td>').appendTo(tr);
      let btn = button_create(t12, chd).appendTo(td);

      state.button_all[t12][chd] = btn;
    }
  }
}

function table_change() {
  for (let chd = 0; chd < chord_info.length; chd++) {
    if ($('#chord_select_' + chd).prop('checked')) {
      $('#chord_row_' + chd).css('display', 'table-row');
    }
    else {
      $('#chord_row_' + chd).css('display', 'none');
    }
  }
}

$(window).keydown(function(ev) {
  switch (ev.key) {
  case '0':
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
    v = parseInt(ev.key, 10);
    if (v == 0)
      v = 10;
    state.inversion = v;
    button_change(state.inversion);
    break;
  }
});

$(window).keyup(function(ev) {
  switch (ev.key) {
  case '0':
  case '1':
  case '2':
  case '3':
  case '4':
  case '5':
  case '6':
  case '7':
  case '8':
  case '9':
    state.inversion = 0;
    button_change(state.inversion);
    break;
  }
});

$('#midi_output').change(function () {
  let name = $(this).val();
  state.output = state.dic_output[name];
});

$(document).ready(function () {
  state.keyboard = keyboard_create('#keyboard_svg', keyboard_param);

  key_button_create(
    '#key_div', 'key_', 'key_label_',
    function (k) { key_scale_change(k, state.scale) }
  );
  scale_button_create(
    '#scale_div', 'scale_',
    function (s) { key_scale_change(state.key, s) }
  );

  let div = $('#chord_select_div');
  for (let chd = 0; chd < chord_info.length; chd++) {
    let id = "chord_select_" + chd;
    let box = $('<input>', {
      type: "checkbox",
      id: id,
      name: chord_suffix(chd),
      checked: "checked",
      change: function () { table_change() },
    }).appendTo(div);

    let label = $('<label>', {
      text: 'X' + chord_suffix(chd) + ' ',
      for: id,
    }).appendTo(div);
  }

  table_create();

  key_scale_change(0, 0, keyboard_param);

  $('#scale_0').prop('checked', true);
  $('#key_0').prop('checked', true);

  $('#legend-tonic').css('background-color', chord_color['T0']);
  $('#legend-sub-dominant').css('background-color', chord_color['S0']);
  $('#legend-dominant').css('background-color', chord_color['D0']);

  midi_init(midi_callback);
});

function midi_callback(dic_input, dic_output, error) {
  if (error) {
    alert("Can't access MIDI: " + error);
    return;
  }

  state.dic_input = dic_input;
  state.dic_output = dic_output;

  for (let name in dic_input) {
    console.log('Found input: ' + name);
  }

  for (let name in dic_output) {
    console.log('Found output: ' + name);

    let output = dic_output[name]

    $('<option>', {
      value: name,
      text: name,
    }).appendTo($('#midi_output'));

    if (state.output == null) {
      state.output = output;
    }
  }
}
