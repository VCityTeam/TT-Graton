'use strict';
/* globals THREE */
import * as THREE from 'three';

var vertexGeometry = new THREE.SphereGeometry(2, 16, 16);
var vertexMaterial = new THREE.MeshLambertMaterial({
    color: 0xB7B7B7
});
var instanceMesh;

// instanciation des meshes
export function InitInstancedMesh(count) {
  instanceMesh = new THREE.InstancedMesh(vertexGeometry, vertexMaterial, count);
  return instanceMesh;
}

export function Vertex(i, id, pos) {
    this.id = id;
    this.pos = pos;
    const color = new THREE.Color();
    const matrix = new THREE.Matrix4();
    matrix.setPosition(pos.x, pos.y, pos.z);
    instanceMesh.setMatrixAt( i, matrix );
    color.setHex(Math.random() * 0xffffff);
    instanceMesh.setColorAt( i, color );
    instanceMesh.instanceMatrix.needsUpdate = true;
}


/**
 * Call this method to update the Vertex's mesh to its current
 * position co-ordinates.
 *
 */
Vertex.prototype.update = function(i) {
    const matrix = new THREE.Matrix4();
    matrix.setPosition(this.pos.x, this.pos.y, this.pos.z);
    instanceMesh.setMatrixAt( i, matrix );
    instanceMesh.instanceMatrix.needsUpdate = true;
};
