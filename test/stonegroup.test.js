var assert = require('assert');
var _ = require('underscore');
var StoneGroup = require('../lib/model/stonegroup');
var Stone = require('../lib/model/stone');

describe('StoneGroup', function () {

  describe('color()', function () {

    it('should be black', function () {
      var group = new StoneGroup({stones: [
        {col: 1, row: 2, color: 'black'}
      ]});

      assert.equal('black', group.color());
    });

    it('should be white', function () {
      var group = new StoneGroup({stones: [
        {col: 1, row: 2, color: 'white'}
      ]});

      assert.equal('white', group.color());
    });
  });

  describe('contains()', function () {

    it('should recognize a stone it owns', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var group = new StoneGroup({stones: [
        stone1,
        {col: 1, row: 2, color: 'black'},
        {col: 1, row: 4, color: 'black'}
      ]});

      assert.equal(true, group.contains(stone1));
    });

    it('should recognize when it does\'nt own a stone', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var stone2 = new Stone({col: 1, row: 2, color: 'black'});
      var stone3 = new Stone({col: 1, row: 3, color: 'black'});
      var stone4 = new Stone({col: 1, row: 4, color: 'black'});
      var group = new StoneGroup({stones: [stone1, stone2, stone3]});

      assert.equal(false, group.contains(stone4));
    });

  });

  describe('attach()', function () {

    it('should be able to add stone', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var stone2 = new Stone({col: 1, row: 2, color: 'black'});
      var stone3 = new Stone({col: 1, row: 3, color: 'black'});
      var stone4 = new Stone({col: 1, row: 4, color: 'black'});
      var group = new StoneGroup({stones: [stone1, stone2, stone3]});


      assert.equal(true, group.attach(stone4));
    });

    it('shouldn\'t be able to add stone that is too far', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var stone2 = new Stone({col: 1, row: 2, color: 'black'});
      var stone3 = new Stone({col: 1, row: 3, color: 'black'});
      var farStone = new Stone({col: 1, row: 5, color: 'black'});
      var group = new StoneGroup({stones: [stone1, stone2, stone3]});

      assert.equal(false, group.attach(farStone));
    });

    it('should be able to create the group', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var stone2 = new Stone({col: 1, row: 2, color: 'black'});
      var stone3 = new Stone({col: 1, row: 3, color: 'black'});
      var stone4 = new Stone({col: 2, row: 3, color: 'black'});
      var group = new StoneGroup({stones: [stone1]});

      assert.equal(true, group.attach(stone2));
      assert.equal(true, group.attach(stone3));
      assert.equal(true, group.attach(stone4));
    });

    it('should not accept a replacing', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var stone2 = new Stone({col: 1, row: 2, color: 'black'});
      var group = new StoneGroup({stones: [stone1, stone2]});

      assert.equal(false, group.attach(stone1));
    });

    it('should not accept a stone from opposite color', function () {
      var stone1 = new Stone({col: 1, row: 1, color: 'black'});
      var stone2 = new Stone({col: 1, row: 2, color: 'black'});
      var group = new StoneGroup({stones: [stone1]});

      assert.equal(false, group.attach(stone2.oppositeStone()));
      assert.equal(1, group.size());
    });
  });

  describe('eat()', function () {
   
    it('should copy every other stones', function () {
      var group1 = new StoneGroup({stones: [{col: 1, row: 1, color: 'black'}]});
      var group2 = new StoneGroup({stones: [{col: 2, row: 1, color: 'black'}, {col: 3, row: 1, color: 'black'}]});

      group1.eat(group2);
      assert.equal(3, group1.size());
      assert.equal(true, group1.contains({col: 2, row: 1, color: 'black'}));
    });

    it('should empty the eaten group', function () {
      var group1 = new StoneGroup([{col: 1, row: 1, color: 'black'}])
      var group2 = new StoneGroup([{col: 2, row: 1, color: 'black'}, {col: 3, row: 1, color: 'black'}])

      group1.eat(group2);
      assert.equal(0, group2.size());
    });

  });

  describe('liberties()', function () {

    it('should returns 8 if in center and no stones near', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'}
      ]});

      assert.equal(8, group.liberties([], 19).size());
    });


    it('should returns 13 in the one-eye square case', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'},
        {row: 9, col: 10, color: 'black'},
        {row: 10, col: 10, color: 'black'},
        {row: 10, col: 9, color: 'black'},
        {row: 10, col: 8, color: 'black'},
        {row: 9, col: 8, color: 'black'}
      ]});

      assert.equal(13, group.liberties([], 19).size());
    });


    it('should returns 12 in the one-eye square case with a stone in the middle', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'},
        {row: 9, col: 10, color: 'black'},
        {row: 10, col: 10, color: 'black'},
        {row: 10, col: 9, color: 'black'},
        {row: 10, col: 8, color: 'black'},
        {row: 9, col: 8, color: 'black'}
      ]});

      assert.equal(12, group.liberties([{row: 9, col: 9, color: 'white'}], 19).size());
    });

  });

  describe('touches()', function () {

    it('should return true if the stone is at the top', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'}
      ]});

      assert.equal(true, group.touches({row: 7, col: 9, color: 'white'}));
      assert.equal(true, group.touches({row: 7, col: 9, color: 'black'}));
    });

    it('should return true if the stone is at the right', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'}
      ]});

      assert.equal(true, group.touches({row: 8, col: 11, color: 'white'}));
      assert.equal(true, group.touches({row: 8, col: 11, color: 'black'}));
    });

    it('should return true if the stone is at the bottom', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'}
      ]});

      assert.equal(true, group.touches({row: 9, col: 9, color: 'white'}));
      assert.equal(true, group.touches({row: 9, col: 9, color: 'black'}));
    });

    it('should return true if the stone is at the left', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'}
      ]});

      assert.equal(true, group.touches({row: 8, col: 7, color: 'white'}));
      assert.equal(true, group.touches({row: 8, col: 7, color: 'black'}));
    });


    it('should return false if the stone does not touch', function () {
      var group = new StoneGroup({stones: [
        {row: 8, col: 8, color: 'black'},
        {row: 8, col: 9, color: 'black'},
        {row: 8, col: 10, color: 'black'}
      ]});

      assert.equal(false, group.touches({row: 8, col: 12, color: 'white'}));
      assert.equal(false, group.touches({row: 8, col: 12, color: 'black'}));
    });
  });
});
