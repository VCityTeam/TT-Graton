'use strict';

import * as THREE from 'three';
import 'd3';
import 'd3-force-3d';   /// Watch out: MUST be imported after d3
import 'd3-octree';     /// d3-force-3d dependency that must be manually pulled
import { Vertex, InitInstancedMesh } from './Vertex.js';
import { Edge } from './Edge.js';

export class Graph{
  constructor(json, container=null){
    this.BB = {
      minX: -1500,
      maxX: 1500,
      minY: -1500,
      maxY: 1500,
      minZ: -1500,
      maxZ: 1500
    };
    this.json = json;
    this.vertices = [];
    this.edges = [];
    this.instancedMesh = null;
    this.graph = null;
    this.container = container ? container : new THREE.Object3D();
  }

  /**
  * This function loads a JSON file, reads nodes and links to build a graph object
  * Then it triggers node freezing and clears the 3D container
  **/
  load(){
    let self = this;

    d3.json(self.json).then(function(graph){
      console.log(graph);
      self.graph = graph;

      self.fixNodes(graph);
      self.emptyContainer();
      self.initNodesInstances(graph.nodes.length);
      self.initGraph(graph);
      self.initEdgesMeshes();
    }).then(function(){
      console.log("loaded!");
      return true;
    });
  }


  /**
  * This function loads a JSON file, reads nodes and links to build a graph object
  * @param {graph} a graph with free nodes which position need to be frozen
  * @returns {graph} the same graph object but with some fixed nodes
  **/
  fixNodes(graph){
    graph.nodes.forEach(node => {
      if(!node.data) return;

      if(node.data.coords){
        node.fx = node.data.coords[0];
        node.fy = node.data.coords[1];
        node.fz = node.data.coords[2];
      }
    });
    return graph;
  }

  /**
  * Remove all the meshes belonging to the graph from the given container (THREEJS 3D object)
  * @returns {THREE.Object3D} the empty container
  **/
  emptyContainer(){
    // edges
    let self = this;
    this.edges.forEach(function(e) {
        self.container.remove(e.mesh);
    });

    //nodes
    this.container.remove(this.instancedMesh);

    return this.container;
  }

  /**
   * Add all the node mesh instances belonging to this graph to the given THREE.js 3D object container.
   * @param {int} the number of nodes
   **/
  initNodesInstances(count){
    this.instancedMesh = InitInstancedMesh(count);
    this.container.add(this.instancedMesh);
  }

  /**
  * Add all the edges meshes belonging to this graph to the given THREE.js object container.
  **/
  initEdgesMeshes(){
    this.edges.forEach(function(e) {
      this.container.add(e.mesh);
    }.bind(this));
  }

  /**
   * Add an edge to the graph from source to vertex. The function will add vertices to
   * the graph such that from > to. Calls to invalid vertex id's are ignored silently.
   * @param {vertice} start node
   * @param {vertice} target node
   **/
  addEdge(source, target){
    var newEdge = new Edge(source, target);
    this.edges.push(newEdge);
  }

  /**
  * init the 3D graph by pushing new vertices and links given by a first force simulation
  * @param {graph} the graph to build in 3D
  **/
  initGraph(graph){
    this.vertices = [];
    this.edges = [];

    let nodes = graph.nodes;
    let links = graph.links;

    let self = this;

    // create set of vertices from graph nodes
    for(let i = 0; i < nodes.length; i++) {
        let nodePos = new THREE.Vector3(nodes[i].x,nodes[i].y,nodes[i].z);
        var newVertex = new Vertex(i, nodes[i].id, nodePos); // each vertice has the same ID as the opentheso entry
        this.vertices.push(newVertex);
    }

    // create the edges from graph links
    for(let j = 0; j < links.length; j++){
      const from = this.vertices.find((vertice) => vertice.id == links[j].source);
      const to = this.vertices.find((vertice) => vertice.id == links[j].target);
      this.addEdge(from, to);
    }

  }


  applyForceLayout(graph){
    let self = this;

    // allows to init unpinned nodes to a random position thanks to 3D force layout
    this.simulation = d3.forceSimulation(graph.nodes, 3);

    // TODO : find correct layout forces...
    // this.simulation.force("link", d3.forceLink().id(d => d.id).distance(0).strength(1))
    //   .force("charge", d3.forceManyBody().strength(-50))
    //   .force("x", d3.forceX())
    //   .force("y", d3.forceY())
    //   .force("z", d3.forceZ());

    console.log(graph.nodes);
    console.log(graph.links);

    this.simulation.force("link", d3.forceLink(graph.links).id(d => d.id) .distance(10).strength(1))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter())

    // layout is in progress
    this.simulation.on('tick', function() {

      // move each mesh node according to the simulated position
      self.vertices.forEach(function(v, i) {
        v.pos.set(self.graph.nodes[i].x, self.graph.nodes[i].y, self.graph.nodes[i].z);
      });
      self.update();

    })
    .on('end', function() {
      // simulation is done
      console.log("END");

      // final update of nodes positions
      self.update();
    });

  }

  update(){
    this.edges.forEach(function(e) {
        e.update();
    });

    this.vertices.forEach(function(v,i) {
        v.update(i);
    });
  }

};
