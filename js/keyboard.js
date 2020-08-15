/*
 * Copyright (c) 2020 riuxe.github.io. All Rights Reserved.
 */

/*
 * Example keyboard param:
    keyboard_param = {
      keyboard_size: 25,
      keyboard_tone12_start: 0x3c,	// Midi C3
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
 */

function keyboard_create_minimum(selector, param) {
  let svg = d3.select(selector);

  let param_copy = {};
  Object.assign(param_copy, param);
  let keyboard = { svg: svg, param: param_copy };

  let key_all = [];
  let key_active_all = [];
  let key_dot_all = [];

  let x_max = 0;

  /*
   * Draw white keys.
   */
  let x = 0;
  for (let k = 0; k < param.keyboard_size; k++) {
    let tone12 = param.keyboard_tone12_start + k;
    let id = param.id_prefix + tone12;
    let r = tone12 % 12;

    let is_white = (tone_info12[r].length == 1);
    if (is_white) {
      let key = svg.append('rect')
	.attr('id', id)
	.attr('x', x)
	.attr('y', 0)
	.attr('width', param.white_width)
	.attr('height', param.white_height)
	.style('fill', 'white')
	.style('stroke', 'black')
      key_all[k] = key;

      if (param.active_color != null) {
	let key_active = svg.append('rect')
	  .attr('x', x)
	  .attr('y', 0)
	  .attr('width', param.white_width)
	  .attr('height', param.white_height)
	  .style('pointer-events', 'none')
	  .style('fill', param.active_color)
	  .style('stroke', 'black')
	  .style('opacity', 0.0);

	key_active_all[k] = key_active;
      }

      if (param.dot_color != null) {
	let dot = svg.append('circle')
	  .attr('cx', x + param.white_width / 2)
	  .attr('cy', param.white_height - (param.dot_radius * 3 / 2))
	  .attr('r', param.dot_radius)
	  .style('pointer-events', 'none')
	  .style('fill', param.dot_color);

	key_dot_all[k] = dot;
      }

      x += param.white_width;
    }
    else {
      if (k == 0)
	x += param.black_width / 2;
    }
  }

  x_max = Math.max(x, x_max);

  /*
   * Draw black keys.
   */
  let prev_black = false;

  x = 0;
  for (let k = 0; k < param.keyboard_size; k++) {
    let tone12 = param.keyboard_tone12_start + k;
    let id = param.id_prefix + tone12;
    let r = tone12 % 12;

    let is_white = (tone_info12[r].length == 1);
    if (is_white) {
      if (prev_black)
	x -= param.black_width / 2;

      x += param.white_width;
    }
    else {
      if (k != 0)
	x -= param.black_width / 2;

      let key = svg.append('rect')
	.attr('id', id)
	.attr('x', x)
	.attr('y', 0)
	.attr('width', param.black_width)
	.attr('height', param.black_height)
	.style('fill', 'black')
	.style('stroke', 'black')

      key_all[k] = key;

      if (param.active_color != null) {
	let key_active = svg.append('rect')
	  .attr('x', x)
	  .attr('y', 0)
	  .attr('width', param.black_width)
	  .attr('height', param.black_height)
	  .style('pointer-events', 'none')
	  .style('fill', param.active_color)
	  .style('stroke', 'black')
	  .style('opacity', 0.0);

	key_active_all[k] = key_active;
      }

      if (param.dot_color != null) {
	let dot = svg.append('circle')
	  .attr('cx', x + param.black_width / 2)
	  .attr('cy', param.black_height - (param.dot_radius * 3 / 2))
	  .attr('r', param.dot_radius)
	  .style('pointer-events', 'none')
	  .style('fill', param.dot_color);

	key_dot_all[k] = dot;
      }

      x += param.black_width;
    }

    prev_black = !is_white;
  }

  x_max = Math.max(x, x_max);

  svg.attr('width', x_max).attr('height', param.white_height);

  keyboard.key_all = key_all;
  keyboard.key_active_all = key_active_all;
  keyboard.key_dot_all = key_dot_all;

  keyboard.pushed = {};

  return keyboard;
}

function keyboard_create(selector, param) {

  function key_down(kbd, k) {
    let param = kbd.param;
    let key = kbd.key_all[k];
    let id = key.attr('id');
    let tone12 = param.keyboard_tone12_start + k;

    if (kbd.pushed[id]) {
      console.log('Repeated mousedown event fired!');
      return;
    }

    keyboard_pushed(kbd, [id], true);

    param.down_fn(kbd, [id], [tone12]);
  }

  function key_up(kbd, k) {
    let param = kbd.param;
    let key = kbd.key_all[k];
    let id = key.attr('id');
    let tone12 = param.keyboard_tone12_start + k;

    if (!kbd.pushed[id]) {
      console.log('mouseup/mouseleave event while not being pushed.');
      return;
    }

    keyboard_pushed(kbd, [id], false);

    param.up_fn(kbd, [id], [tone12]);
  }

  let keyboard = keyboard_create_minimum(selector, param);

  let key_all = keyboard.key_all;
  for (let k = 0; k < key_all.length; k++) {
    let key = key_all[k];
    let id = key.attr('id');
    let tone12 = param.keyboard_tone12_start + k;

    //console.log('key: ' + key.node());

    key.on('mousedown', function (dat, idx, grp) {
      key_down(keyboard, k)
    });
    key.on('mouseup', function (dat, idx, grp) {
      key_up(keyboard, k)
    });
    key.on('mouseleave', function (dat, idx, grp) {
      key_up(keyboard, k)
    });
  }

  return keyboard;
}

function keyboard_key_scale_change(keyboard, tone12, scale) {
  let param = keyboard.param;

  let key_dot_all = keyboard.key_dot_all;

  if (key_dot_all.length == 0)
    return;

  for (let k = 0; k < param.keyboard_size; k++)
    key_dot_all[k].style('opacity', 0.0);

  let array = scale_tone12(scale, tone12);

  for (let i = 0; i < array.length; i++) {
    let k = array[i] - param.keyboard_tone12_start;

    key_dot_all[k].style('opacity', 1.0);
    key_dot_all[k].style('fill', param.dot_color);

    for (let j = 12; ; j += 12) {
      let out = true;

      if (k - j >= 0) {
	out = false;

	if (i < array.length - 1) {
	  key_dot_all[k - j].style('opacity', 1.0);
	  key_dot_all[k - j].style('fill', param.dot_color_weak);
	}
      }

      if (k + j < param.keyboard_size) {
	out = false;

	if (i > 0) {
	  key_dot_all[k + j].style('opacity', 1.0);
	  key_dot_all[k + j].style('fill', param.dot_color_weak);
	}
      }

      if (out)
	break;
    }
  }
}

function keyboard_pushed(keyboard, id_array, is_pushed) {
  let pushed = keyboard.pushed;

  id_array.forEach(id => { pushed[id] = is_pushed });

  let key_all = keyboard.key_all;
  let key_active_all = keyboard.key_active_all;

  if (key_active_all.length == 0)
    return;

  for (let i = 0; i < key_all.length; i++) {
    let id = key_all[i].attr('id');
    let opacity = (pushed[id]? 1.0 : 0.0);
    key_active_all[i].style('opacity', opacity);
  }
}
