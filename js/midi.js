/*
 * Copyright (c) 2020 riuxe.github.io. All Rights Reserved.
 */

function midi_data(array, is_on, channel, volume) {
  let v0 = ((is_on? 0x90 : 0x80) | (channel & 0xf));
  let data = [];

  for (let i = 0; i < array.length; i++) {
    [].push.apply(data, [v0, array[i], volume]);
  }

  //return array.map(v => [data0, v, volume]);
  return data;
}

function midi_tx(output, data, delay = 0) {
  if (output == null) {
    console.log('Output is null');
    return;
  }

  //console.log('Send: ' + output.name + ': ' + data);
  output.send(data);
}

// Usage:
//	input.onmidimessage = midi_rx;
//
function midi_rx(ev) {
  /*
  let device = ev.target;
  //console.log('Receive from: ' + device.name + ':' + ev + ',' + ev.data);

  if ((ev.data[0] & 0xf0) == 0x90) {
    let tone = ev.data[1];
    let volume = ev.data[2];
  }
  */
}

function midi_init(callback) {
  if (!navigator.requestMIDIAccess) {
    alert('WebMIDI not available.');
    return -1;
  }

  navigator.requestMIDIAccess({sysex: true}).then(
    function (access) {
      let dic_input = {};
      let dic_output = {};

      let in_itr = access.inputs.values();
      let out_itr = access.outputs.values();

      /*
       * Enumerate input devices.
       */
      for (let e = in_itr.next(); !e.done; e = in_itr.next()) {
	let input = e.value;
	dic_input[input.name] = input;
      }

      /*
       * Enumerate output devices.
       */
      for (let e = out_itr.next(); !e.done; e = out_itr.next()) {
	let output = e.value;
	dic_output[output.name] = output;
      }

      callback(dic_input, dic_output, null);
    },

    function (error) { callback(null, null, error) }
  );

  return 0;
}
