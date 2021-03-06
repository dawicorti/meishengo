'use strict';

/*
 * Module dependencies
 */

var _ = require('underscore');
var conf = require('../conf');
var game = require('./game');
var hat = require('hat');
var redis = require('redis');
var GameCache = require('../cache/game');

var ID_PATTERN = /^[\w\-]{3,16}$/;

/* Connection callback : listen to root elements */

var connection = module.exports = function (socket) {
  socket.on('game:create', _.bind(connection.createGame, this, socket));
  socket.on('game:spectate', _.bind(game.spectate, this, socket));
  socket.on('register', _.bind(connection.register, this, socket));
  socket.on('greetings', _.bind(connection.greetings, this, socket));
  socket.emit('greetings:request');
};

/* Create the game on redis */

connection.createGame = function (socket, data) {
  if (!data.id || !_.isString(data.id) || !data.id.match(ID_PATTERN)) {
    return;
  }

  data.goban = {size: data.size || 19};
  GameCache.createIfNotExists(data, _.bind(function (err, model) {
    if (err) return;

    socket.emit('game:created', {game: model.serialize()});
  }, this));
};

/* Register a new nickname on cache */

connection.register = function (socket, data) {
  var client = redis.createClient();
  var token = hat();
  var nickKey = 'nickname:' + data.nickname;
  var tokenKey = 'token:' + token;

  client.setnx(nickKey, token, function (err, res) {
    if (res === 1) {
      socket.emit('register:succeeded', {
        nickname: data.nickname,
        token: token
      });

      client.setnx(tokenKey, data.nickname, function () {
        client.expire(nickKey, conf.get('nickTTL'));
        client.expire(tokenKey, conf.get('nickTTL'));
      });
    } else {
      socket.emit('register:failed', {nickname: data.nickname});
    }
  });
};

/* Expand nickname and token life : keep player connected */

connection.heartbeat = function (socket, data) {
  if (data.token !== this.token || data.nickname !== data.nickname) return;

  var client = redis.createClient();
  var nickKey = 'nickname:' + data.nickname;
  var tokenKey = 'token:' + data.token;

  client.expire(nickKey, conf.get('nickTTL'));
  client.expire(tokenKey, conf.get('nickTTL'));
};

/* Retrieve nickname from registered token */

connection.greetings = function (socket, data) {
  var client = redis.createClient();
  var tokenKey = 'token:' + data.token;

  client.get('token:' + data.token, _.bind(function (err, res) {
    if (!res) return socket.emit('greetings:refused');

    this.nickname = res;
    this.token = data.token;
    socket.emit('greetings:accepted', data);
    socket.on('player:heartbeat', _.bind(connection.heartbeat, this, socket));
    _.bind(game.sendJoinRequest, this)(socket, data);
  }, this));
};