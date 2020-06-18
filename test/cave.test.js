"use strict";

import Cave, { DEFAULT_SIZE } from '../src/cave';
import { Tiles } from '../src/tile-server';


const defaultTemplate = {
  "width": 4,
  "height": 5,
  "depth": 1,
  "generator": "MockGenerator",
  "entrance": {'x':0,'y':0,'z':0}
};
let cave;

beforeAll((done) => {
  cave = new Cave(defaultTemplate);
  done();
});

afterAll((done) => {
  done();
});

beforeEach((done) => {
  done();
});

afterEach((done) => {
  done();
});


describe('cave creation', () => {
  test('should generate tiles according to default sizes', (done) => {
    let cave = new Cave();
    let map = cave.getMap();
    expect(map.getWidth()).toBe(DEFAULT_SIZE.width);
    expect(map.getHeight()).toBe(DEFAULT_SIZE.height);
    expect(map.getDepth()).toBe(DEFAULT_SIZE.depth);
    expect(map.getTiles().length).toBe(map.getDepth());
    expect(map.getTiles()[0].length).toBe(map.getHeight());
    expect(map.getTiles()[0][0].length).toBe(map.getWidth());
    expect(map.getTiles()[0][0][0].char).toBe('#');
    done();
  });

  test('should generate tiles according to template sizes', (done) => {
    let cave = new Cave({depth:3});
    let map = cave.getMap();
    expect(map.getWidth()).toBe(DEFAULT_SIZE.width);
    expect(map.getHeight()).toBe(DEFAULT_SIZE.height);
    expect(map.getDepth()).toBe(3);
    expect(map.getTiles().length).toBe(map.getDepth());
    expect(map.getTiles()[0].length).toBe(map.getHeight());
    expect(map.getTiles()[0][0].length).toBe(map.getWidth());
    expect(map.getTiles()[0][0][0].char).toBe('#');
    done();
  });

  test('should return null tiles outside of map', (done) => {
    let cave = new Cave(defaultTemplate);
    let map = cave.getMap();
    let tile = map.getTile(-1,0,0);
    expect(tile.getChar()).toBe(' ');
    expect(tile.getDescription()).toBe('(unknown)');
    tile = map.getTile(map.getWidth()+1,0,0);
    expect(tile.getChar()).toBe(' ');
    expect(tile.getDescription()).toBe('(unknown)');
    tile = map.getTile(0,-1,0);
    expect(tile.getChar()).toBe(' ');
    expect(tile.getDescription()).toBe('(unknown)');
    tile = map.getTile(0, map.getHeight()+1 ,0);
    expect(tile.getChar()).toBe(' ');
    expect(tile.getDescription()).toBe('(unknown)');
    tile = map.getTile(0,0,-1);
    expect(tile.getChar()).toBe(' ');
    expect(tile.getDescription()).toBe('(unknown)');
    done();
  });

  test('should generate tiles from map file', (done) => {
    let cave = new Cave(defaultTemplate);
    let map = cave.getMap();
    expect(map.getWidth()).toBe(defaultTemplate.width);
    expect(map.getHeight()).toBe(defaultTemplate.height);
    expect(map.getDepth()).toBe(defaultTemplate.depth);
    expect(map.getTiles().length).toBe(map.getDepth());
    expect(map.getTiles()[0].length).toBe(map.getHeight());
    expect(map.getTiles()[0][0].length).toBe(map.getWidth());
    let tile = map.getTiles()[0][0][0];
    expect(tile.getChar()).toBe('#');
    expect(tile.getForeground()).toBe('white');
    expect(tile.getBackground()).toBe('black');
    expect(tile.getRepresentation()).toBe('%c{white}%b{black}#%c{white}%b{black}');
    expect(tile.isDiggable()).toBe(true);
    expect(tile.isWalkable()).toBe(false);
    expect(tile.isBlockingLight()).toBe(true);
    expect(tile.getDescription()).toBe('mock wall');
    expect(cave.getEntrance()).toEqual({'x':0,'y':0,'z':0});
    done();
  });

  test('should connect floors by regions using random function', (done) => {
    let rand = (arr)=>{return arr[1];}
    let cave = new Cave({randFunc: rand});
    let map = cave.getMap();
    let tileLvl0 = map.getTiles()[0][1][0];
    let tileLvl1 = map.getTiles()[1][1][0];
    expect(tileLvl0).toBe(Tiles.stairsDownTile);
    expect(tileLvl1).toBe(Tiles.stairsUpTile);
    done();
  });

  test('should regions too small', (done) => {
    let cave = new Cave();
    let map = cave.getMap();
    let wasSpace = map.getTiles()[0][2][22];
    expect(wasSpace).toBe(Tiles.wallTile);
    done();
  });

  // test('should have specified number of items', (done) => {
  //   defaultTemplate.itemsPerFloor = 2;
  //   let cave = new Cave(defaultTemplate);
  //   let items = cave.getItems(0);
  //   expect(items.length).toBe(2);
  //   done();
  // });
});