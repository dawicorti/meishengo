'use strict';

/*
 * Module dependencies
 */

var $ = require('jbone');
var _ = require('underscore');
var ChatBox = require('./chatbox');
var Mei = require('../mei');
var Goban = require('../model/goban');
var GobanView = require('./goban');
var Stone = require('../model/stone');


/*
 * GameContent
 */

var GameContent = module.exports = Mei.View.extend();

GameContent.prototype.className = 'mei-content-game';
GameContent.prototype.events = {
  'intersection:point': 'focusIntersection'
};


/* Append the goban */

GameContent.prototype.initialize = function (opts) {
  _.bindAll(this, 'putStone', 'previewStone', 'resize', 'show');
  this.model = opts.model;
  this.model.on('change:playerColor', this.resize);
  this.gobanView = new GobanView({model: this.model.goban()});
  this.gobanView.on('intersection:click', this.putStone);
  this.gobanView.on('intersection:hover', this.previewStone);
  this.chatbox = new ChatBox();
  this.echo(this.chatbox, 'intersection:point');
};

GameContent.prototype.focusIntersection = function (opts) {
  this.gobanView.meiGoban.setFocus(opts.row, opts.col);
};

/* If player can put stone : preview stone on goban */

GameContent.prototype.previewStone = function (opts) {
  if (!!this.lastPreview) {
    this.gobanView.removeStonePreview(this.lastPreview);
    this.lastPreview = null;
  }

  if (!this.model.has('playerColor')) return;

  var stone = new Stone(_.extend(opts, {color: this.model.get('playerColor')}));

  if (this.model.canPutStone(stone)) {
    this.gobanView.previewStone(stone);
    this.lastPreview = stone;
  }
};

/* Remove hiden class (with css transition) */

GameContent.prototype.show = function () {
  this.el.classList.remove('hidden');
};

/* Put a stone on goban */

GameContent.prototype.putStone = function (opts) {
  if (!this.model.has('playerColor')) return;

  var stone = {
    row: opts.row,
    col: opts.col,
    color: this.model.get('playerColor')
  };

  if (this.model.putStone(stone)) this.trigger('stone:put', {stone: stone});
};

/* Setup goban geometry from current content size */

GameContent.prototype.resize = function () {
  this.gobanView.resize();
};

/* Append goban and chatbox */

GameContent.prototype.render = function () {
  this.el.classList.add('hidden');
  this.$el.append(this.gobanView.render().el);
  this.$el.append(this.chatbox.render().el);
  return this;
};
