'use strict';
/* globals THREE */
import * as THREE from 'three';

export class Edge {
  constructor (source, target) {
    this.source = source;
    this.target = target;

    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
    const points = [];
    points.push( new THREE.Vector3(source.pos.x, source.pos.y, source.pos.z) );
    points.push( new THREE.Vector3(target.pos.x, target.pos.y, target.pos.z) );
    var edgeGeometry = new THREE.BufferGeometry().setFromPoints( points );
    edgeGeometry.verticesNeedUpdate = true;

    this.mesh = new THREE.Line( edgeGeometry, edgeMaterial );
  }


  update(){
    let points = [];
    points.push( new THREE.Vector3( this.source.pos.x, this.source.pos.y, this.source.pos.z ) );
    points.push( new THREE.Vector3( this.target.pos.x, this.target.pos.y, this.target.pos.z ) );
    this.mesh.geometry.setFromPoints(points);
    this.mesh.geometry.verticesNeedUpdate = true;
  }

}
